<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RFIDController extends Controller
{
    /**
     * Verify RFID card data
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'rfid_data' => 'required|string',
        ]);

        try {
            $rfidData = trim($request->rfid_data);
            
            // Find member by RFID card ID
            $member = Member::where('rfid_card_id', $rfidData)->first();
            
            if ($member) {
                return response()->json([
                    'valid' => true,
                    'type' => 'member',
                    'data' => [
                        'member' => $member,
                        'rfid_data' => $rfidData,
                    ],
                    'message' => "Valid RFID card for {$member->calling_name}",
                ]);
            }

            return response()->json([
                'valid' => false,
                'message' => 'RFID card not associated with any member',
                'data' => [
                    'rfid_data' => $rfidData,
                ],
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Failed to verify RFID card: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Associate RFID card with a member
     */
    public function associate(Request $request): JsonResponse
    {
        $request->validate([
            'member_id' => 'required|exists:members,id',
            'rfid_card_id' => 'required|string',
        ]);

        try {
            $member = Member::findOrFail($request->member_id);
            
            // Check if RFID card is already associated with another member
            $existingMember = Member::where('rfid_card_id', $request->rfid_card_id)
                ->where('id', '!=', $member->id)
                ->first();

            if ($existingMember) {
                return response()->json([
                    'success' => false,
                    'message' => "RFID card is already associated with {$existingMember->calling_name}",
                ], 400);
            }

            $member->rfid_card_id = $request->rfid_card_id;
            $member->save();

            return response()->json([
                'success' => true,
                'message' => "RFID card successfully associated with {$member->calling_name}",
                'member' => $member,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to associate RFID card: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove RFID card association from a member
     */
    public function disassociate(Request $request): JsonResponse
    {
        $request->validate([
            'member_id' => 'required|exists:members,id',
        ]);

        try {
            $member = Member::findOrFail($request->member_id);
            $member->rfid_card_id = null;
            $member->save();

            return response()->json([
                'success' => true,
                'message' => "RFID card removed from {$member->calling_name}",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove RFID card: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Scan RFID card for check-in
     */
    public function scanCheckIn(Request $request): JsonResponse
    {
        $request->validate([
            'rfid_data' => 'required|string',
            'event_id' => 'nullable|integer',
        ]);

        $verificationResult = $this->verify($request);
        $verificationData = $verificationResult->getData(true);

        if (!$verificationData['valid']) {
            return response()->json($verificationData, 400);
        }

        $member = $verificationData['data']['member'];

        // You can add attendance logging here
        // For now, just return the member data
        return response()->json([
            'success' => true,
            'type' => 'member',
            'member' => $member,
            'message' => "Check-in successful for {$member['calling_name']}",
            'checked_in_at' => now()->toIso8601String(),
        ]);
    }
}
