<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PaymentResource;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        protected \App\Services\PaymentService $paymentService
    ) {}

    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $payments = $this->paymentService->getMemberPayments($member);

        return PaymentResource::collection($payments);
    }
}
