import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InputDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'textarea';
    confirmText?: string;
    cancelText?: string;
    onConfirm: (value: string) => void;
}

export function InputDialog({
    open,
    onOpenChange,
    title,
    description,
    label = 'Input',
    placeholder = '',
    type = 'text',
    confirmText = 'Submit',
    cancelText = 'Cancel',
    onConfirm,
}: InputDialogProps) {
    const [value, setValue] = useState('');

    const handleSubmit = () => {
        if (value.trim()) {
            onConfirm(value);
            setValue('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            onOpenChange(open);
            if (!open) setValue('');
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="input-field">{label}</Label>
                        {type === 'textarea' ? (
                            <Textarea
                                id="input-field"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                rows={4}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) {
                                        handleSubmit();
                                    }
                                }}
                            />
                        ) : (
                            <Input
                                id="input-field"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {cancelText}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!value.trim()}>
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Hook for easy usage
export function useInput() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        title: string;
        description: string;
        label?: string;
        placeholder?: string;
        type?: 'text' | 'textarea';
        confirmText?: string;
        cancelText?: string;
        onConfirm: (value: string) => void;
    }>({
        title: '',
        description: '',
        onConfirm: () => { },
    });

    const prompt = (options: {
        title: string;
        description: string;
        label?: string;
        placeholder?: string;
        type?: 'text' | 'textarea';
        confirmText?: string;
        cancelText?: string;
    }): Promise<string | null> => {
        return new Promise((resolve) => {
            setConfig({
                ...options,
                onConfirm: (value: string) => {
                    setIsOpen(false);
                    resolve(value);
                },
            });
            setIsOpen(true);
        });
    };

    const InputDialogComponent = () => (
        <InputDialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    // User cancelled
                }
            }}
            {...config}
        />
    );

    return { prompt, InputDialog: InputDialogComponent };
}
