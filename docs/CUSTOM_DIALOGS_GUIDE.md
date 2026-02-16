# Custom Dialog Components - Usage Guide

## 🎨 Beautiful Custom Dialogs!

We've replaced all browser alerts (`window.confirm`, `window.prompt`) with beautiful custom dialog components using Radix UI.

---

## 📦 Available Components

### 1. **ConfirmDialog** - For Confirmations
### 2. **InputDialog** - For Text Input

---

## 🚀 How to Use

### ConfirmDialog (Confirmation)

#### Import
```typescript
import { useConfirm } from '@/components/ui/confirm-dialog';
```

#### Setup in Component
```typescript
export default function MyComponent() {
    const { confirm, ConfirmDialog } = useConfirm();
    
    // ... your code
    
    return (
        <>
            <ConfirmDialog />
            {/* Your component content */}
        </>
    );
}
```

#### Usage
```typescript
const handleDelete = async () => {
    const confirmed = await confirm({
        title: 'Delete Item',
        description: 'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive', // 'default' or 'destructive'
    });

    if (confirmed) {
        // User clicked "Delete"
        deleteItem();
    }
};
```

---

### InputDialog (Text Input)

#### Import
```typescript
import { useInput } from '@/components/ui/input-dialog';
```

#### Setup in Component
```typescript
export default function MyComponent() {
    const { prompt, InputDialog } = useInput();
    
    // ... your code
    
    return (
        <>
            <InputDialog />
            {/* Your component content */}
        </>
    );
}
```

#### Usage - Text Input
```typescript
const handleRename = async () => {
    const newName = await prompt({
        title: 'Rename Item',
        description: 'Enter a new name for this item',
        label: 'Name',
        placeholder: 'Enter name...',
        type: 'text',
        confirmText: 'Rename',
        cancelText: 'Cancel',
    });

    if (newName) {
        // User entered a name
        renameItem(newName);
    }
};
```

#### Usage - Textarea Input
```typescript
const handleAddNote = async () => {
    const note = await prompt({
        title: 'Add Note',
        description: 'Enter your note below',
        label: 'Note',
        placeholder: 'Type your note here...',
        type: 'textarea', // Use textarea for multi-line input
        confirmText: 'Save',
        cancelText: 'Cancel',
    });

    if (note) {
        // User entered a note
        saveNote(note);
    }
};
```

---

## 📍 Current Implementation

### Sports Management (`Sports/Index.tsx`)

```typescript
const { confirm, ConfirmDialog } = useConfirm();

const handleDelete = async (sport: Sport) => {
    const confirmed = await confirm({
        title: 'Delete Sport',
        description: `Are you sure you want to delete "${sport.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
    });

    if (confirmed) {
        toast.promise(
            new Promise((resolve, reject) => {
                router.delete(`/admin/sports/${sport.id}`, {
                    onSuccess: () => resolve(sport.name),
                    onError: () => reject()
                });
            }),
            {
                loading: 'Deleting sport...',
                success: (name) => `${name} has been deleted successfully!`,
                error: 'Failed to delete sport',
            }
        );
    }
};

return (
    <AppLayout>
        <ConfirmDialog />
        {/* ... */}
    </AppLayout>
);
```

### Member Management (`Members/Show.tsx`)

#### Suspend Member (with Textarea Input)
```typescript
const { prompt, InputDialog } = useInput();

const handleSuspend = async () => {
    const reason = await prompt({
        title: 'Suspend Member',
        description: 'Please provide a reason for suspending this member.',
        label: 'Reason',
        placeholder: 'Enter reason for suspension...',
        type: 'textarea',
        confirmText: 'Suspend',
    });

    if (reason) {
        toast.promise(
            new Promise((resolve, reject) => {
                router.post(route('admin.members.suspend', member.id), {
                    reason: reason
                }, {
                    onSuccess: () => resolve(member.full_name),
                    onError: () => reject()
                });
            }),
            {
                loading: 'Suspending member...',
                success: (name) => `${name} has been suspended`,
                error: 'Failed to suspend member',
            }
        );
    }
};
```

#### Update Sports (with Confirmation)
```typescript
const { confirm, ConfirmDialog } = useConfirm();

const handleUpdateSports = async () => {
    const confirmed = await confirm({
        title: 'Update Sports',
        description: "This will update the member's enrolled sports and generate new payment schedules if needed.",
        confirmText: 'Update',
        cancelText: 'Cancel',
    });

    if (confirmed) {
        toast.promise(
            // ... update logic
        );
    }
};
```

---

## 🎨 Features

### ConfirmDialog Features:
✅ **Beautiful Design** - Modern, clean Radix UI dialog  
✅ **Variants** - `default` (blue) or `destructive` (red)  
✅ **Customizable Text** - Custom confirm/cancel button text  
✅ **Promise-based** - Easy async/await usage  
✅ **Keyboard Support** - ESC to cancel, Enter to confirm  
✅ **Accessible** - Screen reader friendly  

### InputDialog Features:
✅ **Two Input Types** - `text` or `textarea`  
✅ **Auto-focus** - Input is focused on open  
✅ **Keyboard Shortcuts**:
  - `Enter` to submit (text input)
  - `Ctrl+Enter` to submit (textarea)
  - `ESC` to cancel
✅ **Validation** - Submit button disabled if empty  
✅ **Auto-clear** - Input clears on close  

---

## 💡 Best Practices

### ✅ DO:
- Use `variant: 'destructive'` for delete/dangerous actions
- Provide clear, descriptive titles and descriptions
- Use appropriate input type (`text` vs `textarea`)
- Always check if user confirmed before proceeding
- Combine with `toast.promise()` for better UX

### ❌ DON'T:
- Don't forget to render `<ConfirmDialog />` or `<InputDialog />`
- Don't use for non-critical information (use toast instead)
- Don't make descriptions too long
- Don't forget to handle the `null` case (user cancelled)

---

## 🔧 Advanced Usage

### Multiple Dialogs in Same Component
```typescript
export default function MyComponent() {
    const { confirm, ConfirmDialog } = useConfirm();
    const { prompt, InputDialog } = useInput();
    
    return (
        <>
            <ConfirmDialog />
            <InputDialog />
            {/* Your content */}
        </>
    );
}
```

### Conditional Confirmation
```typescript
const handleAction = async () => {
    if (isImportant) {
        const confirmed = await confirm({
            title: 'Important Action',
            description: 'This is an important action. Are you sure?',
            variant: 'destructive',
        });
        
        if (!confirmed) return;
    }
    
    // Proceed with action
    performAction();
};
```

### Chained Dialogs
```typescript
const handleComplexAction = async () => {
    const name = await prompt({
        title: 'Enter Name',
        description: 'Please enter a name',
        type: 'text',
    });
    
    if (!name) return;
    
    const confirmed = await confirm({
        title: 'Confirm',
        description: `Create item with name "${name}"?`,
    });
    
    if (confirmed) {
        createItem(name);
    }
};
```

---

## 📚 Component Props

### ConfirmDialog Props
```typescript
interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;        // Default: 'Continue'
    cancelText?: string;         // Default: 'Cancel'
    variant?: 'default' | 'destructive'; // Default: 'default'
    onConfirm: () => void;
}
```

### InputDialog Props
```typescript
interface InputDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    label?: string;              // Default: 'Input'
    placeholder?: string;        // Default: ''
    type?: 'text' | 'textarea'; // Default: 'text'
    confirmText?: string;        // Default: 'Submit'
    cancelText?: string;         // Default: 'Cancel'
    onConfirm: (value: string) => void;
}
```

---

## 🌐 Migration Guide

### Old (Browser Alerts)
```typescript
// window.confirm
if (window.confirm('Delete this?')) {
    deleteItem();
}

// window.prompt
const name = window.prompt('Enter name:');
if (name) {
    saveName(name);
}
```

### New (Custom Dialogs)
```typescript
// Confirmation
const confirmed = await confirm({
    title: 'Delete Item',
    description: 'Delete this?',
    variant: 'destructive',
});
if (confirmed) {
    deleteItem();
}

// Input
const name = await prompt({
    title: 'Enter Name',
    description: 'Please enter a name',
    type: 'text',
});
if (name) {
    saveName(name);
}
```

---

## ✅ Benefits

| Feature | Browser Alert | Custom Dialog |
|---------|--------------|---------------|
| **Design** | ❌ Ugly, outdated | ✅ Modern, beautiful |
| **Customization** | ❌ Limited | ✅ Fully customizable |
| **Branding** | ❌ Browser default | ✅ Matches your app |
| **Accessibility** | ⚠️ Basic | ✅ Full support |
| **Mobile** | ⚠️ Inconsistent | ✅ Responsive |
| **Keyboard** | ⚠️ Limited | ✅ Full support |
| **Async/Await** | ❌ No | ✅ Yes |

---

**Enjoy your beautiful dialogs! 🎉**
