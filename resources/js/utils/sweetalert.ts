import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * Custom Sweet Alert 2 Utility
 * 
 * Provides pre-configured alert functions for common use cases
 * with consistent styling matching the application theme.
 */

// Default configuration for all alerts
const defaultConfig: SweetAlertOptions = {
    confirmButtonColor: '#3b82f6', // Blue
    cancelButtonColor: '#6b7280', // Gray
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    showClass: {
        popup: 'animate-in fade-in zoom-in duration-200',
    },
    hideClass: {
        popup: 'animate-out fade-out zoom-out duration-200',
    },
};

/**
 * Success Alert
 */
export const showSuccess = (
    title: string,
    message?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'success',
        title,
        text: message,
        confirmButtonColor: '#22c55e', // Green
        ...options,
    } as SweetAlertOptions);
};

/**
 * Error Alert
 */
export const showError = (
    title: string,
    message?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'error',
        title,
        text: message,
        confirmButtonColor: '#ef4444', // Red
        ...options,
    } as SweetAlertOptions);
};

/**
 * Warning Alert
 */
export const showWarning = (
    title: string,
    message?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'warning',
        title,
        text: message,
        confirmButtonColor: '#f59e0b', // Amber
        ...options,
    } as SweetAlertOptions);
};

/**
 * Info Alert
 */
export const showInfo = (
    title: string,
    message?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'info',
        title,
        text: message,
        ...options,
    } as SweetAlertOptions);
};

/**
 * Confirmation Dialog
 */
export const showConfirm = (
    title: string,
    message?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'question',
        title,
        text: message,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        ...options,
    } as SweetAlertOptions);
};

/**
 * Delete Confirmation Dialog
 */
export const showDeleteConfirm = (
    itemName?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        icon: 'warning',
        title: 'Are you sure?',
        text: itemName
            ? `You are about to delete "${itemName}". This action cannot be undone!`
            : 'This action cannot be undone!',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444', // Red
        ...options,
    } as SweetAlertOptions);
};

/**
 * Loading Alert
 */
export const showLoading = (
    title: string = 'Please wait...',
    message?: string
): void => {
    Swal.fire({
        ...defaultConfig,
        title,
        text: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

/**
 * Close Loading Alert
 */
export const closeLoading = (): void => {
    Swal.close();
};

/**
 * Toast Notification (Small, auto-dismiss)
 */
export const showToast = (
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string,
    position: 'top' | 'top-end' | 'top-start' | 'center' | 'bottom' | 'bottom-end' | 'bottom-start' = 'top-end',
    timer: number = 3000
): Promise<SweetAlertResult> => {
    return Swal.fire({
        toast: true,
        position,
        icon,
        title,
        showConfirmButton: false,
        timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });
};

/**
 * Success Toast
 */
export const showSuccessToast = (
    message: string,
    position?: 'top' | 'top-end' | 'top-start' | 'center' | 'bottom' | 'bottom-end' | 'bottom-start'
): Promise<SweetAlertResult> => {
    return showToast('success', message, position);
};

/**
 * Error Toast
 */
export const showErrorToast = (
    message: string,
    position?: 'top' | 'top-end' | 'top-start' | 'center' | 'bottom' | 'bottom-end' | 'bottom-start'
): Promise<SweetAlertResult> => {
    return showToast('error', message, position);
};

/**
 * Warning Toast
 */
export const showWarningToast = (
    message: string,
    position?: 'top' | 'top-end' | 'top-start' | 'center' | 'bottom' | 'bottom-end' | 'bottom-start'
): Promise<SweetAlertResult> => {
    return showToast('warning', message, position);
};

/**
 * Info Toast
 */
export const showInfoToast = (
    message: string,
    position?: 'top' | 'top-end' | 'top-start' | 'center' | 'bottom' | 'bottom-end' | 'bottom-start'
): Promise<SweetAlertResult> => {
    return showToast('info', message, position);
};

/**
 * Custom Alert with HTML content
 */
export const showCustom = (
    options: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        ...options,
    } as SweetAlertOptions);
};

/**
 * Input Alert
 */
export const showInput = (
    title: string,
    inputType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' = 'text',
    placeholder?: string,
    options?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        title,
        input: inputType,
        inputPlaceholder: placeholder,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'This field is required!';
            }
            return null;
        },
        ...options,
    } as SweetAlertOptions);
};

/**
 * Select Alert
 */
export const showSelect = (
    title: string,
    options: Record<string, string>,
    placeholder?: string,
    additionalOptions?: SweetAlertOptions
): Promise<SweetAlertResult> => {
    return Swal.fire({
        ...defaultConfig,
        title,
        input: 'select',
        inputOptions: options,
        inputPlaceholder: placeholder || 'Select an option',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'Please select an option!';
            }
            return null;
        },
        ...additionalOptions,
    } as SweetAlertOptions);
};

// Export Swal instance for advanced usage
export { Swal };

// Export default
export default {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    confirm: showConfirm,
    deleteConfirm: showDeleteConfirm,
    loading: showLoading,
    closeLoading,
    toast: showToast,
    successToast: showSuccessToast,
    errorToast: showErrorToast,
    warningToast: showWarningToast,
    infoToast: showInfoToast,
    custom: showCustom,
    input: showInput,
    select: showSelect,
    Swal,
};
