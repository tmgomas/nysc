<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\MemberStatus;

class CheckMembershipStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user has a member profile
        if (!$user->member) {
            abort(403, 'No member profile found.');
        }

        // Check if member is active
        if ($user->member->status !== MemberStatus::ACTIVE) {
            $message = match($user->member->status) {
                MemberStatus::PENDING => 'Your membership is pending approval.',
                MemberStatus::SUSPENDED => 'Your membership has been suspended.',
                MemberStatus::INACTIVE => 'Your membership is inactive.',
                default => 'Your membership status does not allow access.',
            };

            abort(403, $message);
        }

        // Check if member has overdue payments
        if ($user->member->hasOverduePayments()) {
            session()->flash('warning', 'You have overdue payments. Please settle them soon.');
        }

        return $next($request);
    }
}
