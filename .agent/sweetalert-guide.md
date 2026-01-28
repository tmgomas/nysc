# Sweet Alert 2 - Usage Guide

Sweet Alert 2 globally add කරලා තියෙනවා. මෙන්න භාවිතා කරන විදිය:

## 📚 Table of Contents

1. [Basic Alerts](#basic-alerts)
2. [Toast Notifications](#toast-notifications)
3. [Confirmation Dialogs](#confirmation-dialogs)
4. [Input Dialogs](#input-dialogs)
5. [Loading Indicators](#loading-indicators)
6. [Laravel Flash Messages](#laravel-flash-messages)
7. [Advanced Usage](#advanced-usage)

---

## 🎨 Basic Alerts

### Success Alert

```typescript
import { showSuccess } from '@/utils/sweetalert';

// Simple success
showSuccess('Success!', 'Your operation was successful');

// With custom options
showSuccess('Success!', 'Member approved successfully', {
    timer: 3000,
    timerProgressBar: true,
});
```

### Error Alert

```typescript
import { showError } from '@/utils/sweetalert';

showError('Error!', 'Something went wrong');
```

### Warning Alert

```typescript
import { showWarning } from '@/utils/sweetalert';

showWarning('Warning!', 'Please check your input');
```

### Info Alert

```typescript
import { showInfo } from '@/utils/sweetalert';

showInfo('Information', 'Here is some important information');
```

---

## 🍞 Toast Notifications

Toast notifications are small, auto-dismiss alerts that appear in the corner.

### Success Toast

```typescript
import { showSuccessToast } from '@/utils/sweetalert';

// Default position (top-end)
showSuccessToast('Payment processed successfully!');

// Custom position
showSuccessToast('Member created!', 'bottom-end');
```

### Error Toast

```typescript
import { showErrorToast } from '@/utils/sweetalert';

showErrorToast('Failed to save data');
```

### Warning Toast

```typescript
import { showWarningToast } from '@/utils/sweetalert';

showWarningToast('Please fill all required fields');
```

### Info Toast

```typescript
import { showInfoToast } from '@/utils/sweetalert';

showInfoToast('New notification received');
```

### Custom Toast

```typescript
import { showToast } from '@/utils/sweetalert';

showToast('success', 'Custom message', 'top-start', 5000);
```

**Available Positions:**
- `top`
- `top-start`
- `top-end`
- `center`
- `bottom`
- `bottom-start`
- `bottom-end`

---

## ❓ Confirmation Dialogs

### Basic Confirmation

```typescript
import { showConfirm } from '@/utils/sweetalert';

const result = await showConfirm(
    'Are you sure?',
    'Do you want to proceed with this action?'
);

if (result.isConfirmed) {
    // User clicked "Yes"
    console.log('Confirmed!');
} else {
    // User clicked "No" or closed the dialog
    console.log('Cancelled');
}
```

### Delete Confirmation

```typescript
import { showDeleteConfirm } from '@/utils/sweetalert';

const result = await showDeleteConfirm('John Doe');

if (result.isConfirmed) {
    // Proceed with deletion
    await deleteMember(memberId);
    showSuccessToast('Member deleted successfully');
}
```

### Example in Component

```typescript
import { router } from '@inertiajs/react';
import { showDeleteConfirm, showSuccessToast } from '@/utils/sweetalert';

function MemberCard({ member }) {
    const handleDelete = async () => {
        const result = await showDeleteConfirm(member.full_name);
        
        if (result.isConfirmed) {
            router.delete(`/admin/members/${member.id}`, {
                onSuccess: () => {
                    showSuccessToast('Member deleted successfully');
                },
            });
        }
    };

    return (
        <div>
            <h3>{member.full_name}</h3>
            <button onClick={handleDelete}>Delete</button>
        </div>
    );
}
```

---

## 📝 Input Dialogs

### Text Input

```typescript
import { showInput } from '@/utils/sweetalert';

const result = await showInput('Enter your name', 'text', 'John Doe');

if (result.isConfirmed) {
    const name = result.value;
    console.log('Name:', name);
}
```

### Email Input

```typescript
const result = await showInput('Enter email', 'email', 'user@example.com');
```

### Number Input

```typescript
const result = await showInput('Enter amount', 'number', '1000');
```

### Textarea Input

```typescript
const result = await showInput(
    'Enter reason for suspension',
    'textarea',
    'Type here...'
);

if (result.isConfirmed) {
    const reason = result.value;
    // Use the reason
}
```

### Select Dropdown

```typescript
import { showSelect } from '@/utils/sweetalert';

const sports = {
    '1': 'Cricket',
    '2': 'Football',
    '3': 'Basketball',
};

const result = await showSelect(
    'Select a sport',
    sports,
    'Choose sport'
);

if (result.isConfirmed) {
    const sportId = result.value;
    console.log('Selected sport ID:', sportId);
}
```

---

## ⏳ Loading Indicators

### Show Loading

```typescript
import { showLoading, closeLoading } from '@/utils/sweetalert';

// Show loading
showLoading('Processing payment...', 'Please wait');

// Perform async operation
await processPayment();

// Close loading
closeLoading();

// Show success
showSuccessToast('Payment processed!');
```

### Example with API Call

```typescript
import { showLoading, closeLoading, showSuccessToast, showErrorToast } from '@/utils/sweetalert';

async function saveData() {
    showLoading('Saving...', 'Please wait while we save your data');

    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        closeLoading();

        if (response.ok) {
            showSuccessToast('Data saved successfully!');
        } else {
            showErrorToast('Failed to save data');
        }
    } catch (error) {
        closeLoading();
        showErrorToast('An error occurred');
    }
}
```

---

## 🔔 Laravel Flash Messages

Flash messages from Laravel are automatically displayed as toasts!

### Backend (Laravel)

```php
// In your controller
public function store(Request $request)
{
    // Your logic here
    
    // Success message
    return redirect()->back()->with('success', 'Member created successfully!');
    
    // Error message
    return redirect()->back()->with('error', 'Failed to create member');
    
    // Warning message
    return redirect()->back()->with('warning', 'Please verify your email');
    
    // Info message
    return redirect()->back()->with('info', 'Your profile is 80% complete');
}
```

### Frontend (Automatic)

Flash messages are automatically displayed! No need to do anything in your components.

The `FlashMessages` component is already added to the app layout.

---

## 🚀 Advanced Usage

### Custom Alert with HTML

```typescript
import { showCustom } from '@/utils/sweetalert';

showCustom({
    title: 'Custom Alert',
    html: `
        <div>
            <p>This is a custom alert with HTML content</p>
            <ul>
                <li>Item 1</li>
                <li>Item 2</li>
            </ul>
        </div>
    `,
    icon: 'info',
    confirmButtonText: 'Got it!',
});
```

### Using Swal Directly

```typescript
import { Swal } from '@/utils/sweetalert';

Swal.fire({
    title: 'Advanced Alert',
    text: 'With full control',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, do it!',
}).then((result) => {
    if (result.isConfirmed) {
        // Do something
    }
});
```

### Chaining Alerts

```typescript
import { showSuccess, showConfirm } from '@/utils/sweetalert';

const result = await showConfirm('Save changes?', 'Do you want to save your changes?');

if (result.isConfirmed) {
    // Save data
    await saveData();
    
    // Show success
    await showSuccess('Saved!', 'Your changes have been saved');
    
    // Redirect or do something else
    router.visit('/dashboard');
}
```

---

## 📖 Real-World Examples

### Example 1: Member Approval

```typescript
import { router } from '@inertiajs/react';
import { showConfirm, showLoading, closeLoading } from '@/utils/sweetalert';

function ApproveMemberButton({ member }) {
    const handleApprove = async () => {
        const result = await showConfirm(
            'Approve Member?',
            `Do you want to approve ${member.full_name}?`
        );

        if (result.isConfirmed) {
            showLoading('Approving member...', 'Please wait');

            router.post(`/admin/members/${member.id}/approve`, {}, {
                onSuccess: () => {
                    closeLoading();
                    // Flash message will show automatically
                },
                onError: () => {
                    closeLoading();
                    // Flash message will show automatically
                },
            });
        }
    };

    return <button onClick={handleApprove}>Approve</button>;
}
```

### Example 2: Payment Processing

```typescript
import { router } from '@inertiajs/react';
import { showConfirm, showLoading, closeLoading, showInput } from '@/utils/sweetalert';

function ProcessPaymentButton({ member }) {
    const handlePayment = async () => {
        // Get amount
        const amountResult = await showInput(
            'Enter Payment Amount',
            'number',
            '1000'
        );

        if (!amountResult.isConfirmed) return;

        const amount = parseFloat(amountResult.value);

        // Confirm payment
        const confirmResult = await showConfirm(
            'Process Payment?',
            `Process payment of Rs. ${amount} for ${member.full_name}?`
        );

        if (confirmResult.isConfirmed) {
            showLoading('Processing payment...', 'Please wait');

            router.post(`/admin/payments`, {
                member_id: member.id,
                amount: amount,
                payment_method: 'cash',
            }, {
                onFinish: () => {
                    closeLoading();
                },
            });
        }
    };

    return <button onClick={handlePayment}>Process Payment</button>;
}
```

### Example 3: Member Suspension

```typescript
import { router } from '@inertiajs/react';
import { showInput, showLoading, closeLoading } from '@/utils/sweetalert';

function SuspendMemberButton({ member }) {
    const handleSuspend = async () => {
        // Get suspension reason
        const result = await showInput(
            'Suspend Member',
            'textarea',
            'Enter reason for suspension...'
        );

        if (result.isConfirmed) {
            const reason = result.value;

            showLoading('Suspending member...', 'Please wait');

            router.post(`/admin/members/${member.id}/suspend`, {
                reason: reason,
            }, {
                onFinish: () => {
                    closeLoading();
                },
            });
        }
    };

    return <button onClick={handleSuspend}>Suspend</button>;
}
```

---

## 🎨 Customization

### Default Colors

```typescript
// Success: #22c55e (Green)
// Error: #ef4444 (Red)
// Warning: #f59e0b (Amber)
// Info: #3b82f6 (Blue)
// Confirm: #3b82f6 (Blue)
// Cancel: #6b7280 (Gray)
```

### Custom Colors

```typescript
import { showSuccess } from '@/utils/sweetalert';

showSuccess('Success!', 'Custom color', {
    confirmButtonColor: '#10b981', // Custom green
});
```

---

## 📝 Summary

**දැන් ඔබට තියෙන්නේ:**

✅ **Basic Alerts** - Success, Error, Warning, Info  
✅ **Toast Notifications** - Auto-dismiss notifications  
✅ **Confirmation Dialogs** - Yes/No confirmations  
✅ **Delete Confirmations** - Special delete dialogs  
✅ **Input Dialogs** - Get user input  
✅ **Loading Indicators** - Show loading state  
✅ **Laravel Flash Messages** - Automatic toast display  
✅ **Advanced Options** - Full customization  

**Sweet Alert 2 globally use කරන්න පුළුවන්!** 🎉

---

**Files Created:**
- `resources/js/utils/sweetalert.ts` - Main utility
- `resources/js/hooks/use-flash-messages.ts` - Flash messages hook
- `resources/js/components/FlashMessages.tsx` - Flash messages component
- `resources/js/layouts/app/app-sidebar-layout.tsx` - Updated with FlashMessages

**Package Installed:**
- `sweetalert2` - npm package
