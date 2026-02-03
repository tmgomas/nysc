# NFC & RFID Implementation Guide

## 🎯 Overview

This system supports three methods of member identification:
1. **QR Codes** - Camera-based scanning (works on all devices)
2. **NFC Tags** - Near Field Communication (Android Chrome only)
3. **RFID Cards** - USB RFID readers (desktop/laptop)

---

## 📱 NFC (Near Field Communication)

### What is NFC?
NFC allows wireless communication between devices over short distances (typically <4cm). Members can tap their NFC-enabled phones or NFC cards to check in.

### Browser Support
- ✅ **Chrome for Android** (version 89+)
- ❌ iOS (not supported - Apple restricts Web NFC)
- ❌ Desktop browsers (not supported)

### How It Works

1. **Write Member Data to NFC Tag:**
   ```javascript
   // Example NFC tag data structure
   {
     "type": "member",
     "member_number": "NYC2024001",
     "calling_name": "John Doe",
     "id": "019c0d59-..."
   }
   ```

2. **Scan NFC Tag:**
   - User opens Unified Scanner page
   - Selects "NFC" tab
   - Clicks "Start NFC Scan"
   - Taps NFC tag/card to device
   - System automatically verifies member

3. **Associate NFC Tag with Member:**
   ```bash
   POST /admin/nfc/associate
   {
     "member_id": "019c0d59-...",
     "nfc_tag_id": "04:12:34:56:78:90:AB"
   }
   ```

### NFC Tag Types

1. **NTAG213/215/216** - Recommended
   - Storage: 144-888 bytes
   - Read/Write: Multiple times
   - Cost: ~$0.50-2.00 per tag

2. **MIFARE Classic** - Common
   - Storage: 1KB
   - Cost: ~$0.30-1.00 per tag

3. **MIFARE Ultralight** - Budget
   - Storage: 64 bytes
   - Cost: ~$0.20-0.50 per tag

### Writing NFC Tags

You can use these apps to write member data to NFC tags:

**Android:**
- NFC Tools (Free)
- TagWriter by NXP (Free)
- NFC TagWriter by NXP (Free)

**Steps:**
1. Install NFC Tools app
2. Go to "Write"
3. Add a record → "Text"
4. Paste member JSON data
5. Tap "Write" and hold tag to phone

---

## 💳 RFID (Radio-Frequency Identification)

### What is RFID?
RFID uses radio waves to read data from cards/tags. Common in access control systems, libraries, and payment cards.

### Hardware Requirements

1. **USB RFID Reader** (Required)
   - Recommended: ACR122U, RC522, PN532
   - Price: $15-50
   - Connection: USB (acts as keyboard)

2. **RFID Cards/Tags**
   - 125kHz (EM4100/EM4102) - Basic
   - 13.56MHz (MIFARE) - Advanced
   - Price: $0.20-2.00 per card

### How It Works

1. **Connect RFID Reader:**
   - Plug USB RFID reader into computer
   - No drivers needed (acts as keyboard)
   - Reader sends card ID when scanned

2. **Scan RFID Card:**
   - User opens Unified Scanner page
   - Selects "RFID" tab
   - Clicks "Start Listening for RFID"
   - Scans RFID card
   - System captures card ID and verifies member

3. **Associate RFID Card with Member:**
   ```bash
   POST /admin/rfid/associate
   {
     "member_id": "019c0d59-...",
     "rfid_card_id": "0123456789AB"
   }
   ```

### RFID Reader Setup

**Windows:**
1. Plug in USB RFID reader
2. Windows automatically installs drivers
3. Reader appears as keyboard device
4. Test by scanning card in Notepad

**Linux:**
```bash
# Check if reader is detected
lsusb

# Should show something like:
# Bus 001 Device 005: ID 072f:2200 Advanced Card Systems, Ltd ACR122U

# No additional setup needed
```

**macOS:**
1. Plug in USB RFID reader
2. macOS automatically recognizes it
3. No additional setup needed

---

## 🔄 Unified Scanner Page

### Location
```
Admin Dashboard → Attendance → Unified Scanner
Route: /admin/attendance/unified-scanner
```

### Features

1. **Tabbed Interface:**
   - QR Code tab
   - NFC tab
   - RFID tab

2. **Statistics Dashboard:**
   - Today's scans
   - Total history
   - Success rate

3. **Scan History:**
   - Real-time scan log
   - Method indicator (QR/NFC/RFID)
   - Member details
   - Timestamp

4. **Auto-Verification:**
   - Scans are automatically verified
   - Member details displayed
   - Success/failure feedback

---

## 🗄️ Database Schema

### Members Table (New Fields)

```sql
ALTER TABLE members ADD COLUMN nfc_tag_id VARCHAR(255) UNIQUE NULL;
ALTER TABLE members ADD COLUMN rfid_card_id VARCHAR(255) UNIQUE NULL;
```

**Fields:**
- `nfc_tag_id` - NFC tag serial number (e.g., "04:12:34:56:78:90:AB")
- `rfid_card_id` - RFID card ID (e.g., "0123456789AB")

Both fields are:
- Nullable (members don't need NFC/RFID)
- Unique (one tag/card per member)
- Indexed for fast lookups

---

## 🔌 API Endpoints

### NFC Endpoints

```bash
# Verify NFC tag
POST /admin/nfc/verify
{
  "nfc_data": "{\"serialNumber\":\"04:12:34:56:78:90:AB\",\"records\":[...]}"
}

# Associate NFC tag with member
POST /admin/nfc/associate
{
  "member_id": "019c0d59-...",
  "nfc_tag_id": "04:12:34:56:78:90:AB"
}

# Remove NFC tag from member
POST /admin/nfc/disassociate
{
  "member_id": "019c0d59-..."
}
```

### RFID Endpoints

```bash
# Verify RFID card
POST /admin/rfid/verify
{
  "rfid_data": "0123456789AB"
}

# Associate RFID card with member
POST /admin/rfid/associate
{
  "member_id": "019c0d59-...",
  "rfid_card_id": "0123456789AB"
}

# Remove RFID card from member
POST /admin/rfid/disassociate
{
  "member_id": "019c0d59-..."
}

# Scan for check-in
POST /admin/rfid/scan-checkin
{
  "rfid_data": "0123456789AB",
  "event_id": 123 // optional
}
```

---

## 🛠️ Setup Instructions

### 1. Run Migration

```bash
php artisan migrate
```

This adds `nfc_tag_id` and `rfid_card_id` fields to members table.

### 2. Build Frontend

```bash
npm run build
# or for development
npm run dev
```

### 3. Test NFC (Android Chrome)

1. Open `/admin/attendance/unified-scanner` on Android Chrome
2. Click NFC tab
3. Click "Start NFC Scan"
4. Grant NFC permission
5. Tap NFC tag to phone

### 4. Test RFID

1. Connect USB RFID reader
2. Open `/admin/attendance/unified-scanner`
3. Click RFID tab
4. Click "Start Listening for RFID"
5. Scan RFID card

---

## 💡 Use Cases

### 1. Daily Attendance
- Members tap NFC card/phone at entrance
- Automatic check-in recorded
- No manual entry needed

### 2. Event Check-in
- Quick registration at sports events
- Track participant attendance
- Real-time statistics

### 3. Access Control
- Gym/facility access
- Equipment checkout
- Restricted area entry

### 4. Payment Verification
- Link payments to members
- Verify membership status
- Track transactions

---

## 🔒 Security Considerations

1. **NFC Tag Security:**
   - Use password-protected NFC tags
   - Enable read-only mode after writing
   - Encrypt sensitive data

2. **RFID Card Security:**
   - Use encrypted RFID cards (MIFARE DESFire)
   - Implement challenge-response authentication
   - Regular card audits

3. **Backend Validation:**
   - Always verify on server-side
   - Check member status
   - Log all scans
   - Rate limiting

4. **Data Privacy:**
   - Don't store sensitive data on tags/cards
   - Use member IDs, not personal info
   - Comply with data protection regulations

---

## 🐛 Troubleshooting

### NFC Not Working

**Problem:** "NFC is not supported"
**Solution:**
- Use Chrome on Android (version 89+)
- Enable NFC in phone settings
- Grant browser NFC permission

**Problem:** "Failed to read NFC tag"
**Solution:**
- Hold tag closer to phone
- Remove phone case if thick
- Try different tag position
- Check tag is not damaged

### RFID Not Working

**Problem:** "No response when scanning card"
**Solution:**
- Check USB connection
- Try different USB port
- Test reader in Notepad
- Check reader LED indicator

**Problem:** "Wrong card ID captured"
**Solution:**
- Ensure reader is in keyboard mode
- Check reader configuration
- Verify card format (125kHz vs 13.56MHz)

---

## 📦 Hardware Recommendations

### NFC Tags
1. **NTAG216** - Best for member cards
   - 888 bytes storage
   - ISO14443A compatible
   - ~$1.50 each

2. **NTAG213** - Budget option
   - 144 bytes storage
   - Good for basic data
   - ~$0.50 each

### RFID Readers
1. **ACR122U** - Professional
   - USB connection
   - 13.56MHz
   - ~$40

2. **RC522** - Budget
   - USB/Serial
   - 13.56MHz
   - ~$15

### RFID Cards
1. **MIFARE Classic 1K** - Standard
   - 1KB storage
   - Widely compatible
   - ~$0.50 each

2. **EM4100** - Basic
   - Read-only
   - 125kHz
   - ~$0.20 each

---

## 🚀 Future Enhancements

1. **Offline Mode:**
   - Cache member data locally
   - Sync when online
   - Progressive Web App

2. **Multi-Factor:**
   - NFC + PIN
   - RFID + Biometric
   - QR + Face recognition

3. **Analytics:**
   - Peak attendance times
   - Popular entry methods
   - Member activity patterns

4. **Integration:**
   - Payment systems
   - Access control hardware
   - Third-party attendance systems

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Contact development team

---

**Last Updated:** 2026-02-03
**Version:** 1.0.0
