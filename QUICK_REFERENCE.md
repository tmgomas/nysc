# Quick Reference Card

## Member Number System

### Current Default Settings
```
Prefix:        SC
Digits:        4
Starting:      1
Result:        SC0001, SC0002, SC0003...
```

### How to Change
1. Go to: `/admin/settings`
2. Tab: **Member Settings**
3. Change: Prefix, Digits, or Starting Number
4. Click: **Save Settings**

---

## Payment Reference System

### Format
```
{Year}-{Sport Code}-{Number}
```

### Examples
| Sport | Code | Example Reference |
|-------|------|------------------|
| Swimming | SW | 26-SW-0001 |
| Cricket | CR | 26-CR-0001 |
| Football | FB | 26-FB-0001 |
| Multi-sport | ALL | 26-ALL-0001 |

### How It Works
1. **Year**: Current year (2-digit: 26 or 4-digit: 2026)
2. **Sport Code**: Short code from sport settings (SW, CR, FB, etc.)
3. **Number**: Auto-increments per sport per year (resets yearly)

---

## Sport Short Codes

### Common Codes
```
SW  - Swimming          CR  - Cricket
FB  - Football          BB  - Basketball
VB  - Volleyball        TN  - Tennis
BD  - Badminton         TT  - Table Tennis
AT  - Athletics         NB  - Netball
RG  - Rugby             HK  - Hockey
```

### How to Add/Edit
1. Go to: `/admin/sports`
2. Click: **Edit** on a sport
3. Enter: Short Code (2-3 letters, uppercase)
4. Click: **Save**

---

## Quick Commands

### Setup (First Time)
```bash
php artisan migrate
php artisan db:seed --class=SettingSeeder
php artisan db:seed --class=SportShortCodeSeeder
```

### Clear Cache
```bash
php artisan cache:clear
```

---

## Important URLs

| Page | URL |
|------|-----|
| Settings | `/admin/settings` |
| Sports | `/admin/sports` |
| Members | `/admin/members` |
| Payments | `/admin/payments` |

---

## Troubleshooting

### ❌ "Sport does not have a short code"
**Fix:** Add short code to sport in `/admin/sports`

### ❌ Settings not working
**Fix:** 
1. Check if settings were saved
2. Clear cache: `php artisan cache:clear`
3. Refresh browser

### ❌ Duplicate reference numbers
**Fix:** Check database for data integrity issues

---

## Key Points

✅ Member numbers **never reset** (continue: SC0001, SC0002, SC0003...)
✅ Payment references **reset yearly** (26-SW-0001 → 27-SW-0001)
✅ Each sport has **separate numbering** (SW-0001, CR-0001)
✅ Settings are **stored in database** (no code changes needed)
✅ Short codes are **required** for payment generation

---

## Support

📖 Full Documentation: `docs/MEMBER_PAYMENT_REFERENCE_SYSTEM.md`
🇱🇰 Sinhala Guide: `docs/MEMBER_PAYMENT_REFERENCE_SYSTEM_SI.md`
📋 Implementation: `IMPLEMENTATION_SUMMARY.md`
