import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
}

export default function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
    const variantClasses = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800',
        secondary: 'bg-slate-100 text-slate-700',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]}`}>
            {children}
        </span>
    );
}
