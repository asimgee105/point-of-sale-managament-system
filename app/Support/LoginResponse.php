<?php

namespace App\Support;

use App\Models\Language;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class LoginResponse
{
    public static function make(User $user): JsonResponse
    {
        $role = $user->roles->first();
        if (! $role) {
            return response()->json(['message' => 'No role is assigned to this account. Contact your administrator.'], 403);
        }

        $language = Language::where('iso_code', $user->language ?? 'en')->first()
            ?? Language::where('iso_code', 'en')->first();
        $user->language_id = $language?->id;
        $permissions = $user->getAllPermissions()->pluck('name')->values()->all();
        $token = $user->createToken('token')->plainTextToken;
        $user->last_name = $user->last_name ?? '';
        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        return response()->json([
            'data' => [
                'two_factor' => false,
                'token' => $token,
                'user' => $user,
                'roles' => $role->name,
                'expires_at' => config('sanctum.expiration'),
                'permissions' => $permissions,
            ],
            'message' => 'Logged in successfully.',
        ]);
    }
}
