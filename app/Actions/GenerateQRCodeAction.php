<?php

namespace App\Actions;

use App\Models\Member;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;
use BaconQrCode\Common\ErrorCorrectionLevel;
use Illuminate\Support\Facades\Storage;

class GenerateQRCodeAction
{
    /**
     * Generate QR code for member attendance
     */
    public function execute(Member $member): string
    {
        // Generate QR code data (member ID + verification token)
        $qrData = $this->generateQRData($member);

        // Generate QR code image using BaconQrCode
        $renderer = new GDLibRenderer(300, 1);
        $writer = new Writer($renderer);
        
        $qrCode = $writer->writeString(
            $qrData, 
            'utf-8', 
            ErrorCorrectionLevel::H()
        );

        // Save QR code to storage
        $filename = "qr-codes/member-{$member->member_number}.png";
        Storage::disk('public')->put($filename, $qrCode);

        return Storage::disk('public')->url($filename);
    }

    /**
     * Generate QR code data with verification
     */
    protected function generateQRData(Member $member): string
    {
        $data = [
            'member_id' => $member->id,
            'member_number' => $member->member_number,
            'verification' => hash('sha256', $member->id . config('app.key')),
        ];

        return json_encode($data);
    }

    /**
     * Verify QR code data
     */
    public function verify(string $qrData): ?Member
    {
        try {
            $data = json_decode($qrData, true);
            
            if (!isset($data['member_id']) || !isset($data['verification'])) {
                return null;
            }

            $member = Member::find($data['member_id']);
            
            if (!$member) {
                return null;
            }

            // Verify hash
            $expectedHash = hash('sha256', $member->id . config('app.key'));
            
            if ($data['verification'] !== $expectedHash) {
                return null;
            }

            return $member;
        } catch (\Exception $e) {
            return null;
        }
    }
}
