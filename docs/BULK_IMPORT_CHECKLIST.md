# Bulk Import Checklist - 2025 Old Students

## Pre-Import Preparation

### 1. Gather Member Information
- [ ] Collect full names of all 2025 old students
- [ ] Obtain contact numbers
- [ ] Get NIC/Passport numbers (if available)
- [ ] Collect email addresses (if available)
- [ ] Note date of birth for each member
- [ ] Determine which sports each member wants to join
- [ ] Get emergency contact details

### 2. Check Sport IDs
- [ ] Login to admin dashboard
- [ ] Navigate to Sports management
- [ ] Note down the ID numbers for each sport
- [ ] Example: Cricket (1), Football (2), etc.

### 3. Download Template
- [ ] Go to Members → Bulk Import
- [ ] Click "Download Template"
- [ ] Save the CSV file to your computer
- [ ] Open in Excel or Google Sheets

## Data Entry

### 4. Fill Member Data
- [ ] Enter one member per row
- [ ] Fill all required fields (marked with *)
- [ ] Use correct date format: YYYY-MM-DD
- [ ] Use correct gender values: male, female, or other
- [ ] Use correct membership_type: student (for old students)
- [ ] Enter sport IDs as comma-separated (e.g., 1,2,3)
- [ ] Double-check all phone numbers
- [ ] Verify email addresses are correct

### 5. Data Quality Check
- [ ] No empty required fields
- [ ] All dates in YYYY-MM-DD format
- [ ] All sport IDs are valid
- [ ] No duplicate NIC numbers
- [ ] No duplicate email addresses
- [ ] Contact numbers are complete
- [ ] Emergency contacts filled

### 6. Save File
- [ ] Save as CSV (Comma delimited) format
- [ ] Keep a backup copy
- [ ] Name file clearly (e.g., "2025_old_students.csv")

## Import Process

### 7. Upload File
- [ ] Go to Members → Bulk Import
- [ ] Click "Choose File"
- [ ] Select your CSV file
- [ ] File size under 2MB

### 8. Configure Options
- [ ] Decide: Skip duplicates? (Recommended: ✓ Yes)
- [ ] Decide: Auto-approve members? (Your choice)
  - ✓ Yes = Members get immediate access
  - ✗ No = You approve each member manually later

### 9. Preview Import
- [ ] Click "Preview Import"
- [ ] Wait for validation to complete
- [ ] Review the statistics:
  - [ ] Total rows matches your count
  - [ ] Valid rows = Total rows (ideally)
  - [ ] Invalid rows = 0 (ideally)

### 10. Review Errors (if any)
- [ ] Read each error message
- [ ] Note the row numbers with errors
- [ ] Fix errors in your CSV file
- [ ] Re-upload and preview again
- [ ] Repeat until all rows are valid

### 11. Import Members
- [ ] Click "Import X Members"
- [ ] Wait for processing to complete
- [ ] Note the success message
- [ ] Record how many succeeded/failed

## Post-Import

### 12. Verify Import
- [ ] Go to Members list
- [ ] Check if new members appear
- [ ] Verify member numbers were generated
- [ ] Check sport enrollments are correct
- [ ] Spot-check a few member details

### 13. Handle Failures (if any)
- [ ] Review import history for error details
- [ ] Create a new CSV with only failed members
- [ ] Fix the issues
- [ ] Re-import the failed members

### 14. Member Approval (if not auto-approved)
- [ ] Go through pending members
- [ ] Review each member's details
- [ ] Click "Approve" for each valid member
- [ ] This creates their user accounts

### 15. Notify Members
- [ ] Inform members they've been added
- [ ] Share login credentials (if auto-approved)
- [ ] Provide system access instructions
- [ ] Share payment information

### 16. Payment Setup
- [ ] Check pending payments were created
- [ ] Verify admission fees are correct
- [ ] Set up payment schedules if needed
- [ ] Mark payments as paid when received

## Troubleshooting

### Common Issues Checklist

**"Invalid date format"**
- [ ] Check dates are YYYY-MM-DD
- [ ] No spaces in dates
- [ ] Month is 01-12, not 1-12
- [ ] Day is 01-31, not 1-31

**"Email already exists"**
- [ ] Enable "Skip duplicates"
- [ ] Or remove duplicate emails
- [ ] Check if member already in system

**"Invalid sport ID"**
- [ ] Verify sport IDs from Sports page
- [ ] Use comma-separated format: 1,2,3
- [ ] No spaces between IDs
- [ ] All IDs exist in system

**"Required field missing"**
- [ ] Check all required fields filled
- [ ] No empty cells in required columns
- [ ] CSV saved properly

**"File upload failed"**
- [ ] File size under 2MB
- [ ] File format is CSV
- [ ] File not corrupted
- [ ] Try different browser

## Best Practices

### For 2025 Old Students Specifically

- [ ] Use membership_type: "student"
- [ ] Set appropriate fitness_level based on experience
- [ ] Include school_occupation: "Old Student - 2025"
- [ ] Add referral_source: "Old Students Association"
- [ ] Consider auto-approve for known members
- [ ] Batch import in groups of 50-100 for easier management

### General Tips

- [ ] Test with 5-10 members first
- [ ] Import during off-peak hours
- [ ] Keep original CSV as backup
- [ ] Document any special cases
- [ ] Communicate with members before import
- [ ] Have payment collection plan ready

## Final Checklist

- [ ] All members imported successfully
- [ ] No pending errors
- [ ] Members can login (if auto-approved)
- [ ] Sports enrollments correct
- [ ] Payment records created
- [ ] Import logged in history
- [ ] Members notified
- [ ] Documentation updated

---

**Import Date:** _______________
**Total Members:** _______________
**Successfully Imported:** _______________
**Failed:** _______________
**Notes:** 
_____________________________________
_____________________________________
_____________________________________
