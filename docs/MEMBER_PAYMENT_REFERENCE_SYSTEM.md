# Member Number & Payment Reference System

## Overview

This system provides configurable member numbering and sport-specific payment reference numbers.

## Features

### 1. Member Number Configuration

Member numbers can be controlled through the Settings page:

- **Prefix**: Customizable prefix (e.g., SC, M, NYSC)
- **Digits**: Number of digits in the sequence (e.g., 4 for 0001)
- **Starting Number**: The first number in the sequence

**Example Formats:**
- `SC0001`, `SC0002`, `SC0003` (with prefix "SC", 4 digits)
- `M0001`, `M0002`, `M0003` (with prefix "M", 4 digits)
- `NYSC001`, `NYSC002` (with prefix "NYSC", 3 digits)

### 2. Sport-Specific Payment References

Payment references are automatically generated based on:
- **Year**: Current year (2-digit or 4-digit format)
- **Sport Code**: Short code for the sport (e.g., SW for Swimming)
- **Sequential Number**: Auto-incrementing number per sport per year

**Format:** `{YEAR}-{SPORT_CODE}-{NUMBER}`

**Examples:**
- `26-SW-0001` - First Swimming payment in 2026
- `26-CR-0001` - First Cricket payment in 2026
- `26-FB-0001` - First Football payment in 2026
- `27-SW-0001` - First Swimming payment in 2027 (resets each year)

### 3. Multi-Sport Payments

For payments covering multiple sports:
- **Format:** `{YEAR}-ALL-{NUMBER}`
- **Example:** `26-ALL-0001`

## Configuration

### Settings Page

Access: **Admin → Settings**

#### Member Settings Tab
- **Member Number Prefix**: The prefix for all member numbers
- **Number of Digits**: How many digits in the sequence
- **Starting Number**: First number to use

#### Payment Settings Tab
- **Reference Format**: Template for payment references
- **Number of Digits**: Digits in payment sequence
- **Year Format**: 
  - `yy` = 2-digit year (26)
  - `yyyy` = 4-digit year (2026)

### Sport Short Codes

Each sport must have a short code configured. Common codes:

| Sport | Short Code |
|-------|-----------|
| Swimming | SW |
| Cricket | CR |
| Football | FB |
| Basketball | BB |
| Volleyball | VB |
| Tennis | TN |
| Badminton | BD |
| Table Tennis | TT |
| Athletics | AT |
| Netball | NB |
| Rugby | RG |
| Hockey | HK |

## Database Setup

### Run Migrations

```bash
php artisan migrate
```

This will create:
- `settings` table
- `short_code` column in `sports` table

### Seed Default Settings

```bash
php artisan db:seed --class=SettingSeeder
php artisan db:seed --class=SportShortCodeSeeder
```

## Usage

### Automatic Generation

Payment references are automatically generated when:
1. Processing a new payment
2. No reference number is provided
3. The system generates one based on sport and date

### Manual Override

You can still provide a custom reference number when creating a payment:

```php
$payment = (new ProcessPaymentAction())->execute(
    member: $member,
    type: PaymentType::MONTHLY,
    amount: 1000,
    paymentMethod: 'cash',
    monthYear: '2026-01',
    referenceNumber: 'CUSTOM-REF-001', // Optional: Override auto-generation
    sportId: $sportId
);
```

### Programmatic Access

#### Get Settings

```php
use App\Models\Setting;

// Get a single setting
$prefix = Setting::get('member_number_prefix', 'SC');

// Get all settings grouped
$settings = Setting::getAllGrouped();
```

#### Set Settings

```php
Setting::set('member_number_prefix', 'NYSC', 'string', 'member');
```

#### Generate Member Number

```php
use App\Actions\GenerateMemberNumberAction;

$memberNumber = (new GenerateMemberNumberAction())->execute();
// Returns: SC0001 (based on current settings)
```

#### Generate Payment Reference

```php
use App\Actions\GeneratePaymentReferenceAction;

// For a specific sport
$reference = (new GeneratePaymentReferenceAction())->execute($sportId);
// Returns: 26-SW-0001

// For multiple sports
$reference = (new GeneratePaymentReferenceAction())->executeForMultipleSports();
// Returns: 26-ALL-0001
```

## API Endpoints

### Settings

```
GET    /admin/settings              - View all settings
POST   /admin/settings              - Update multiple settings
GET    /admin/settings/{key}        - Get specific setting
PUT    /admin/settings/{key}        - Update specific setting
```

## Important Notes

1. **Year Reset**: Payment reference numbers reset each year per sport
2. **Sport Codes**: Each sport MUST have a short code before payments can be processed
3. **Member Numbers**: Continue sequentially and do NOT reset
4. **Settings Cache**: Settings are read from database on each request (no caching)

## Troubleshooting

### Sport Missing Short Code

**Error:** "Sport 'Swimming' does not have a short code configured."

**Solution:**
1. Go to Admin → Sports
2. Edit the sport
3. Add a short code (e.g., SW)
4. Save

### Member Number Not Following Settings

**Issue:** New members still getting old format

**Solution:**
1. Check Settings page for current configuration
2. Verify settings were saved successfully
3. Clear application cache: `php artisan cache:clear`

### Payment Reference Duplicates

**Issue:** Same reference number for different payments

**Solution:**
- This shouldn't happen as the system checks for the last payment
- If it does, check database for data integrity
- Ensure `created_at` timestamps are correct

## Future Enhancements

Potential improvements:
- [ ] Settings caching for performance
- [ ] Bulk update sport codes
- [ ] Import/export settings
- [ ] Setting change history/audit log
- [ ] Validation rules for setting values
- [ ] Setting groups and categories
