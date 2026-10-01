<?php

namespace App\Http\Middleware;

use App\Models\SadminSetting;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLanguage
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sadminSetting = SadminSetting::where('key', 'show_landing_page')->first()->value ?? '1';
        if ($sadminSetting) {
            $userId = session()->get('auth');
            $localLanguage = session()->get('locale');
    
            if ($localLanguage) {
                App::setLocale($localLanguage);
            } elseif ($userId) {
                $user = User::find($userId);
                App::setLocale($user->language);
            } else {
                App::setLocale(getDefaultLanguage()->iso_code);
            }
    
            return $next($request);
        } else {
            return redirect()->route('app');
        }
    }
}
