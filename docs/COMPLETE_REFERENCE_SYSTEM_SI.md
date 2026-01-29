# Complete Reference Number System - සිංහල උපදෙස්

## සාරාංශය

දැන් ඔබේ system එකේ **3 වර්ගයේ reference numbers** තියෙනවා:

### 1. **Member Number** (SC0001)
- Member එකක් create කරන වෙලාවේ generate වෙනවා
- **කවදාවත් වෙනස් වෙන්නේ නැහැ**
- Continue ව increment වෙනවා (SC0001, SC0002, SC0003...)
- Settings වලින් prefix එක control කරන්න පුළුවන්

### 2. **Registration Reference** (26-REG-0001) ⭐ NEW
- Member එකක් **approve කරන වෙලාවේ** generate වෙනවා
- **එක වතාවක් පමණක්** assign වෙනවා (කවදාවත් වෙනස් වෙන්නේ නැහැ)
- **වසරකට reset වෙනවා** (2026: 26-REG-0001, 2027: 27-REG-0001)
- Member registration year එක track කරන්න පුළුවන්

### 3. **Payment Receipt Number** (RCP-26-0001) ⭐ NEW
- **හැම payment එකකටම** වෙනම receipt number එකක් generate වෙනවා
- Settings වලින් control කරන්න පුළුවන්:
  - Prefix (RCP, RCT, INV, etc.)
  - Year include කරන්නද නැද්ද
  - Yearly reset කරන්නද නැද්ද

### 4. **Payment Reference Number** (26-SW-0001)
- Sport-specific payment tracking සඳහා
- Internal reference එකක් විදියට use වෙනවා

---

## 📊 Number System Comparison

| Type | Format | When Generated | Resets? | Example |
|------|--------|---------------|---------|---------|
| **Member Number** | `{PREFIX}{NUMBER}` | Member create කරන වෙලාවේ | ❌ Never | SC0001 |
| **Registration Ref** | `{YEAR}-{PREFIX}-{NUMBER}` | Member approve කරන වෙලාවේ | ✅ Yearly | 26-REG-0001 |
| **Receipt Number** | `{PREFIX}-{YEAR}-{NUMBER}` | Payment create කරන වෙලාවේ | ✅ Yearly | RCP-26-0001 |
| **Payment Ref** | `{YEAR}-{SPORT}-{NUMBER}` | Payment create කරන වෙලාවේ | ✅ Yearly | 26-SW-0001 |

---

## 🎯 Use Cases

### Member Number (SC0001)
**භාවිතය:** Member identification
- Member card එකේ
- Database queries වලට
- General member tracking

**විශේෂාංග:**
- Unique for each member
- Never changes
- Continues forever (no reset)

### Registration Reference (26-REG-0001)
**භාවිතය:** Registration tracking
- කවදා register වුණාද track කරන්න
- Year-based member statistics
- Registration certificates

**විශේෂාංග:**
- Assigned once during approval
- Shows registration year
- Resets each year
- **Member details වල save වෙනවා**

### Receipt Number (RCP-26-0001)
**භාවිතය:** Payment receipts
- Payment receipts print කරන්න
- Accounting purposes
- Payment tracking

**විශේෂාංග:**
- Unique for each payment
- Can include year or not (configurable)
- Can reset yearly or continue (configurable)
- **Payment record එකේ save වෙනවා**

### Payment Reference (26-SW-0001)
**භාවිතය:** Sport-specific tracking
- Sport-wise payment tracking
- Monthly fee schedules
- Internal reference

---

## 💾 Database Storage

### Members Table
```sql
members
├── member_number: "SC0001"
├── registration_reference: "26-REG-0001" ⭐ NEW
└── ... other fields
```

### Payments Table
```sql
payments
├── reference_number: "26-SW-0001"
├── receipt_number: "RCP-26-0001" ⭐ NEW
└── ... other fields
```

---

## ⚙️ Settings Configuration

### `/admin/settings` Page එකේ Tabs:

#### 1. **Member Settings**
- Member Number Prefix
- Number of Digits
- Starting Number

#### 2. **Registration** ⭐ NEW
- Registration Reference Prefix (REG, MEM, etc.)
- Number of Digits
- Year Format (yy හෝ yyyy)

#### 3. **Payment Settings**
- Payment Reference Format
- Sport Code based numbering

#### 4. **Receipt Numbers** ⭐ NEW
- Receipt Number Prefix (RCP, RCT, INV, etc.)
- Number of Digits
- Year Format
- Include Year (Yes/No)
- Reset Yearly (Yes/No)

---

## 🔄 Generation Flow

### Member Registration Process:
```
1. Member Register කරනවා
   → Member Number generate වෙනවා: SC0001

2. Admin Approve කරනවා
   → Registration Reference generate වෙනවා: 26-REG-0001
   → Member record එකේ save වෙනවා
```

### Payment Process:
```
1. Payment Create කරනවා
   → Payment Reference generate වෙනවා: 26-SW-0001
   → Receipt Number generate වෙනවා: RCP-26-0001
   → Payment record එකේ save වෙනවා

2. Receipt Print කරනවා
   → Receipt Number use කරනවා: RCP-26-0001
```

---

## 📝 Examples

### 2026 වසරේ:
```
Member 1:
  Member Number: SC0001
  Registration Ref: 26-REG-0001
  
  Payment 1 (Swimming):
    Payment Ref: 26-SW-0001
    Receipt No: RCP-26-0001
    
  Payment 2 (Cricket):
    Payment Ref: 26-CR-0001
    Receipt No: RCP-26-0002

Member 2:
  Member Number: SC0002
  Registration Ref: 26-REG-0002
  
  Payment 1 (Swimming):
    Payment Ref: 26-SW-0002
    Receipt No: RCP-26-0003
```

### 2027 වසරේ:
```
Member 3:
  Member Number: SC0003
  Registration Ref: 27-REG-0001 ← Reset!
  
  Payment 1 (Swimming):
    Payment Ref: 27-SW-0001 ← Reset!
    Receipt No: RCP-27-0001 ← Reset!
```

---

## 🎨 Receipt/Document Usage

### Payment Receipt එකක්:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         NYSC Payment Receipt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt No: RCP-26-0001          ← Receipt Number
Date: 2026-01-29

Member: SC0001                   ← Member Number
Name: John Doe
Registration: 26-REG-0001        ← Registration Reference

Payment Details:
Sport: Swimming
Amount: Rs. 1,000.00
Reference: 26-SW-0001            ← Payment Reference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Member Card එකක්:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         NYSC Member Card
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Member No: SC0001                ← Member Number
Registration: 26-REG-0001        ← Registration Reference

Name: John Doe
Joined: 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🚀 Setup Instructions

### 1. Migrations Run කරන්න:
```bash
php artisan migrate
```

### 2. Settings Seed කරන්න:
```bash
php artisan db:seed --class=SettingSeeder
```

### 3. Settings Configure කරන්න:
- `/admin/settings` යන්න
- හැම tab එකම check කරන්න
- Prefixes වෙනස් කරන්න (අවශ්‍ය නම්)
- Save කරන්න

---

## ✅ Summary

දැන් ඔබට:

✅ **Member Number** - Permanent member ID  
✅ **Registration Reference** - Year-based registration tracking  
✅ **Receipt Number** - Payment receipt tracking  
✅ **Payment Reference** - Sport-specific payment tracking  

සියල්ල Settings වලින් control කරන්න පුළුවන්! 🎉

---

## 📖 Documentation Files

- `docs/MEMBER_PAYMENT_REFERENCE_SYSTEM.md` - Full English guide
- `docs/MEMBER_PAYMENT_REFERENCE_SYSTEM_SI.md` - Sinhala guide
- `QUICK_REFERENCE.md` - Quick reference card
- `IMPLEMENTATION_SUMMARY.md` - Technical details
