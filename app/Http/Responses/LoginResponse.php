<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;

class LoginResponse implements LoginResponseContract, TwoFactorLoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $user = Auth::user();

        if ($user->hasRole(['super_admin', 'admin'])) {
            return redirect()->intended(route('admin.dashboard'));
        }

        if ($user->hasRole('coach')) {
            return redirect()->intended(route('coach.dashboard'));
        }

        // Default path for members or other users
        return redirect()->intended(config('fortify.home'));
    }
}
