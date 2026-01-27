import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: boolean;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
    return (
        <div className={`overflow-hidden bg-white shadow-sm sm:rounded-lg ${padding ? 'p-6' : ''} ${className}`}>
            {children}
        </div>
    );
}
