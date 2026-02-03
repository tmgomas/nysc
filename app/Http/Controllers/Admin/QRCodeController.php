<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Services\QRCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class QRCodeController extends Controller
{
    public function __construct(
        private QRCodeService $qrCodeService
    ) {}

    /**
     * Generate QR code for a member
     */
    public function generateMemberQRCode(Member $member): JsonResponse
    {
        try {
            $qrCodePath = $this->qrCodeService->generateMemberQRCode($member);
            $qrCodeUrl = asset('storage/' . $qrCodePath);

            return response()->json([
                'success' => true,
                'qr_code_url' => $qrCodeUrl,
                'qr_code_path' => $qrCodePath,
                'message' => 'QR code generated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get member QR code (generate if doesn't exist)
     */
    public function getMemberQRCode(Member $member): JsonResponse
    {
        try {
            $qrCodeUrl = $this->qrCodeService->getMemberQRCodeUrl($member);

            return response()->json([
                'success' => true,
                'qr_code_url' => $qrCodeUrl,
                'member' => [
                    'id' => $member->id,
                    'member_number' => $member->member_number,
                    'calling_name' => $member->calling_name,
                    'full_name' => $member->full_name,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get QR code: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download member QR code
     */
    public function downloadMemberQRCode(Member $member): Response
    {
        $qrCodePath = $this->qrCodeService->generateMemberQRCode($member);
        $fullPath = storage_path('app/public/' . $qrCodePath);

        return response()->download(
            $fullPath,
            "member_{$member->member_number}_qrcode.png"
        );
    }

    /**
     * Verify QR code
     */
    public function verifyQRCode(Request $request): JsonResponse
    {
        $request->validate([
            'qr_data' => 'required|string',
        ]);

        $result = $this->qrCodeService->verifyQRCode($request->qr_data);

        return response()->json($result);
    }

    /**
     * Scan QR code for check-in
     */
    public function scanCheckIn(Request $request): JsonResponse
    {
        $request->validate([
            'qr_data' => 'required|string',
            'event_id' => 'nullable|integer',
        ]);

        $verificationResult = $this->qrCodeService->verifyQRCode($request->qr_data);

        if (!$verificationResult['valid']) {
            return response()->json($verificationResult, 400);
        }

        // If it's a member QR code, record the check-in
        if ($verificationResult['type'] === 'member') {
            $member = $verificationResult['data']['member'];
            
            // You can add attendance logging here
            // For now, just return the member data
            return response()->json([
                'success' => true,
                'type' => 'member',
                'member' => $member,
                'message' => "Check-in successful for {$member->calling_name}",
                'checked_in_at' => now()->toIso8601String(),
            ]);
        }

        return response()->json($verificationResult);
    }

    /**
     * Bulk generate QR codes for members
     */
    public function bulkGenerateQRCodes(Request $request): JsonResponse
    {
        $request->validate([
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:members,id',
        ]);

        $generated = [];
        $failed = [];

        foreach ($request->member_ids as $memberId) {
            try {
                $member = Member::findOrFail($memberId);
                $qrCodePath = $this->qrCodeService->generateMemberQRCode($member);
                $generated[] = [
                    'member_id' => $memberId,
                    'qr_code_url' => asset('storage/' . $qrCodePath),
                ];
            } catch (\Exception $e) {
                $failed[] = [
                    'member_id' => $memberId,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'generated' => count($generated),
            'failed' => count($failed),
            'data' => [
                'generated' => $generated,
                'failed' => $failed,
            ],
        ]);
    }
}
