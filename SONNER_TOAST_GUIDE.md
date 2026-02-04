# Sonner Toast Notification - Usage Guide

## 🎉 Setup Complete!

Sonner toast notification system has been successfully installed and configured globally in your application.

---

## 📦 What Was Installed

- **Package:** `sonner` (~3KB)
- **Location:** Globally available throughout the app
- **Position:** Top-right corner
- **Features:** Rich colors, close button, auto-dismiss

---

## 🚀 How to Use

### Import
```typescript
import { toast } from 'sonner';
```

### Basic Usage

#### Success Toast
```typescript
toast.success('Operation completed successfully!');
```

#### Error Toast
```typescript
toast.error('Something went wrong!');
```

#### Warning Toast
```typescript
toast.warning('Please check your input');
```

#### Info Toast
```typescript
toast.info('New update available');
```

#### Loading Toast
```typescript
toast.loading('Processing your request...');
```

---

## 🎯 Advanced Usage

### Promise-Based Toast (Auto Loading → Success/Error)
```typescript
toast.promise(
    fetch('/api/data'),
    {
        loading: 'Loading data...',
        success: 'Data loaded successfully!',
        error: 'Failed to load data'
    }
);
```

### Custom Duration
```typescript
toast.success('This will stay for 10 seconds', {
    duration: 10000
});
```

### With Action Button
```typescript
toast('Event created', {
    action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked')
    }
});
```

### With Description
```typescript
toast.success('Payment received', {
    description: 'Rs. 5,000 has been credited to your account'
});
```

### Dismiss Specific Toast
```typescript
const toastId = toast.loading('Processing...');
// Later...
toast.dismiss(toastId);
```

### Dismiss All Toasts
```typescript
toast.dismiss();
```

---

## 📍 Current Implementation

### 1. **Sports Management** (`Sports/Index.tsx`)
```typescript
const handleDelete = (sport: Sport) => {
    toast.promise(
        new Promise((resolve, reject) => {
            if (window.confirm(`Delete "${sport.name}"?`)) {
                router.delete(`/admin/sports/${sport.id}`, {
                    onSuccess: () => resolve(sport.name),
                    onError: () => reject()
                });
            } else {
                reject();
            }
        }),
        {
            loading: 'Deleting sport...',
            success: (name) => `${name} has been deleted successfully!`,
            error: 'Failed to delete sport',
        }
    );
};
```

### 2. **Member Management** (`Members/Show.tsx`)

#### Approve Member
```typescript
toast.promise(
    new Promise((resolve, reject) => {
        router.post(route('admin.members.approve', member.id), {}, {
            onSuccess: () => resolve(member.full_name),
            onError: () => reject()
        });
    }),
    {
        loading: 'Approving member...',
        success: (name) => `${name} has been approved successfully!`,
        error: 'Failed to approve member',
    }
);
```

#### Record Payment
```typescript
toast.promise(
    new Promise((resolve, reject) => {
        router.post(`/admin/payments`, data, {
            onSuccess: () => resolve(monthYear),
            onError: () => reject()
        });
    }),
    {
        loading: 'Recording payment...',
        success: (month) => `Payment for ${month} recorded successfully!`,
        error: 'Failed to record payment',
    }
);
```

---

## 🎨 Customization Options

### Global Configuration (in `app.tsx`)
```typescript
<Toaster 
    position="top-right"      // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    richColors                // Enable colored toasts
    closeButton               // Show close button
    expand={false}            // Don't expand on hover
    duration={4000}           // Default duration (4 seconds)
    theme="system"            // light, dark, system
/>
```

### Per-Toast Options
```typescript
toast.success('Message', {
    duration: 5000,           // 5 seconds
    position: 'bottom-right', // Override global position
    className: 'my-toast',    // Custom CSS class
    description: 'Details',   // Additional text
    action: {                 // Action button
        label: 'Undo',
        onClick: () => {}
    }
});
```

---

## 💡 Best Practices

### ✅ DO:
- Use `toast.promise()` for async operations
- Provide clear, concise messages
- Use appropriate toast types (success, error, warning, info)
- Keep messages short and actionable

### ❌ DON'T:
- Don't show too many toasts at once
- Don't use toasts for critical errors (use modals instead)
- Don't make toasts too long (max 2 lines)
- Don't forget to handle errors

---

## 🔧 Common Patterns

### Pattern 1: Form Submission
```typescript
const handleSubmit = async (data) => {
    toast.promise(
        submitForm(data),
        {
            loading: 'Saving...',
            success: 'Saved successfully!',
            error: 'Failed to save'
        }
    );
};
```

### Pattern 2: Delete Confirmation
```typescript
const handleDelete = (item) => {
    if (window.confirm(`Delete ${item.name}?`)) {
        toast.promise(
            deleteItem(item.id),
            {
                loading: 'Deleting...',
                success: `${item.name} deleted!`,
                error: 'Failed to delete'
            }
        );
    }
};
```

### Pattern 3: Multiple Steps
```typescript
const toastId = toast.loading('Step 1: Validating...');

// Step 2
toast.loading('Step 2: Processing...', { id: toastId });

// Step 3
toast.success('Completed!', { id: toastId });
```

---

## 📚 Examples in Your Project

### Example 1: Simple Success
```typescript
// After creating a member
toast.success('Member created successfully!');
```

### Example 2: With Details
```typescript
// After payment
toast.success('Payment Received', {
    description: `Rs. ${amount} from ${member.name}`
});
```

### Example 3: Error Handling
```typescript
try {
    await saveData();
    toast.success('Data saved!');
} catch (error) {
    toast.error('Failed to save data', {
        description: error.message
    });
}
```

---

## 🌐 Resources

- **Documentation:** https://sonner.emilkowal.ski/
- **GitHub:** https://github.com/emilkowalski/sonner
- **Examples:** https://sonner.emilkowal.ski/examples

---

## ✅ Migration Complete

All SweetAlert2 functionality has been replaced with Sonner:

| Old (SweetAlert2) | New (Sonner) |
|-------------------|--------------|
| `showSuccess()` | `toast.success()` |
| `showError()` | `toast.error()` |
| `showWarning()` | `toast.warning()` |
| `showInfo()` | `toast.info()` |
| `showLoading()` | `toast.loading()` |
| `showToast()` | `toast()` |
| `showConfirm()` | `window.confirm()` + `toast.promise()` |

---

**Happy Toasting! 🎉**
