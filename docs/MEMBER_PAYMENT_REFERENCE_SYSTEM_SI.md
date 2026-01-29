# Member Number & Payment Reference System - සිංහල උපදෙස්

## සාරාංශය

මෙම system එක මගින් ඔබට පහත දේවල් කරන්න පුළුවන්:

### 1. Member Number Control කිරීම

Settings page එක හරහා member numbers control කරන්න පුළුවන්:

**උදාහරණ:**
- `SC0001`, `SC0002`, `SC0003` - "SC" prefix එකත් එක්ක
- `M0001`, `M0002`, `M0003` - "M" prefix එකත් එක්ක
- `NYSC001`, `NYSC002` - "NYSC" prefix එකත් එක්ක

**Settings:**
- **Prefix**: ඔබට අවශ්‍ය prefix එක (SC, M, NYSC, etc.)
- **Digits**: Number එකේ digits ගණන (4 = 0001)
- **Starting Number**: පළමු number එක (සාමාන්‍යයෙන් 1)

### 2. Sport-Specific Payment References

Payment reference numbers automatic ව generate වෙනවා මේ විදියට:

**Format:** `{වසර}-{Sport Code}-{අංකය}`

**උදාහරණ:**
- `26-SW-0001` - 2026 වසරේ Swimming සඳහා පළමු payment
- `26-CR-0001` - 2026 වසරේ Cricket සඳහා පළමු payment
- `26-FB-0001` - 2026 වසරේ Football සඳහා පළමු payment
- `27-SW-0001` - 2027 වසරේ Swimming සඳහා පළමු payment (අලුත් වසරකට අංකය reset වෙනවා)

**වැදගත්:**
- හැම sport එකකටම වෙන වෙනම numbering sequence එකක් තියෙනවා
- හැම වසරකටම අංකය 0001 ඉඳන් පටන් ගන්නවා
- Main member number එක (SC0001) වෙනස් වෙන්නේ නැහැ

### 3. Sport Short Codes

හැම sport එකකටම short code එකක් තියෙන්න ඕන:

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

## Setup කරන විදිය

### 1. Database Migrations Run කරන්න

```bash
php artisan migrate
```

### 2. Default Settings Add කරන්න

```bash
php artisan db:seed --class=SettingSeeder
php artisan db:seed --class=SportShortCodeSeeder
```

## Settings වෙනස් කරන විදිය

### Admin Panel එකෙන්

1. Admin Panel එකට login වෙන්න
2. **Settings** menu එකට යන්න
3. **Member Settings** tab එකෙන්:
   - Member Number Prefix වෙනස් කරන්න (SC, M, NYSC, etc.)
   - Digits ගණන වෙනස් කරන්න
   - Starting number වෙනස් කරන්න

4. **Payment Settings** tab එකෙන්:
   - Year format වෙනස් කරන්න (yy හෝ yyyy)
   - Payment reference digits වෙනස් කරන්න

5. **Save Settings** button එක click කරන්න

### Sport Short Code Add කරන විදිය

1. **Admin → Sports** යන්න
2. Sport එකක් select කරන්න (Edit)
3. **Short Code** field එකට code එක type කරන්න (උදා: SW, CR, FB)
4. Save කරන්න

## භාවිතා කරන විදිය

### Automatic Generation

Payment එකක් create කරන වෙලාවේ reference number automatic ව generate වෙනවා:

1. Member එකක් select කරන්න
2. Sport එකක් select කරන්න
3. Payment details enter කරන්න
4. Submit කරන්න
5. System එක automatically reference number එකක් generate කරනවා

**උදාහරණය:**
- Sport: Swimming (SW)
- Year: 2026
- Generated Reference: `26-SW-0001`

### Multi-Sport Payments

කෙනෙක් sports කීපයකට එකවර payment කරන්න නම්:
- Reference Format: `26-ALL-0001`

## Preview

### Member Number Preview

Settings වෙනස් කරන වෙලාවේ preview එකක් පෙන්නන්න:

**Current Settings:**
- Prefix: SC
- Digits: 4
- Starting: 1

**Preview:** `SC0001`

### Payment Reference Preview

**Swimming Payment:**
- Year: 26 (2026)
- Sport: SW
- Number: 0001
- **Result:** `26-SW-0001`

**Cricket Payment:**
- Year: 26 (2026)
- Sport: CR
- Number: 0001
- **Result:** `26-CR-0001`

## වැදගත් කරුණු

1. **Member Numbers:**
   - Settings වලින් control කරන්න පුළුවන්
   - Continue ව increment වෙනවා (reset වෙන්නේ නැහැ)
   - Prefix එක ඕනෑම වෙලාවක වෙනස් කරන්න පුළුවන්

2. **Payment References:**
   - Automatic ව generate වෙනවා
   - Sport එකක් select කළාම එයාගේ short code එක use කරනවා
   - හැම වසරකටම reset වෙනවා (0001 ඉඳන් පටන් ගන්නවා)

3. **Sport Short Codes:**
   - හැම sport එකකටම short code එකක් තියෙන්න ඕන
   - Short code නැත්නම් payment create කරන්න බැහැ
   - Admin panel එකෙන් add කරන්න පුළුවන්

## Troubleshooting

### Sport එකට Short Code නැත්නම්

**Error:** "Sport 'Swimming' does not have a short code configured."

**විසඳුම:**
1. Admin → Sports යන්න
2. Sport එක edit කරන්න
3. Short Code field එකට code එකක් add කරන්න (උදා: SW)
4. Save කරන්න

### Settings වැඩ කරන්නේ නැත්නම්

1. Settings page එකෙන් settings save කළාද බලන්න
2. Browser refresh කරන්න
3. Cache clear කරන්න: `php artisan cache:clear`

## සාරාංශය

මේ system එක මගින්:

✅ Member numbers Settings වලින් control කරන්න පුළුවන්
✅ Sport-specific payment references automatic ව generate වෙනවා
✅ හැම sport එකකටම වෙන වෙනම numbering තියෙනවා
✅ හැම වසරකටම payment numbers reset වෙනවා
✅ Admin panel එකෙන් හැම දෙයක්ම manage කරන්න පුළුවන්

## උදව් අවශ්‍ය නම්

Documentation file එක බලන්න: `docs/MEMBER_PAYMENT_REFERENCE_SYSTEM.md`
