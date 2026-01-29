# Sport-Specific Registration References - සම්පූර්ණ උපදෙස්

## 🎯 New System Design

දැන් **හැම sport එකකටම වෙනම registration reference එකක්** generate වෙනවා!

## 📊 Database Structure

### member_sports Table:
```sql
member_sports
├── id (UUID)
├── member_id (UUID)
├── sport_id (UUID)
├── sport_reference (STRING) ⭐ NEW
├── enrolled_at (DATETIME)
├── status (ENUM)
└── timestamps
```

### members Table:
```sql
members
├── member_number: "SC0001" (Primary ID)
├── registration_reference: "26-SW-0001" (First sport reference)
└── ...
```

## 🔄 How It Works

### 1. Member Registration & Approval:

```
Member Registers:
├── Name: John Doe
├── Member Number: SC0001 (Generated)
└── Sports Selected: Swimming, Cricket

Admin Approves:
├── Generate Swimming Reference: 26-SW-0001
├── Generate Cricket Reference: 26-CR-0001
├── Save to member_sports table
└── Set primary reference: 26-SW-0001
```

### 2. Adding New Sport Later:

```
Member SC0001 enrolls in Football:
├── Check if member is approved ✓
├── Generate Football Reference: 26-FB-0001
└── Save to member_sports table
```

## 💾 Data Storage Example

### Member Record:
```json
{
  "member_number": "SC0001",
  "registration_reference": "26-SW-0001",
  "full_name": "John Doe"
}
```

### Member Sports Records:
```json
[
  {
    "member_id": "uuid-1",
    "sport_id": "swimming-uuid",
    "sport_reference": "26-SW-0001",
    "status": "active"
  },
  {
    "member_id": "uuid-1",
    "sport_id": "cricket-uuid",
    "sport_reference": "26-CR-0001",
    "status": "active"
  },
  {
    "member_id": "uuid-1",
    "sport_id": "football-uuid",
    "sport_reference": "26-FB-0001",
    "status": "active"
  }
]
```

## 📋 Complete Example

### Member 1 (John Doe):
```
Member Number: SC0001
Registration Date: 2026-01-29

Sports:
├── Swimming:  26-SW-0001 ✓
├── Cricket:   26-CR-0001 ✓
└── Football:  26-FB-0001 ✓

Primary Reference: 26-SW-0001
```

### Member 2 (Jane Smith):
```
Member Number: SC0002
Registration Date: 2026-01-29

Sports:
├── Swimming:  26-SW-0002 ✓
└── Tennis:    26-TN-0001 ✓

Primary Reference: 26-SW-0002
```

## 🎨 Reference Format

```
{YEAR}-{SPORT_CODE}-{NUMBER}
```

**Components:**
- `YEAR`: 26 (2026) or 2026 (configurable)
- `SPORT_CODE`: SW, CR, FB, TN (from sport short code)
- `NUMBER`: 0001, 0002, 0003 (sequential per sport per year)

## ✨ Key Features

### ✅ Sport-Specific Numbering
- හැම sport එකකටම වෙනම sequence එකක්
- Swimming: 26-SW-0001, 26-SW-0002, 26-SW-0003
- Cricket: 26-CR-0001, 26-CR-0002, 26-CR-0003

### ✅ Yearly Reset
- හැම වසරකටම sport එකක් සඳහා numbering reset වෙනවා
- 2026: 26-SW-0001
- 2027: 27-SW-0001

### ✅ Multiple Sports Support
- Member එකක් sports කීපයක් තියෙනවා නම්
- හැම sport එකකටම වෙනම reference එකක් generate වෙනවා

### ✅ Automatic Generation
- Member approve කරන වෙලාවේ automatic ව generate වෙනවා
- පස්සේ sport එකක් add කරනවා නම් ඒකටත් generate වෙනවා

### ✅ Primary Reference
- පළමු sport එකේ reference එක primary reference එක විදියට save වෙනවා
- `members.registration_reference` field එකේ

## 🔍 Querying Sport References

### Get Member's All Sport References:
```php
$member = Member::find($id);

foreach ($member->sports as $sport) {
    echo "{$sport->name}: {$sport->pivot->sport_reference}\n";
}

// Output:
// Swimming: 26-SW-0001
// Cricket: 26-CR-0001
// Football: 26-FB-0001
```

### Get Specific Sport Reference:
```php
$member = Member::find($id);
$sport = $member->sports()->where('sport_id', $sportId)->first();
$reference = $sport->pivot->sport_reference;
```

### Get All Members for a Sport:
```php
$swimmingMembers = MemberSport::where('sport_id', $swimmingId)
    ->whereNotNull('sport_reference')
    ->with('member')
    ->get();
```

## 📊 Statistics & Reports

### Sport-wise Member Count:
```php
// Swimming members in 2026
$count = MemberSport::where('sport_id', $swimmingId)
    ->where('sport_reference', 'like', '26-SW-%')
    ->count();
// Result: 150 members
```

### Year-over-Year Growth:
```php
// 2026 vs 2027
$count2026 = MemberSport::where('sport_reference', 'like', '26-SW-%')->count();
$count2027 = MemberSport::where('sport_reference', 'like', '27-SW-%')->count();
$growth = $count2027 - $count2026;
```

## 🎯 Use Cases

### 1. Member Card:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         NYSC Member Card
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Member No: SC0001
Name: John Doe

Registered Sports:
├── Swimming:  26-SW-0001
├── Cricket:   26-CR-0001
└── Football:  26-FB-0001

Joined: 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Sport Certificate:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Swimming Registration Certificate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This certifies that

John Doe
Member No: SC0001
Swimming Ref: 26-SW-0001

is a registered member of the
NYSC Swimming Team

Registered: 2026-01-29
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Sport-wise Reports:
```
Swimming Team - 2026 Members
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

26-SW-0001  John Doe      Active
26-SW-0002  Jane Smith    Active
26-SW-0003  Bob Wilson    Active
...
26-SW-0150  Alice Brown   Active

Total: 150 Members
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔄 Migration & Upgrade

### For Existing Members:
```php
// Run this to generate references for existing members
php artisan tinker

$members = Member::where('status', 'active')->get();

foreach ($members as $member) {
    $generator = new GenerateRegistrationReferenceAction();
    
    foreach ($member->sports as $sport) {
        if (!$sport->pivot->sport_reference) {
            $reference = $generator->execute($sport->id, $member->registration_date);
            $member->sports()->updateExistingPivot($sport->id, [
                'sport_reference' => $reference
            ]);
        }
    }
}
```

## ⚙️ Settings

### `/admin/settings` → Registration Tab:

**Configurable:**
- ✅ Number of Digits (4 = 0001)
- ✅ Year Format (yy = 26, yyyy = 2026)

**Automatic:**
- Sport Code (from sport short code)

## 🎉 Benefits

### 1. **Sport Identification**
- Reference එක බැලුවම member එක කුමන sport එකක්ද කියලා දැනගන්න පුළුවන්

### 2. **Multiple Sport Tracking**
- Member එකක් කීපයක් sports තියෙනවා නම් හැම එකකටම track කරන්න පුළුවන්

### 3. **Sport-wise Statistics**
- හැම sport එකකටම වෙන වෙනම member count එකක්
- Year-over-year growth track කරන්න පුළුවන්

### 4. **Flexible Enrollment**
- පස්සේ sport එකක් add කරනවා නම් automatic ව reference එකක් generate වෙනවා

### 5. **Consistent Format**
- Payment references එක වගේම format එකක්
- Easy to understand and maintain

## 📝 Summary

✅ **Member Number**: `SC0001` (Primary ID - never changes)  
✅ **Sport References**: `26-SW-0001`, `26-CR-0001`, `26-FB-0001` (Per sport)  
✅ **Primary Reference**: `26-SW-0001` (First sport reference)  
✅ **Storage**: `member_sports.sport_reference` column  
✅ **Auto-generation**: On approval & new sport enrollment  
✅ **Yearly Reset**: Per sport, per year  

🎉 සම්පූර්ණයි! Sport-specific registration tracking system එක ready!
