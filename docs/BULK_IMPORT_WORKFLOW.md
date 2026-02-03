# Bulk Import Workflow

## Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BULK MEMBER IMPORT WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

1. ACCESS IMPORT PAGE
   ┌──────────────────────────────────────┐
   │ Admin → Members → "Bulk Import"      │
   │ Route: /admin/members/import/create  │
   └──────────────────────────────────────┘
                    ↓
2. DOWNLOAD TEMPLATE
   ┌──────────────────────────────────────┐
   │ Click "Download Template"            │
   │ Gets: member_import_template.csv     │
   │ Contains: Headers + Example Row      │
   └──────────────────────────────────────┘
                    ↓
3. PREPARE DATA
   ┌──────────────────────────────────────┐
   │ Open CSV in Excel/Google Sheets      │
   │ Fill member details (one per row)    │
   │ Save as CSV format                   │
   └──────────────────────────────────────┘
                    ↓
4. UPLOAD FILE
   ┌──────────────────────────────────────┐
   │ Choose CSV file                      │
   │ Configure Options:                   │
   │  ☑ Skip duplicates                  │
   │  ☐ Auto-approve members             │
   └──────────────────────────────────────┘
                    ↓
5. PREVIEW & VALIDATE
   ┌──────────────────────────────────────┐
   │ Click "Preview Import"               │
   │ System validates each row:           │
   │  • Checks required fields            │
   │  • Validates data formats            │
   │  • Detects duplicates                │
   │  • Verifies sport IDs                │
   └──────────────────────────────────────┘
                    ↓
6. REVIEW RESULTS
   ┌──────────────────────────────────────┐
   │ Preview shows:                       │
   │  📊 Total Rows: X                   │
   │  ✅ Valid Rows: Y                   │
   │  ❌ Invalid Rows: Z                 │
   │  📋 Error Details (if any)          │
   │  👁️ Sample Data (first 10)         │
   └──────────────────────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         │                     │
    ❌ ERRORS?            ✅ NO ERRORS
         │                     │
         ↓                     ↓
   FIX CSV FILE         IMPORT MEMBERS
   (Go back to step 3)
                              ↓
7. PROCESS IMPORT
   ┌──────────────────────────────────────┐
   │ Click "Import X Members"             │
   │ System processes each row:           │
   │  1. Create member record             │
   │  2. Enroll in sports                 │
   │  3. Generate member number           │
   │  4. Create payment records           │
   │  5. Auto-approve (if enabled)        │
   └──────────────────────────────────────┘
                    ↓
8. COMPLETION
   ┌──────────────────────────────────────┐
   │ Success message shows:               │
   │  "X members imported successfully"   │
   │  "Y members failed"                  │
   │ Redirects to: Members list           │
   └──────────────────────────────────────┘
                    ↓
9. VIEW HISTORY (Optional)
   ┌──────────────────────────────────────┐
   │ Members → Import History             │
   │ View all past imports with:          │
   │  • Date/Time                         │
   │  • User who imported                 │
   │  • Success/Error counts              │
   │  • Detailed error logs               │
   └──────────────────────────────────────┘
```

## Data Validation Rules

```
┌─────────────────────────────────────────────────────────────────┐
│                      VALIDATION CHECKS                           │
└─────────────────────────────────────────────────────────────────┘

REQUIRED FIELDS:
├─ full_name              → Max 255 characters
├─ calling_name           → Max 255 characters
├─ date_of_birth          → Format: YYYY-MM-DD
├─ gender                 → Values: male, female, other
├─ contact_number         → Any format
├─ address                → Any text
├─ emergency_contact      → Any text
├─ emergency_number       → Any format
├─ membership_type        → Values: regular, student, senior
├─ fitness_level          → Values: beginner, intermediate, advanced
├─ preferred_contact_method → Any text
└─ sport_ids              → Comma-separated valid IDs

OPTIONAL FIELDS:
├─ email                  → Valid email format, unique
├─ nic_passport           → Unique in system
├─ blood_group            → Any text
├─ medical_history        → Any text
├─ allergies              → Any text
├─ guardian_name          → Any text
├─ guardian_nic           → Any text
├─ guardian_relationship  → Any text
├─ school_occupation      → Any text
├─ jersey_size            → Any text
├─ referral_source        → Any text
├─ preferred_training_days → Comma-separated days
└─ previous_club_experience → Any text

DUPLICATE DETECTION:
├─ Check NIC/Passport number
└─ Check Email address
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIOS                             │
└─────────────────────────────────────────────────────────────────┘

VALIDATION ERRORS:
├─ Missing required field    → Row skipped, error logged
├─ Invalid date format       → Row skipped, error logged
├─ Invalid gender value      → Row skipped, error logged
├─ Invalid membership type   → Row skipped, error logged
├─ Invalid fitness level     → Row skipped, error logged
└─ Invalid sport ID          → Row skipped, error logged

DUPLICATE ERRORS:
├─ Existing NIC/Passport     → Row skipped (if skip_duplicates ON)
└─ Existing Email            → Row skipped (if skip_duplicates ON)

SYSTEM ERRORS:
├─ Database error            → Transaction rolled back
├─ File parsing error        → Import stopped
└─ Service error             → Import stopped

RESULT:
├─ Valid rows                → Imported successfully
├─ Invalid rows              → Logged with error details
└─ Skipped rows              → Counted and logged
```

## Import Options

```
┌─────────────────────────────────────────────────────────────────┐
│                      IMPORT OPTIONS                              │
└─────────────────────────────────────────────────────────────────┘

SKIP DUPLICATES (Default: ON)
├─ Enabled:  Skip members with existing NIC/Email
└─ Disabled: Attempt to import all (may cause errors)

AUTO-APPROVE (Default: OFF)
├─ Enabled:  
│  ├─ Member status: "active"
│  ├─ User account created
│  ├─ Login credentials generated
│  └─ Ready to use system
└─ Disabled: 
   ├─ Member status: "pending"
   ├─ Requires manual approval
   └─ No user account yet
```

## Success Metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPORT STATISTICS                             │
└─────────────────────────────────────────────────────────────────┘

TRACKED METRICS:
├─ Total Rows              → Number of rows in CSV
├─ Success Count           → Successfully imported members
├─ Error Count             → Rows that failed validation
├─ Skipped Count           → Duplicates skipped
├─ Import Duration         → Time taken to process
├─ User                    → Who performed the import
└─ Timestamp               → When import was done

STORED IN:
└─ member_import_logs table
```
