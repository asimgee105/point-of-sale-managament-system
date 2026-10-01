<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateChangePasswordRequest;
use App\Http\Requests\UpdateChangeUserPasswordRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\POSRegister;
use App\Models\Role;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserStore;
use App\Repositories\UserRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Class UserAPIController
 */
class UserAPIController extends AppBaseController
{
    /** @var UserRepository */
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function index(Request $request): UserCollection
    {
        $perPage = getPageSize($request);
        $users = $this->userRepository->getUsers($perPage);
        UserResource::usingWithCollection();

        return new UserCollection($users);
    }

    public function store(CreateUserRequest $request): UserResource
    {
        $input = $request->all();
        $user = $this->userRepository->storeUser($input);

        return new UserResource($user);
    }

    public function show($id): UserResource
    {
        $loginUserId = Auth::id();
        $userStore = UserStore::where('user_id', $loginUserId)->first();
        $storeUserId = $userStore ? $userStore->store->user_id : $loginUserId;
        $allStoreTenants = Store::where('user_id', $storeUserId)->pluck('tenant_id')->toArray();

        if (!empty($allStoreTenants)) {
            $query = $this->userRepository->withoutGlobalScope('tenant')
                ->whereIn('tenant_id', $allStoreTenants);
        } else {
            $query = $this->userRepository;
        }

        $user = $query->find($id);

        return new UserResource($user);
    }

    /**
     * @return UserResource|JsonResponse
     */
    public function update(UpdateUserRequest $request, $user)
    {
        $loginUserId = Auth::id();
        $userStore = UserStore::where('user_id', $loginUserId)->first();
        $storeUserId = $userStore ? $userStore->store->user_id : $loginUserId;
        $allStoreTenants = Store::where('user_id', $storeUserId)->pluck('tenant_id')->toArray();

        if (!empty($allStoreTenants)) {
            $query = $this->userRepository->withoutGlobalScope('tenant')
                ->whereIn('tenant_id', $allStoreTenants);
        } else {
            $query = $this->userRepository;
        }
        $user = $query->find($user);

        if (Auth::id() == $user->id) {
            return $this->sendError(__('messages.error.user_cant_updated'));
        }
        $input = $request->all();
        $user = $this->userRepository->updateUser($input, $user->id);

        return new UserResource($user);
    }

    public function destroy(Request $request): JsonResponse
    {
        $ids = $request->id;

        if (empty($ids)) {
            return $this->sendError('Invalid request.');
        }

        $failed = [];

        foreach ($ids as $id) {
            $user = User::withoutGlobalScope('tenant')->find($id);
            if (empty($user)) {
                $failed[] = [
                    'id' => $id,
                    'name' => 'We can\'t find a user ' . $id,
                ];
                continue;
            }
            if (Auth::id() == $id) {
                $failed[] = [
                    'id' => $id,
                    'name' => $user->full_name ?? '',
                ];
                continue;
            }

            if (Store::where('user_id', $id)->exists()) {
                $failed[] = [
                    'id' => $id,
                    'name' => $user->full_name ?? '',
                ];
                continue;
            }

            $user->delete();
        }

        if (count($ids) == 1 && count($failed) > 0) {
            return $this->sendError(__('messages.error.user_cant_delete'));
        }

        $message = count($ids) == 1 ? 'User deleted successfully.' : 'Users deleted successfully.';

        return $this->sendResponse([
            'show_model' => count($failed) > 0,
            'ids' => $failed,
        ], $message);
    }

    public function editProfile(): UserResource
    {
        $user = Auth::user();

        return new UserResource($user);
    }

    public function updateProfile(UpdateUserProfileRequest $request): UserResource
    {
        $input = $request->all();
        $updateUser = $this->userRepository->updateUserProfile($input);

        return new UserResource($updateUser);
    }

    public function changePassword(UpdateChangePasswordRequest $request): JsonResponse
    {
        $input = $request->all();
        try {
            $this->userRepository->updatePassword($input);

            return $this->sendSuccess(__('messages.success.password_updated'));
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }
    public function changeUserPassword(UpdateChangeUserPasswordRequest $request): JsonResponse
    {
        $input = $request->all();
        try {
            $this->userRepository->updateUserPassword($input);

            return $this->sendSuccess(__('messages.success.password_updated'));
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    public function updateLanguage(Request $request): JsonResponse
    {
        $language = $request->get('language');
        $user = Auth::user();
        $user->update([
            'language' => $language,
        ]);

        return $this->sendResponse($user->language, 'Language Updated Successfully');
    }

    public function config(Request $request)
    {
        $user = Auth::user();

        $checkSubscription = false;
        $storeModal = false;
        $isSuperAdmin = true;
        $isSubUser = false;
        $planExpireNotification = false;
        $remainingDaysOfSubscription = 0;

        if (!$user->hasRole(Role::SUPER_ADMIN)) {
            $isSuperAdmin = false;
            if ($user->hasRole(Role::ADMIN) && $user->subscriptions->count() > 0) {
                $activeSubscription = Subscription::where('user_id', $user->id)->where('status', Subscription::ACTIVE)->first();
                if (!empty($activeSubscription)) {
                    $checkSubscription = $activeSubscription->end_date <= Carbon::now();

                    // Calculate remaining days and plan expiry notification
                    $remainingDaysOfSubscription = Carbon::now()->diffInDays(Carbon::parse($activeSubscription->end_date), false);
                    $notificationDays = (int) getSadminSettingValue('plan_expire_notification_day');
                    if ($remainingDaysOfSubscription <= $notificationDays) {
                        $planExpireNotification = true;
                    }
                }
            } else {
                $isSubUser = true;
                $store = Store::where('tenant_id', $user->tenant_id)->first();
                $activeSubscription = Subscription::where('user_id', $store->user_id)->where('status', Subscription::ACTIVE)->first();
                if (!empty($activeSubscription)) {
                    $checkSubscription = $activeSubscription->end_date <= Carbon::now();

                    $remainingDaysOfSubscription = Carbon::now()->diffInDays(Carbon::parse($activeSubscription->end_date), false);
                    $notificationDays = (int) getSadminSettingValue('plan_expire_notification_day');
                    if ($remainingDaysOfSubscription > 0 && $remainingDaysOfSubscription <= $notificationDays) {
                        $planExpireNotification = true;
                    }
                }
                $userActiveStore = Store::where('tenant_id', $user->tenant_id)->where('status', 1)->first();
                $userStoreAvailable = $userActiveStore ? UserStore::where('user_id', $user->id)->where('store_id', $userActiveStore->id)->first() : null;
                if (!empty($userStoreAvailable)) {
                    $storeModal = false;
                } else {
                    $userStores = UserStore::where('user_id', $user->id)->get();
                    if ($userStores->count() > 0) {
                        foreach ($userStores as $userStore) {
                            if ($userStore->store->status == 1) {
                                $storeModal = false;
                                $user->update([
                                    'tenant_id' => $userStore->store->tenant_id
                                ]);
                                break;
                            } else {
                                $userStore->delete();
                                $storeModal = true;
                            }
                        }
                    } else {
                        $storeModal = true;
                    }
                }
            }
        }

        $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();

        $currentSubscription = Subscription::where('user_id', $user->id)->where('status', Subscription::ACTIVE)->first();
        if (!empty($currentSubscription) && isset($currentSubscription->plan->planFeature)) {
            $subscriptionFeature = $currentSubscription->plan->planFeature;
            if (!$subscriptionFeature->pos_management) {
                $userPermissions = array_values(array_diff($userPermissions, ["manage_pos_screen"]));
            }
            if (!$subscriptionFeature->reports) {
                $userPermissions = array_values(array_diff($userPermissions, ["manage_reports"]));
            }
            if (!$subscriptionFeature->emails_support) {
                $userPermissions = array_values(array_diff($userPermissions, ["manage_email_templates"]));
            }
            if (!$subscriptionFeature->sms_support) {
                $userPermissions = array_values(array_diff($userPermissions, ["manage_sms_templates", "manage_sms_apis"]));
            }
            if (!$subscriptionFeature->inventory_management) {
                $userPermissions = array_values(array_diff($userPermissions, []));
            }
            if (!$subscriptionFeature->adjustments) {
                $userPermissions = array_values(array_diff($userPermissions, ["manage_adjustments"]));
            }
            if (!$subscriptionFeature->roles_permission) {
                $userPermissions = array_values(array_diff($userPermissions, ["manage_roles"]));
            }
        }

        $composerFile = file_get_contents('../composer.json');
        $composerData = json_decode($composerFile, true);
        $currentVersion = isset($composerData['version']) ? $composerData['version'] : '';
        $dateFormat = getSettingValue('date_format');

        $openRegister = POSRegister::where('user_id', Auth::id())
            ->whereNull('closed_at')
            ->exists();

        return $this->sendResponse([
            'store_name' => getActiveStoreName(),
            'permissions' => $userPermissions,
            'version' => $currentVersion,
            'date_format' => $dateFormat,
            'store_modal' => $storeModal,
            'is_super_admin' => $isSuperAdmin,
            'is_sub_user' => $isSubUser,
            'is_expired' => $checkSubscription,
            'no_of_stores' => $currentSubscription->plan->no_of_stores ?? 0,
            'is_version' => getSadminSettingValue('show_version_on_footer'),
            'is_currency_right' => $isSuperAdmin ? getSadminSettingValue('is_currency_right') : getSettingValue('is_currency_right'),
            'thousands_separator' => $isSuperAdmin ? getSadminSettingValue('thousands_separator') : getSettingValue('thousands_separator'),
            'decimal_separator' => $isSuperAdmin ? getSadminSettingValue('decimal_separator') : getSettingValue('decimal_separator'),
            'decimal_places' => $isSuperAdmin ? getSadminSettingValue('decimal_places') : getSettingValue('decimal_places'),
            'open_register' => $openRegister ? false : true,
            'use_dynamic_smtp' => config('mail.use_dynamic_smtp') ?? false,
            'plan_expire_notification' => $planExpireNotification,
            'remaining_days_of_subscription' => $remainingDaysOfSubscription,
            'two_factor_enabled' => $user->two_factor_enabled,
            'enable_nepali_datepicker' => $isSuperAdmin ? (getSadminSettingValue('enable_nepali_datepicker') ?? false) : (getSettingValue('enable_nepali_datepicker') ?? false),
        ], 'Config retrieved successfully.');
    }

    public function statusUpdate($user_id): JsonResponse
    {
        $user = User::withoutGlobalScope('tenant')->findOrFail($user_id);
        $user->status = $user->status == 1 ? 0 : 1;
        $user->save();

        return $this->sendSuccess(__('messages.success.status_updated'));
    }
}
