# Payment Items System - Implementation Guide

## Overview

This document explains the new **Payment Items** system that allows tracking admission fees and monthly fees under a single receipt number with sport-specific breakdown.

## What Changed?

### Before (Old System)
- ❌ Separate payment records for admission and monthly fees
- ❌ Different receipt numbers for each payment
- ❌ No sport-specific tracking for admission fees
- ❌ No automatic pending payment creation on member approval

### After (New System)
- ✅ Single payment record with multiple line items
- ✅ One receipt number for all fees (admission + monthly)
- ✅ Sport-specific tracking for each fee
- ✅ Automatic pending payment creation when member is approved
- ✅ Clear breakdown of charges per sport

---

## Database Structure

### New Table: `payment_items`

```sql
CREATE TABLE payment_items (
    id UUID PRIMARY KEY,
    payment_id UUID FOREIGN KEY -> payments.id,
    sport_id UUID FOREIGN KEY -> sports.id (nullable),
    type ENUM('admission', 'monthly'),
    amount DECIMAL(10,2),
    month_year VARCHAR (nullable, for monthly fees),
    description TEXT (nullable),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Example Data

**Payment Record:**
```
ID: abc-123
Member: John Doe
Receipt Number: NYSC-2026-001
Type: admission
Status: pending
Amount: 3000.00
Due Date: 2026-02-05
```

**Payment Items:**
```
Item 1:
  - Sport: Cricket
  - Type: admission
  - Amount: 1000.00
  - Description: "Cricket - Admission Fee"

Item 2:
  - Sport: Cricket
  - Type: monthly
  - Amount: 500.00
  - Month: 2026-01
  - Description: "Cricket - Monthly Fee (2026-01)"

Item 3:
  - Sport: Swimming
  - Type: admission
  - Amount: 800.00
  - Description: "Swimming - Admission Fee"

Item 4:
  - Sport: Swimming
  - Type: monthly
  - Amount: 700.00
  - Month: 2026-01
  - Description: "Swimming - Monthly Fee (2026-01)"
```

**Total: Rs. 3,000.00** (under one receipt: NYSC-2026-001)

---

## Workflow

### 1. Member Registration
```
Member registers online/admin creates → Status: PENDING
```

### 2. Admin Approval
```
Admin approves member
    ↓
System automatically:
    1. Updates member status to ACTIVE
    2. Generates sport-specific references
    3. Creates PENDING payment with items:
       - Admission fee for each enrolled sport
       - First month fee for each enrolled sport
    4. Generates receipt number
    5. Sets due date (7 days from approval)
```

### 3. Payment Collection
```
Member pays → Admin marks payment as paid
    ↓
System automatically:
    1. Updates payment status to VERIFIED
    2. Records payment method
    3. Generates payment reference number
    4. Updates payment schedules for monthly fees
    5. Logs the transaction
```

---

## Code Examples

### Creating Pending Payment (Automatic on Approval)

```php
// In ApproveMemberRegistrationAction.php
$createPendingPayment = new CreatePendingAdmissionPaymentAction();
$pendingPayment = $createPendingPayment->execute($member);

// This creates:
// - 1 Payment record (status: pending)
// - Multiple PaymentItem records (one for each fee)
```

### Marking Payment as Paid

```php
// In PaymentController.php
$markAsPaid = new MarkPaymentAsPaidAction();
$markAsPaid->execute(
    $payment,
    $paymentMethod,  // 'cash', 'bank_transfer', 'online'
    $referenceNumber // optional
);

// This updates:
// - Payment status to VERIFIED
// - Payment schedules to PAID
// - Logs the activity
```

### Displaying Payment Items (Frontend)

```typescript
// In PaymentsCard.tsx
{payment.items && payment.items.length > 0 && (
    payment.items.map(item => (
        <tr key={item.id}>
            <td>{item.description}</td>
            <td>{item.sport?.name}</td>
            <td>Rs. {Number(item.amount).toFixed(2)}</td>
        </tr>
    ))
)}
```

---

## API Response Structure

### Member Show Page Data

```json
{
  "member": {
    "id": "abc-123",
    "full_name": "John Doe",
    "payments": [
      {
        "id": "pay-001",
        "receipt_number": "NYSC-2026-001",
        "type": "admission",
        "status": "pending",
        "amount": 3000.00,
        "due_date": "2026-02-05",
        "items": [
          {
            "id": "item-001",
            "sport_id": "sport-cricket",
            "type": "admission",
            "amount": 1000.00,
            "description": "Cricket - Admission Fee",
            "sport": {
              "name": "Cricket"
            }
          },
          {
            "id": "item-002",
            "sport_id": "sport-cricket",
            "type": "monthly",
            "amount": 500.00,
            "month_year": "2026-01",
            "description": "Cricket - Monthly Fee (2026-01)",
            "sport": {
              "name": "Cricket"
            }
          }
        ]
      }
    ]
  }
}
```

---

## UI Display

### Pending Payments Section

```
┌─────────────────────────────────────────────────────────────┐
│ Upcoming Due Payments                                       │
├─────────────────────────────────────────────────────────────┤
│ Description          │ Sport      │ Amount    │ Due Date   │
├─────────────────────────────────────────────────────────────┤
│ Admission            │ 2 Sports   │ Rs. 3,000 │ 2026-02-05 │
│ Receipt: NYSC-2026-001                                      │
│   • Cricket - Admission Fee    │ Cricket    │ Rs. 1,000   │
│   • Cricket - Monthly (2026-01)│ Cricket    │ Rs.   500   │
│   • Swimming - Admission Fee   │ Swimming   │ Rs.   800   │
│   • Swimming - Monthly (2026-01)│ Swimming  │ Rs.   700   │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits

### For Administrators
1. **Single Transaction**: One receipt for all initial fees
2. **Clear Breakdown**: See exactly what each fee is for
3. **Sport Tracking**: Know which sport each payment is for
4. **Automatic Creation**: No manual payment record creation needed
5. **Better Reporting**: Easier to track admission vs monthly revenue

### For Members
1. **Simple Payment**: Pay everything at once
2. **Clear Receipt**: One receipt number to reference
3. **Transparent Charges**: See breakdown of all fees
4. **Easy Tracking**: Know exactly what was paid

### For Accounting
1. **Audit Trail**: Complete breakdown of each payment
2. **Sport Revenue**: Track revenue per sport
3. **Fee Type Tracking**: Separate admission from monthly revenue
4. **Reconciliation**: Easier to match payments to invoices

---

## Migration Path

### For Existing Data
- Old payments remain unchanged
- New system only applies to members approved after implementation
- Both systems work side-by-side

### For New Members
- All new approvals use the payment items system
- Automatic pending payment creation
- Enforced sport-specific tracking

---

## Testing Checklist

- [ ] Create new member with multiple sports
- [ ] Approve member
- [ ] Verify pending payment is created
- [ ] Verify payment items are created correctly
- [ ] Check receipt number is generated
- [ ] Mark payment as paid
- [ ] Verify payment schedules are updated
- [ ] Check frontend displays items correctly
- [ ] Verify total amount matches sum of items
- [ ] Test with single sport enrollment
- [ ] Test with multiple sport enrollment

---

## Troubleshooting

### Issue: Payment items not showing
**Solution**: Ensure payment is loaded with items:
```php
$member->load('payments.items.sport');
```

### Issue: Pending payment not created on approval
**Solution**: Check if member has enrolled sports:
```php
$member->sports; // Must not be empty
```

### Issue: Payment schedules not updating
**Solution**: Verify payment items have correct `month_year` for monthly fees

---

## Future Enhancements

1. **Partial Payments**: Allow paying individual items separately
2. **Discounts**: Apply discounts to specific items
3. **Installments**: Split payment into multiple installments
4. **Bulk Operations**: Process multiple pending payments at once
5. **PDF Receipts**: Generate detailed receipts with item breakdown

---

## Related Files

### Backend
- `app/Models/PaymentItem.php` - Model
- `app/Actions/CreatePendingAdmissionPaymentAction.php` - Create pending payment
- `app/Actions/MarkPaymentAsPaidAction.php` - Mark payment as paid
- `app/Actions/ApproveMemberRegistrationAction.php` - Updated approval flow
- `database/migrations/2026_01_29_104700_create_payment_items_table.php` - Migration

### Frontend
- `resources/js/components/members/types.ts` - TypeScript types
- `resources/js/components/members/PaymentsCard.tsx` - Display component
- `resources/js/Pages/Admin/Members/Show.tsx` - Member details page

---

## Support

For questions or issues, refer to:
- Main documentation: `IMPLEMENTATION_SUMMARY.md`
- Quick reference: `QUICK_REFERENCE.md`
- Payment system docs: `docs/MEMBER_PAYMENT_REFERENCE_SYSTEM.md`
