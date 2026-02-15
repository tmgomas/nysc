<?php

namespace App\Services;

use App\Models\Member;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Storage;

class QRCodeService
{
    /**
     * Generate QR code for a member
     */
    public function generateMemberQRCode(Member $member): string
    {
        $qrData = $this->prepareMemberData($member);
        
        $renderer = new ImageRenderer(
            new RendererStyle(300),
            new SvgImageBackEnd()
        );
        
        $writer = new Writer($renderer);
        $qrCodeContent = $writer->writeString(json_encode($qrData));

        // Save QR code to storage
        $fileName = "qrcodes/member_{$member->id}_{$member->member_number}.svg";
        Storage::disk('public')->put($fileName, $qrCodeContent);

        return $fileName;
    }

    /**
     * Prepare member data for QR code
     */
    private function prepareMemberData(Member $member): array
    {
        return [
            'type' => 'member',
            'id' => $member->id,
            'member_number' => $member->member_number,
            'calling_name' => $member->calling_name,
            'full_name' => $member->full_name,
            'nic_passport' => $member->nic_passport,
            'batch' => $member->batch?->name,
            'district' => $member->district?->name,
            'status' => $member->status,
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Generate QR code for event check-in
     */
    public function generateEventCheckInQRCode(int $eventId, string $eventName): string
    {
        $qrData = [
            'type' => 'event_checkin',
            'event_id' => $eventId,
            'event_name' => $eventName,
            'generated_at' => now()->toIso8601String(),
        ];
        
        $renderer = new ImageRenderer(
            new RendererStyle(400),
            new SvgImageBackEnd()
        );
        
        $writer = new Writer($renderer);
        $qrCodeContent = $writer->writeString(json_encode($qrData));

        $fileName = "qrcodes/event_{$eventId}_checkin.svg";
        Storage::disk('public')->put($fileName, $qrCodeContent);

        return $fileName;
    }

    /**
     * Verify QR code data
     */
    public function verifyQRCode(string $qrData): array
    {
        try {
            $data = json_decode($qrData, true);
            
            if (!isset($data['type'])) {
                return [
                    'valid' => false,
                    'message' => 'Invalid QR code format',
                ];
            }

            switch ($data['type']) {
                case 'member':
                    return $this->verifyMemberQRCode($data);
                case 'event_checkin':
                    return $this->verifyEventQRCode($data);
                default:
                    return [
                        'valid' => false,
                        'message' => 'Unknown QR code type',
                    ];
            }
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'message' => 'Failed to decode QR code: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Verify member QR code
     */
    private function verifyMemberQRCode(array $data): array
    {
        $member = Member::find($data['id']);

        if (!$member) {
            return [
                'valid' => false,
                'message' => 'Member not found',
            ];
        }

        if ($member->member_number !== $data['member_number']) {
            return [
                'valid' => false,
                'message' => 'Member number mismatch',
            ];
        }

        return [
            'valid' => true,
            'type' => 'member',
            'data' => [
                'member' => $member->load(['batch', 'district', 'programs']),
                'qr_data' => $data,
            ],
            'message' => 'Valid member QR code',
        ];
    }

    /**
     * Verify event check-in QR code
     */
    private function verifyEventQRCode(array $data): array
    {
        return [
            'valid' => true,
            'type' => 'event_checkin',
            'data' => $data,
            'message' => 'Valid event check-in QR code',
        ];
    }

    /**
     * Get QR code URL for a member
     */
    public function getMemberQRCodeUrl(Member $member): ?string
    {
        $fileName = "qrcodes/member_{$member->id}_{$member->member_number}.svg";
        
        if (Storage::disk('public')->exists($fileName)) {
            return Storage::url($fileName);
        }

        // Generate if doesn't exist
        $this->generateMemberQRCode($member);
        return Storage::url($fileName);
    }
}
