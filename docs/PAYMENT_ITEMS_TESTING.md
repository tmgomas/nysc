# Testing Checklist - Payment Items System

## Pre-Testing Setup

- [ ] Database migrated successfully
- [ ] At least 2 active sports exist in database
- [ ] Sports have admission_fee and monthly_fee set
- [ ] Sports have short_code set (e.g., CR, SW, FB)

---

## Test 1: Single Sport Enrollment

### Steps:
1. Create new member with 1 sport (e.g., Cricket)
2. Approve the member
3. Check member details page

### Expected Results:
- [ ] Member status changed to ACTIVE
- [ ] Sport reference generated (e.g., 26-CR-0001)
- [ ] Pending payment created
- [ ] Receipt number generated (e.g., NYSC-2026-001)
- [ ] Payment has 2 items:
  - [ ] Cricket - Admission Fee
  - [ ] Cricket - Monthly Fee (current month)
- [ ] Total amount = admission_fee + monthly_fee
- [ ] Due date = 7 days from approval

### Database Verification:
```sql
-- Check payment
SELECT * FROM payments WHERE member_id = '{member_id}';

-- Check payment items
SELECT pi.*, s.name as sport_name 
FROM payment_items pi 
LEFT JOIN sports s ON pi.sport_id = s.id 
WHERE pi.payment_id = '{payment_id}';

-- Should show 2 items
```

---

## Test 2: Multi-Sport Enrollment

### Steps:
1. Create new member with 3 sports (Cricket, Swimming, Football)
2. Approve the member
3. Check member details page

### Expected Results:
- [ ] Member status changed to ACTIVE
- [ ] 3 sport references generated
- [ ] Pending payment created
- [ ] Payment has 6 items:
  - [ ] Cricket - Admission Fee
  - [ ] Cricket - Monthly Fee
  - [ ] Swimming - Admission Fee
  - [ ] Swimming - Monthly Fee
  - [ ] Football - Admission Fee
  - [ ] Football - Monthly Fee
- [ ] Total amount = sum of all 6 items
- [ ] Sport badge shows "3 Sports"

### Database Verification:
```sql
-- Check payment items count
SELECT COUNT(*) FROM payment_items WHERE payment_id = '{payment_id}';
-- Should return 6

-- Check total matches
SELECT SUM(amount) FROM payment_items WHERE payment_id = '{payment_id}';
-- Should match payment.amount
```

---

## Test 3: Payment Display

### Steps:
1. Go to member details page with pending payment
2. Navigate to "Payments" tab

### Expected Results:
- [ ] Pending payment shows in "Upcoming Due Payments"
- [ ] Receipt number displayed
- [ ] Total amount displayed in bold
- [ ] Sport badge shows correct count
- [ ] Payment items breakdown visible
- [ ] Each item shows:
  - [ ] Description
  - [ ] Sport name
  - [ ] Amount
  - [ ] Month (for monthly fees)

### UI Verification:
- [ ] Main payment row has amber background
- [ ] Item rows have lighter background
- [ ] Bullet points visible for items
- [ ] Amounts align to right
- [ ] Font is monospace for amounts

---

## Test 4: Mark Payment as Paid

### Steps:
1. Find pending payment
2. Click "Record Payment" button
3. Select payment from dropdown
4. Choose payment method (cash/bank_transfer/online)
5. Submit

### Expected Results:
- [ ] Payment status changed to VERIFIED
- [ ] Payment method recorded
- [ ] Reference number generated
- [ ] Paid date set to today
- [ ] Verified by set to current admin
- [ ] Payment schedules updated:
  - [ ] Cricket 2026-01 → PAID
  - [ ] Swimming 2026-01 → PAID
  - [ ] Football 2026-01 → PAID
- [ ] Activity log created

### Database Verification:
```sql
-- Check payment updated
SELECT status, payment_method, paid_date, reference_number 
FROM payments WHERE id = '{payment_id}';

-- Check schedules updated
SELECT month_year, status, payment_id 
FROM member_payment_schedules 
WHERE member_id = '{member_id}' AND month_year = '2026-01';
-- All should be PAID with payment_id set
```

---

## Test 5: Payment History Display

### Steps:
1. After marking payment as paid
2. Check "Recent Payment History" section

### Expected Results:
- [ ] Payment appears in history
- [ ] Shows paid date
- [ ] Shows receipt number
- [ ] Shows reference number
- [ ] Amount in green
- [ ] Items breakdown visible
- [ ] All items listed with details

---

## Test 6: Edge Cases

### Test 6a: Member with No Sports
**Steps:**
1. Try to approve member with no enrolled sports

**Expected:**
- [ ] Error message: "Member must have at least one active sport"
- [ ] Member status remains PENDING

### Test 6b: Already Approved Member
**Steps:**
1. Try to approve already active member

**Expected:**
- [ ] Error message: "Only pending members can be approved"
- [ ] No duplicate payment created

### Test 6c: Mark Non-Pending Payment
**Steps:**
1. Try to mark already paid payment as paid again

**Expected:**
- [ ] Error message: "Only pending payments can be marked as paid"
- [ ] Payment status unchanged

---

## Test 7: Data Integrity

### Verification Queries:

```sql
-- 1. All payment items should have valid sport_id
SELECT COUNT(*) FROM payment_items WHERE sport_id IS NULL;
-- Should be 0

-- 2. Payment amount should equal sum of items
SELECT 
    p.id,
    p.amount as payment_amount,
    SUM(pi.amount) as items_total,
    (p.amount - SUM(pi.amount)) as difference
FROM payments p
LEFT JOIN payment_items pi ON p.id = pi.payment_id
WHERE p.type = 'admission'
GROUP BY p.id
HAVING difference != 0;
-- Should return 0 rows

-- 3. All admission payments should have items
SELECT COUNT(*) 
FROM payments p
LEFT JOIN payment_items pi ON p.id = pi.payment_id
WHERE p.type = 'admission' 
AND p.created_at > '2026-01-29'  -- After implementation
AND pi.id IS NULL;
-- Should be 0

-- 4. Each sport should have 2 items (admission + monthly)
SELECT 
    p.id,
    pi.sport_id,
    s.name,
    COUNT(*) as item_count
FROM payments p
JOIN payment_items pi ON p.id = pi.payment_id
JOIN sports s ON pi.sport_id = s.id
WHERE p.type = 'admission'
GROUP BY p.id, pi.sport_id, s.name
HAVING item_count != 2;
-- Should return 0 rows (each sport should have exactly 2 items)
```

---

## Test 8: Performance

### Load Test:
1. Create 10 members with 3 sports each
2. Approve all 10 members
3. Check page load time for member list
4. Check page load time for member details

### Expected:
- [ ] No N+1 query issues
- [ ] Payment items eager-loaded
- [ ] Page loads in < 2 seconds

### Query Monitoring:
```php
// In MemberController::show()
// Should see these queries:
// 1. SELECT * FROM members WHERE id = ?
// 2. SELECT * FROM payments WHERE member_id = ? (with items.sport)
// 3. SELECT * FROM payment_schedules WHERE member_id = ?
// Total: ~3-5 queries (not 10+)
```

---

## Test 9: TypeScript Type Safety

### Frontend Tests:
1. Open browser console
2. Navigate to member details page
3. Check for TypeScript errors

**Expected:**
- [ ] No type errors in console
- [ ] Payment.items is properly typed
- [ ] PaymentItem interface working
- [ ] No "undefined" errors when accessing item properties

---

## Test 10: Backward Compatibility

### Steps:
1. Find old payment (created before implementation)
2. View on member details page

**Expected:**
- [ ] Old payment displays correctly
- [ ] No items breakdown shown (items is undefined)
- [ ] No JavaScript errors
- [ ] Sport name shows correctly (from payment.sport)

---

## Regression Tests

### Test existing functionality still works:
- [ ] Member registration
- [ ] Member listing
- [ ] Member search
- [ ] Sport management
- [ ] Attendance marking
- [ ] Payment schedules generation
- [ ] Monthly payment processing
- [ ] Bulk payment processing

---

## Success Criteria

All tests must pass:
- ✅ Single sport enrollment works
- ✅ Multi-sport enrollment works
- ✅ Payment items created correctly
- ✅ UI displays breakdown properly
- ✅ Mark as paid updates schedules
- ✅ Data integrity maintained
- ✅ No performance issues
- ✅ Type safety enforced
- ✅ Backward compatible

---

## Bug Reporting Template

If you find issues, report using this format:

```
**Test:** [Test number and name]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshots:**
[Attach if applicable]

**Database State:**
[Relevant SQL query results]

**Console Errors:**
[Browser console errors if any]
```

---

## Post-Testing

After all tests pass:
- [ ] Document any issues found
- [ ] Create tickets for bugs
- [ ] Update documentation if needed
- [ ] Train administrators on new workflow
- [ ] Monitor production for first week
- [ ] Collect user feedback

---

**Tester:** _______________  
**Date:** _______________  
**Environment:** Development / Staging / Production  
**Status:** ⬜ Pass ⬜ Fail ⬜ Partial
