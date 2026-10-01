<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateMainProductRequest;
use App\Http\Requests\UpdateMainProductRequest;
use App\Http\Resources\MainProductCollection;
use App\Http\Resources\MainProductResource;
use App\Models\MainProduct;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\Role;
use App\Models\SaleItem;
use App\Models\UserWarehouse;
use App\Models\VariationProduct;
use App\Repositories\MainProductRepository;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class MainProductAPIController extends AppBaseController
{
    /** @var MainProductRepository */
    private $mainProductRepository;

    public function __construct(MainProductRepository $mainProductRepository)
    {
        $this->mainProductRepository = $mainProductRepository;
    }


    public function index(Request $request)
    {
        $perPage = getPageSize($request);
        $products = MainProduct::query();
        $warehouseId = $request->get('warehouse_id') ?? null;
        $search = $request->filter['search'] ?? null;

        if (!isAdmin()) {
            $products->whereHas('products.stock', function ($q) {
                $q->whereIn('manage_stocks.warehouse_id', getLoginUserWarehouseIds());
            });
            if ($warehouseId && !in_array($warehouseId, getLoginUserWarehouseIds())) {
                $products->whereKey([]);
                $products = $products->paginate($perPage);

                MainProductResource::usingWithCollection();
                return new MainProductCollection($products);
            }
        }

        if (!empty($search)) {
            $products->where(function ($query) use ($search) {
                $query->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%")
                    ->orWhere('product_unit', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%")
                    
                    // 🔗 Search inside relations
                    ->orWhereHas('products.brand', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('products.productCategory', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('products', function ($q) use ($search) {
                        $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('code', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($request->get('product_unit')) {
            $products->where('product_unit', $request->get('product_unit'));
        }

        if ($request->get('brand_id')) {
            $products->whereHas('products.brand', function ($q) use ($request) {
                $q->where('brands.id', $request->get('brand_id'));
            });
        }

        if ($request->get('product_category_id')) {
            $products->whereHas('products.productCategory', function ($q) use ($request) {
                $q->where('product_categories.id', $request->get('product_category_id'));
            });
        }

        if ($warehouseId && $warehouseId !== 'null') {
            $products->whereHas('products.stock', function ($q) use ($warehouseId) {
                $q->where('manage_stocks.warehouse_id', $warehouseId);
            })->with([
                'products.stock' => function ($q) use ($warehouseId) {
                    $q->where('manage_stocks.warehouse_id', $warehouseId);
                }
            ]);
        }

        $sort = $request->get('sort');

        if ($sort) {
            $direction = 'asc';

            if (str_starts_with($sort, '-')) {
                $direction = 'desc';
                $sort = ltrim($sort, '-');
            }

            $allowedSorts = ['name', 'code', 'product_unit', 'created_at', 'id'];

            if (in_array($sort, $allowedSorts)) {
                $products->orderBy($sort, $direction);
            } else {
                $products->orderBy('id', 'desc');
            }
        } else {
            $products->orderBy('id', 'desc');
        }

        $products = $products->paginate($perPage);
        MainProductResource::usingWithCollection();

        return new MainProductCollection($products);
    }

    public function show($id): MainProductResource
    {
        /** @var MainProduct $mainProduct */
        $mainProduct = $this->mainProductRepository->find($id);

        return new MainProductResource($mainProduct);
    }

    public function store(CreateMainProductRequest $request)
    {
        $input = $request->all();

        try {
            DB::beginTransaction();

            $productRepo = app(ProductRepository::class);
            $mainProduct = MainProduct::create([
                'name' => $input['name'],
                'code' => $input['product_code'],
                'product_unit' => $input['product_unit'],
                'product_type' => $input['product_type'],
            ]);

            if (isset($input['images']) && !empty($input['images'])) {
                foreach ($input['images'] as $image) {
                    $product['image_url'] = $mainProduct->addMedia($image)->toMediaCollection(
                        MainProduct::PATH,
                        config('app.media_disc')
                    );
                }
            }

            $input['main_product_id'] = $mainProduct->id;
            if ($input['product_type'] == 2) {
                $commonProductInput = Arr::except($input, 'variation_data');

                $variationData = $input['variation_data'];
                foreach ($variationData as $key => $variation) {
                    $variation = array_merge($variation, $commonProductInput);
                    $product = $productRepo->storeProduct($variation);

                    VariationProduct::create([
                        'product_id' => $product->id,
                        'variation_id' => $variation['variation_id'],
                        'variation_type_id' => $variation['variation_type_id'],
                        'main_product_id' => $mainProduct->id,
                    ]);
                }
            } else {
                $product = $productRepo->storeProduct($input);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }

        return new MainProductResource($product);
    }

    public function update(UpdateMainProductRequest $request, $id): MainProductResource
    {
        $input = $request->all();
        $mainProduct = MainProduct::find($id);

        if ($mainProduct->product_type == MainProduct::SINGLE_PRODUCT && Product::where('code', $input['product_code'])->whereNot('main_product_id', $mainProduct->id)->exists()) {
            throw new UnprocessableEntityHttpException(__('validation.unique', ['attribute' => __('messages.pdf.product_code')]));
        }

        $mainProduct->update([
            'name' => $input['name'],
            'code' => $input['product_code'],
            'product_unit' => $input['product_unit'],
        ]);


        if (isset($input['images']) && !empty($input['images'])) {
            foreach ($input['images'] as $image) {
                $product['image_url'] = $mainProduct->addMedia($image)->toMediaCollection(
                    MainProduct::PATH,
                    config('app.media_disc')
                );
            }
        }

        $products = Product::with('variationType')->where('main_product_id', $id)->get();

        foreach ($products as $product) {
            if ($mainProduct->product_type == MainProduct::VARIATION_PRODUCT) {
                $input['code'] = $product->code ?? $input['product_code'];
            } else {
                $input['code'] = $input['product_code'];
            }
            $productRepo = app(ProductRepository::class);
            $product = $productRepo->updateProduct($input, $product->id);
        }

        return new MainProductResource($product);
    }

    public function destroy(Request $request)
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request.');
        }

        $failed = [];

        foreach ($ids as $id) {
            try {
                DB::beginTransaction();
                $products = Product::where('main_product_id', $id)->get();

                foreach ($products as $product) {

                    $purchaseItemModels = [
                        PurchaseItem::class,
                    ];
                    $saleItemModels = [
                        SaleItem::class,
                    ];

                    if(canDelete($purchaseItemModels, 'product_id', $product->id)){
                        $failed[] = [
                            'id' => $id,
                            'name' => $product->name,
                            'message' => 'This product is used in a purchase',
                        ];
                        DB::rollBack();
                        continue 2;
                    }

                    if(canDelete($saleItemModels, 'product_id', $product->id)){
                        $failed[] = [
                            'id' => $id,
                            'name' => $product->name,
                            'message' => 'This product is used in a sale',
                        ];
                        DB::rollBack();
                        continue 2;
                    }
                    
                    if (File::exists(Storage::path('product_barcode/barcode-PR_' . $product->id . '.png'))) {
                        File::delete(Storage::path('product_barcode/barcode-PR_' . $product->id . '.png'));
                    }
                    $product->delete();
                }

                VariationProduct::where('main_product_id', $id)->delete();
                
                $this->mainProductRepository->delete($id);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $failed[] = [
                    'id' => $id,
                    'name' => $e->getMessage(),
                ];
            }
        }

        if (count($ids) == 1 && count($failed) > 0) {
            $firstError = $failed[0]['message'] ?? __('messages.error.product_cant_deleted');
            return $this->sendError($firstError);
        }

        $message = count($ids) == 1 ? __('Product deleted successfully') : __('Products deleted successfully');

        return $this->sendResponse([
            'show_model' => count($failed) > 0,
            'ids' => $failed,
        ], $message);
    }
}
