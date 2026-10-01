<?php

namespace App\Repositories;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Class TransactionRepository
 */
class TransactionRepository extends BaseRepository
{
    protected $fieldSearchable = [
        'tenant_id',
        'transaction_id',
        'amount',
        'type',
        'status',
        'meta',
        'user_id'
    ];

    /**
     * {@inheritDoc}
     */
    public function getFieldsSearchable()
    {
        return $this->fieldSearchable;
    }

    /**
     * {@inheritDoc}
     */
    public function model()
    {
        return Transaction::class;
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Support\Collection|mixed
     */
    public function getTransactions($perPage, $filter = null)
    {
        $search = $filter['search'] ?? null;

        $query = Transaction::withoutGlobalScopes()
            ->with(['user']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q2) use ($search) {
                    $q2->withoutGlobalScopes()
                        ->where(function ($subQuery) use ($search) {
                            $subQuery->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
