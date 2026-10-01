<?php

namespace App\Http\Controllers\Sadmin;

use App\Http\Controllers\AppBaseController;
use App\Models\Role;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

/**
 * Class DashboardAPIController
 */
class DashboardAPIController extends AppBaseController
{
    public function dashboard(): JsonResponse
    {
        $data = [
            'active_users' => User::withoutGlobalScope('tenant')
                ->whereHas('roles', fn($q) => $q->where('name', Role::ADMIN))
                ->whereNotNull('email_verified_at')
                ->count(),
            'active_subscriptions' => Subscription::where('status', Subscription::ACTIVE)->count(),
            'total_subscriptions' => Subscription::count(),
            'earning' => Subscription::where('is_paid', 1)->sum('payable_amount'),
        ];

        // Fetch the 5 most recent registered users
        $data['recent_users'] = User::withoutGlobalScope('tenant')
            ->whereHas('roles', fn($q) => $q->where('name', Role::ADMIN))->latest()->take(5)->get();

        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        $earnings = Subscription::where('is_paid', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->groupBy(function ($q) {
                return Carbon::parse($q->created_at)->format('Y-m-d');
            });

        $labels = [];
        $dataset = [];

        foreach (CarbonPeriod::create($startDate, '1 day', $endDate) as $date) {
            $formattedDate = $date->format('Y-m-d');
            $labels[] = $date->format('M d'); // Format for better readability
            $dataset[] = isset($earnings[$formattedDate])
                ? $earnings[$formattedDate]->sum('payable_amount')
                : 0;
        }

        $data['earning_chart'] = [
            'labels' => $labels,
            'dataset' => $dataset,
        ];

        return $this->sendResponse($data, 'Dashboard information retrieved successfully');
    }
}
