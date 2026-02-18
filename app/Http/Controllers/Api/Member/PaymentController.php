<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PaymentResource;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $member = $request->user()->member;

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $payments = $member->payments()
            ->with(['program', 'items.program'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return PaymentResource::collection($payments);
    }
}
