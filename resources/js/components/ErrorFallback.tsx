import React from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    error: Error;
    reset: () => void;
}

/**
 * Simple Error Fallback Component
 * 
 * Used as a fallback UI when an error occurs in a specific component
 * 
 * Usage:
 * <ErrorBoundary fallback={<ErrorFallback error={error} reset={reset} />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export function ErrorFallback({ error, reset }: Props) {
    return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-destructive">Error Loading Component</h3>
                    <p className="text-sm text-muted-foreground">
                        {error.message || 'An unexpected error occurred'}
                    </p>
                    <Button onClick={reset} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-3 w-3" />
                        Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Inline Error Display Component
 * 
 * For displaying errors inline within a component
 */
export function InlineError({ message }: { message: string }) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div className="ml-2">
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm">{message}</p>
            </div>
        </Alert>
    );
}

/**
 * Loading Error Component
 * 
 * For displaying errors during data loading
 */
export function LoadingError({ error, retry }: { error: Error; retry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Failed to Load Data</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                {error.message || 'An error occurred while loading the data'}
            </p>
            {retry && (
                <Button onClick={retry} variant="outline" className="mt-4 gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                </Button>
            )}
        </div>
    );
}
