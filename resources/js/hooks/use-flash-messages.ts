import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from '@/utils/sweetalert';

/**
 * Custom hook to show flash messages from Laravel
 * 
 * Automatically displays toast notifications for flash messages
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

    useEffect(() => {
        if (flash?.success) {
            showSuccessToast(flash.success);
        }

        if (flash?.error) {
            showErrorToast(flash.error);
        }

        if (flash?.warning) {
            showWarningToast(flash.warning);
        }

        if (flash?.info) {
            showInfoToast(flash.info);
        }
    }, [flash]);
}
