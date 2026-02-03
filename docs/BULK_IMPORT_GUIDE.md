# Bulk Member Import Feature

## Overview
The bulk import feature allows administrators to import multiple members at once using a CSV file. This is particularly useful for adding batches of old students (e.g., 2025 batch) to the system efficiently.

## Features
- ✅ CSV file upload with validation
- ✅ Preview import data before processing
- ✅ Automatic duplicate detection (by NIC/Email)
- ✅ Auto-approve option for members
- ✅ Detailed error reporting
- ✅ Import history tracking
- ✅ Downloadable CSV template
- ✅ Sport enrollment during import
- ✅ Comprehensive validation

## How to Use

### Step 1: Access the Import Page
1. Navigate to **Admin Dashboard** → **Members**
2. Click the **"Bulk Import"** button in the header

### Step 2: Download Template
1. Click **"Download Template"** button
2. Open the CSV file in Excel or Google Sheets
3. The template includes all required fields with an example row

### Step 3: Fill in Member Data
Fill in the following fields for each member:

#### Required Fields:
- `full_name` - Full legal name
- `calling_name` - Preferred name
- `date_of_birth` - Format: YYYY-MM-DD (e.g., 2000-01-15)
- `gender` - Options: male, female, other
- `contact_number` - Phone number
- `address` - Full address
- `emergency_contact` - Emergency contact name
- `emergency_number` - Emergency contact phone
- `membership_type` - Options: regular, student, senior
- `fitness_level` - Options: beginner, intermediate, advanced
- `preferred_contact_method` - Preferred contact method

#### Optional Fields:
- `email` - Email address
- `nic_passport` - NIC or Passport number
- `sport_ids` - Comma-separated sport IDs (e.g., 1,2,3) - Leave empty if not enrolling in sports yet
- `blood_group` - Blood type
- `medical_history` - Medical conditions
- `allergies` - Known allergies
- `guardian_name` - Guardian's name
- `guardian_nic` - Guardian's NIC
- `guardian_relationship` - Relationship to guardian
- `school_occupation` - School or occupation
- `jersey_size` - Jersey size
- `referral_source` - How they heard about the club
- `preferred_training_days` - Comma-separated days (e.g., Monday,Wednesday,Friday)
- `previous_club_experience` - Previous sports experience

### Step 4: Upload and Preview
1. Click **"Choose File"** and select your CSV
2. Configure options:
   - **Skip duplicate members** - Automatically skip members with existing NIC/Email
   - **Auto-approve members** - Automatically approve and create accounts
3. Click **"Preview Import"** to validate the data

### Step 5: Review Preview
The preview shows:
- **Total Rows** - Number of members in the file
- **Valid Rows** - Members that passed validation
- **Invalid Rows** - Members with errors
- **Error Details** - Specific validation errors for each row
- **Sample Data** - Preview of first 10 rows

### Step 6: Import
1. Review the preview carefully
2. Fix any errors in your CSV if needed
3. Click **"Import X Members"** to process
4. Wait for the import to complete

## Import Options

### Skip Duplicates
When enabled, the system will automatically skip members who already exist in the database based on:
- NIC/Passport number
- Email address

### Auto-Approve
When enabled, imported members will be:
- Automatically approved
- User accounts created
- Login credentials generated
- Ready to access the system

When disabled, members will be imported with "pending" status and require manual approval.

## Sport IDs Reference

To enroll members in sports, use the following sport IDs in the `sport_ids` column:

You can find the current sport IDs in the system by:
1. Going to **Admin Dashboard** → **Sports**
2. Viewing the sport list
3. Using the ID numbers in your CSV

**Example:** To enroll in Cricket (ID: 1) and Football (ID: 2), enter: `1,2`

## Import History

View all past imports:
1. Navigate to **Members** → **Import History**
2. See details for each import:
   - Filename
   - Import date and time
   - User who performed the import
   - Success/Error/Skipped counts
   - Detailed error logs

## Validation Rules

The system validates each row against the following rules:

- **full_name**: Required, max 255 characters
- **calling_name**: Required, max 255 characters
- **email**: Valid email format, unique in system (optional)
- **nic_passport**: Unique in system (optional)
- **date_of_birth**: Valid date in YYYY-MM-DD format
- **gender**: Must be male, female, or other
- **contact_number**: Required
- **address**: Required
- **membership_type**: Must be regular, student, or senior
- **fitness_level**: Must be beginner, intermediate, or advanced
- **sport_ids**: Optional - Must contain valid sport IDs if provided

## Error Handling

If errors occur during import:
1. The system will show which rows failed
2. Detailed error messages for each issue
3. Successfully imported rows will still be saved
4. Failed rows can be fixed and re-imported

## Best Practices

1. **Test with small batch first** - Import 5-10 members to test your CSV format
2. **Use the template** - Always start with the downloaded template
3. **Check sport IDs** - Verify sport IDs are correct before importing
4. **Validate dates** - Ensure dates are in YYYY-MM-DD format
5. **Review preview** - Always preview before importing
6. **Keep backups** - Save your CSV file for records
7. **Check duplicates** - Review existing members to avoid duplicates

## Troubleshooting

### Common Issues:

**"Invalid date format"**
- Solution: Use YYYY-MM-DD format (e.g., 2000-01-15)

**"Email already exists"**
- Solution: Enable "Skip duplicates" or remove duplicate emails

**"Invalid sport ID"**
- Solution: Check the sport IDs in the Sports management page

**"Required field missing"**
- Solution: Ensure all required fields are filled

**"CSV file not recognized"**
- Solution: Save file as CSV (Comma delimited) format

## Technical Details

### Files Created:
- `app/Http/Controllers/Admin/MemberImportController.php` - Import controller
- `app/Services/MemberImportService.php` - Import logic
- `app/Models/MemberImportLog.php` - Import history model
- `database/migrations/2026_02_02_000001_create_member_import_logs_table.php` - Migration
- `resources/js/Pages/Admin/Members/Import.tsx` - Import UI
- `resources/js/Pages/Admin/Members/ImportHistory.tsx` - History UI

### Routes:
- `GET /admin/members/import/create` - Import form
- `GET /admin/members/import/template` - Download template
- `POST /admin/members/import/preview` - Preview data
- `POST /admin/members/import` - Process import
- `GET /admin/members/import/history` - Import history

## Support

For issues or questions about the bulk import feature, contact your system administrator.

---

**Last Updated:** February 2, 2026
**Version:** 1.0.0
