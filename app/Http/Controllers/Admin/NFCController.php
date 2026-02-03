<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NFCController extends Controller
{
    /**
     * Verify NFC tag data
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'nfc_data' => 'required|string',
        ]);

        try {
            $nfcData = json_decode($request->nfc_data, true);
            
            if (!$nfcData) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Invalid NFC data format',
                ], 400);
            }

            // Extract member information from NFC data
            $memberNumber = null;
            $serialNumber = $nfcData['serialNumber'] ?? null;

            // Check if NFC tag contains member data in records
            if (isset($nfcData['records']) && is_array($nfcData['records'])) {
                foreach ($nfcData['records'] as $record) {
                    if (isset($record['text'])) {
                        // Try to parse as JSON
                        $recordData = json_decode($record['text'], true);
                        if ($recordData && isset($recordData['member_number'])) {
                            $memberNumber = $recordData['member_number'];
                            break;
                        }
                    }
                }
            }

            // If no member number found in records, try to find by serial number
            if (!$memberNumber && $serialNumber) {
                $member = Member::where('nfc_tag_id', $serialNumber)->first();
                
                if ($member) {
                    return response()->json([
                        'valid' => true,
                        'type' => 'member',
                        'data' => [
                            'member' => $member->load(['batch', 'district']),
                            'nfc_data' => $nfcData,
                        ],
                        'message' => "Valid NFC tag for {$member->calling_name}",
                    ]);
                }
            }

            // If member number found, verify member exists
            if ($memberNumber) {
                $member = Member::where('member_number', $memberNumber)->first();
                
                if ($member) {
                    return response()->json([
                        'valid' => true,
                        'type' => 'member',
                        'data' => [
                            'member' => $member->load(['batch', 'district']),
                            'nfc_data' => $nfcData,
                        ],
                        'message' => "Valid NFC tag for {$member->calling_name}",
                    ]);
                }
            }

            return response()->json([
                'valid' => false,
                'message' => 'NFC tag not associated with any member',
                'data' => [
                    'nfc_data' => $nfcData,
                ],
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Failed to verify NFC tag: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Associate NFC tag with a member
     */
    public function associate(Request $request): JsonResponse
    {
        $request->validate([
            'member_id' => 'required|exists:members,id',
            'nfc_tag_id' => 'required|string',
        ]);

        try {
            $member = Member::findOrFail($request->member_id);
            
            // Check if NFC tag is already associated with another member
            $existingMember = Member::where('nfc_tag_id', $request->nfc_tag_id)
                ->where('id', '!=', $member->id)
                ->first();

            if ($existingMember) {
                return response()->json([
                    'success' => false,
                    'message' => "NFC tag is already associated with {$existingMember->calling_name}",
                ], 400);
            }

            $member->nfc_tag_id = $request->nfc_tag_id;
            $member->save();

            return response()->json([
                'success' => true,
                'message' => "NFC tag successfully associated with {$member->calling_name}",
                'member' => $member,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to associate NFC tag: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove NFC tag association from a member
     */
    public function disassociate(Request $request): JsonResponse
    {
        $request->validate([
            'member_id' => 'required|exists:members,id',
        ]);

        try {
            $member = Member::findOrFail($request->member_id);
            $member->nfc_tag_id = null;
            $member->save();

            return response()->json([
                'success' => true,
                'message' => "NFC tag removed from {$member->calling_name}",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove NFC tag: ' . $e->getMessage(),
            ], 500);
        }
    }
}
