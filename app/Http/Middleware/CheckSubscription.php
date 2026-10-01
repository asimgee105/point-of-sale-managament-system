<?php

namespace App\Http\Middleware;

use App\Models\Role;
use App\Models\Store;
use App\Models\Subscription;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    // Define patterns that always require subscription check
    protected array $alwaysCheckRoutes = [
        'api/change-status/*',
        'api/users/status/*',
        'api/sales-return/paid/*',
        'api/taxes/status-change/*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('GET') && !$this->matchesProtectedRoute($request)) {
            return $next($request);
        }

        $user = Auth::user();

        if ($user->hasRole(Role::SUPER_ADMIN)) {
            return $next($request);
        }

        if ($user->hasRole(Role::ADMIN) && $user->subscriptions->count() > 0) {
            if ($this->hasActiveSubscription($user->id)) {
                return $next($request);
            }
        } else {
            $store = Store::where('tenant_id', $user->tenant_id)->first();
            if ($store && $this->hasActiveSubscription($store->user_id)) {
                return $next($request);
            }
        }

        return response()->json([
            'error' => true,
            'message' => 'You must have an active subscription to access this resource.',
        ], 403);
    }

    private function hasActiveSubscription($userId): bool
    {
        $activeSubscription = Subscription::where('user_id', $userId)
            ->where('status', Subscription::ACTIVE)
            ->first();

        return $activeSubscription && $activeSubscription->end_date >= now();
    }

    private function matchesProtectedRoute(Request $request): bool
    {
        foreach ($this->alwaysCheckRoutes as $pattern) {
            if (Str::is($pattern, $request->path())) {
                return true;
            }
        }

        return false;
    }
}
