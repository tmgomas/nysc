# QR Code System Documentation

## Overview

The NYSC project now includes a comprehensive QR code system for member identification, verification, and attendance tracking.

## Features Implemented

### 1. **Member QR Codes**
- Each member automatically gets a unique QR code
- QR code contains encrypted member information
- Displayed on member profile page
- Can be downloaded as PNG image
- Can be regenerated if needed

### 2. **QR Code Scanner**
- Real-time camera-based scanning
- Automatic verification of scanned codes
- Scan history tracking
- Success rate statistics
- Mobile-friendly interface

### 3. **Backend Services**

#### QRCodeService (`app/Services/QRCodeService.php`)
- `generateMemberQRCode($member)` - Generate QR code for a member
- `getMemberQRCodeUrl($member)` - Get existing QR code or generate new one
- `verifyQRCode($qrData)` - Verify scanned QR code data
- `generateEventCheckInQRCode($eventId, $eventName)` - Generate event check-in QR codes

#### QRCodeController (`app/Http/Controllers/Admin/QRCodeController.php`)
- `GET /admin/qr-codes/members/{member}` - Get member QR code
- `POST /admin/qr-codes/members/{member}/generate` - Generate new QR code
- `GET /admin/qr-codes/members/{member}/download` - Download QR code
- `POST /admin/qr-codes/verify` - Verify QR code
- `POST /admin/qr-codes/scan-checkin` - Scan for check-in
- `POST /admin/qr-codes/bulk-generate` - Bulk generate QR codes

## Usage Guide

### For Administrators

#### Viewing Member QR Code
1. Navigate to a member's profile page
2. Scroll to the sidebar
3. Find the "MEMBER QR CODE" card
4. The QR code is automatically generated and displayed

#### Downloading QR Code
1. On the member profile page, find the QR code
2. Click the "Download" button
3. QR code will be saved as PNG file

#### Scanning QR Codes
1. Go to **Attendance** → **QR Scanner**
2. Click "Start Scanner"
3. Allow camera access when prompted
4. Point camera at member's QR code
5. System automatically verifies and logs the scan

### For Developers

#### Generating QR Codes Programmatically

```php
use App\Services\QRCodeService;
use App\Models\Member;

$qrCodeService = app(QRCodeService::class);
$member = Member::find(1);

// Generate QR code
$qrCodePath = $qrCodeService->generateMemberQRCode($member);

// Get QR code URL
$qrCodeUrl = $qrCodeService->getMemberQRCodeUrl($member);
```

#### Verifying QR Codes

```php
$qrData = '{"type":"member","id":1,"registration_number":"NYSC001",...}';
$result = $qrCodeService->verifyQRCode($qrData);

if ($result['valid']) {
    $member = $result['data']['member'];
    // Process verified member
}
```

#### Using QR Components in React

```tsx
import MemberQRCode from '@/components/QRCode/MemberQRCode';

<MemberQRCode
    memberId={1}
    registrationNumber="NYSC001"
    callingName="John Doe"
    showDownload={true}
    size="md"
/>
```

```tsx
import QRScanner from '@/components/QRCode/QRScanner';

const [showScanner, setShowScanner] = useState(false);

const handleScan = (data: string) => {
    console.log('Scanned:', data);
};

{showScanner && (
    <QRScanner
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
        autoVerify={true}
    />
)}
```

## QR Code Data Structure

### Member QR Code
```json
{
    "type": "member",
    "id": 1,
    "registration_number": "NYSC001",
    "calling_name": "John Doe",
    "full_name": "John Michael Doe",
    "nic": "123456789V",
    "batch": "Batch 2024-A",
    "district": "Colombo",
    "status": "active",
    "generated_at": "2026-02-03T10:00:00+05:30"
}
```

### Event Check-in QR Code
```json
{
    "type": "event_checkin",
    "event_id": 1,
    "event_name": "Sports Day 2024",
    "generated_at": "2026-02-03T10:00:00+05:30"
}
```

## API Endpoints

### Get Member QR Code
```
GET /admin/qr-codes/members/{member}
```

**Response:**
```json
{
    "success": true,
    "qr_code_url": "http://localhost/storage/qrcodes/member_1_NYSC001.png",
    "member": {
        "id": 1,
        "registration_number": "NYSC001",
        "calling_name": "John Doe",
        "full_name": "John Michael Doe"
    }
}
```

### Verify QR Code
```
POST /admin/qr-codes/verify
Content-Type: application/json

{
    "qr_data": "{\"type\":\"member\",\"id\":1,...}"
}
```

**Response:**
```json
{
    "valid": true,
    "type": "member",
    "data": {
        "member": { ... },
        "qr_data": { ... }
    },
    "message": "Valid member QR code"
}
```

### Scan Check-in
```
POST /admin/qr-codes/scan-checkin
Content-Type: application/json

{
    "qr_data": "{\"type\":\"member\",\"id\":1,...}",
    "event_id": 1
}
```

**Response:**
```json
{
    "success": true,
    "type": "member",
    "member": { ... },
    "message": "Check-in successful for John Doe",
    "checked_in_at": "2026-02-03T10:00:00+05:30"
}
```

## Storage

QR codes are stored in:
- **Path:** `storage/app/public/qrcodes/`
- **Public URL:** `http://your-domain/storage/qrcodes/`
- **Naming:** `member_{id}_{registration_number}.png`

Make sure the storage link is created:
```bash
php artisan storage:link
```

## Security Considerations

1. **QR Code Expiry:** Currently QR codes don't expire. Consider adding expiry for sensitive operations.
2. **Data Encryption:** QR data is JSON encoded but not encrypted. Consider encryption for sensitive data.
3. **Access Control:** QR code endpoints are protected by admin middleware.
4. **Rate Limiting:** Consider adding rate limiting to prevent abuse.

## Future Enhancements

1. **NFC Support:** Add NFC card reading capability
2. **RFID Integration:** Support RFID tags for access control
3. **Offline Mode:** Allow scanning without internet connection
4. **Batch Printing:** Print multiple QR codes at once
5. **QR Code Analytics:** Track scan frequency and patterns
6. **Custom QR Designs:** Add logo and custom styling to QR codes
7. **Time-based QR Codes:** Generate temporary QR codes for events
8. **Multi-language Support:** QR code data in multiple languages

## Troubleshooting

### QR Code Not Displaying
- Check if storage link exists: `php artisan storage:link`
- Verify storage permissions: `storage/app/public/qrcodes/` should be writable
- Check browser console for errors

### Scanner Not Working
- Ensure HTTPS connection (camera requires secure context)
- Check camera permissions in browser
- Verify `html5-qrcode` package is installed: `npm install html5-qrcode`

### QR Code Not Scanning
- Ensure good lighting conditions
- Hold camera steady
- QR code should be clear and not damaged
- Try regenerating the QR code

## Dependencies

### PHP
- `endroid/qr-code` - QR code generation library

### JavaScript
- `html5-qrcode` - QR code scanning library
- `lucide-react` - Icons

## Installation

The QR code system is already installed. If you need to reinstall:

```bash
# Backend
composer require endroid/qr-code

# Frontend
npm install html5-qrcode

# Create storage link
php artisan storage:link
```

## Support

For issues or questions, contact the development team.
