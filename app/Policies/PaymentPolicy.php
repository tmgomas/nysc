<?php

namespace App\Policies;

use App\Models\{Payment, User};
use App\Enums\PaymentStatus;

class PaymentPolicy
{
    /**
     * Determine if the user can view any payments.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view_payments');
    }

    /**
     * Determine if the user can view the payment.
     */
    public function view(User $user, Payment $payment): bool
    {
        // Admins can view all
        if ($user->hasPermissionTo('view_payments')) {
            return true;
        }

        // Members can view their own payments
        return $user->member?->id === $payment->member_id;
    }

    /**
     * Determine if the user can create payments.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_payments');
    }

    /**
     * Determine if the user can verify the payment.
     */
    public function verify(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo('verify_payments')
            && $payment->status === PaymentStatus::PAID;
    }

    /**
     * Determine if the user can delete the payment.
     */
    public function delete(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo('delete_payments')
            && $payment->status === PaymentStatus::PENDING;
    }
}
