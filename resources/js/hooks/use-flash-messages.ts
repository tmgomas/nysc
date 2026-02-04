import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { showSuccess, showError, showWarningToast, showInfoToast } from '@/utils/sweetalert';

/**
 * Custom hook to show flash messages from Laravel
 * 
 * Automatically displays alert notifications for flash messages
 * passed from Laravel controllers via Inertia.
 * 
 * Usage in Laravel:
 * return redirect()->back()->with('success', 'Operation completed!');
 * return redirect()->back()->with('error', 'Something went wrong!');
 * return redirect()->back()->with('warning', 'Please be careful!');
 * return redirect()->back()->with('info', 'Here is some information.');
 */
export function useFlashMessages() {
    const { flash } = usePage<any>().props;
    const lastShownRef = useRef<string | null>(null);

    useEffect(() => {
        console.log('useFlashMessages Debug:', flash);
        console.log('flash?.success:', flash?.success);
        console.log('Condition check:', !!flash?.success);
        console.log('lastShownRef.current:', lastShownRef.current);

        if (flash?.success && flash.success !== lastShownRef.current) {
            console.log('Calling showSuccess with:', flash.success);
            console.log('Setting lastShownRef to:', flash.success);
            // Set ref BEFORE calling showSuccess to prevent duplicate calls
            const message = flash.success;
            lastShownRef.current = message;

            try {
                // Show full success alert for important messages
                const result = showSuccess('Success!', message);
                console.log('showSuccess returned:', result);
            } catch (error) {
                console.error('Error calling showSuccess:', error);
            }
        }

        if (flash?.error && flash.error !== lastShownRef.current) {
            lastShownRef.current = flash.error;
            // Show full error alert for important messages
            showError('Error!', flash.error);
        }

        if (flash?.warning) {
            showWarningToast(flash.warning);
        }

        if (flash?.info) {
            showInfoToast(flash.info);
        }
    }, [flash]);
}
