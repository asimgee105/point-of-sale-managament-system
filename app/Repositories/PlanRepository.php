<?php

namespace App\Repositories;

use App\Models\Plan;
use Exception;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class PlanRepository
 */
class PlanRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'name',
        'price',
        'created_at',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return Plan::class;
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function storePlan($input)
    {
        try {
            DB::beginTransaction();

            // Old Assign While Register
            if (isset($input['assign_while_register']) && $input['assign_while_register']) {
                Plan::where('assign_while_register', true)->update(['assign_while_register' => false]);
            }

            $plan = $this->create($input);

            $plan->planFeature()->create([
                'pos_management' => in_array('pos_management', $input['features']),
                'reports' => in_array('reports', $input['features']),
                'emails_support' => in_array('emails_support', $input['features']),
                'sms_support' => in_array('sms_support', $input['features']),
                'inventory_management' => in_array('inventory_management', $input['features']),
                'adjustments' => in_array('adjustments', $input['features']),
                'roles_permission' => in_array('roles_permission', $input['features'])
            ]);

            DB::commit();

            return $plan;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function updatePlan($input, $id)
    {
        try {
            DB::beginTransaction();

            // Old Assign While Register
            if (isset($input['assign_while_register']) && $input['assign_while_register']) {
                Plan::where('assign_while_register', true)->update(['assign_while_register' => false]);
            }

            $plan = $this->update($input, $id);

            $plan->planFeature()->update([
                'pos_management' => in_array('pos_management', $input['features']),
                'reports' => in_array('reports', $input['features']),
                'emails_support' => in_array('emails_support', $input['features']),
                'sms_support' => in_array('sms_support', $input['features']),
                'inventory_management' => in_array('inventory_management', $input['features']),
                'adjustments' => in_array('adjustments', $input['features']),
                'roles_permission' => in_array('roles_permission', $input['features'])
            ]);

            DB::commit();

            return $plan;
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function getPlans($perPage)
    {
        return $this->paginate($perPage);
    }
}
