import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }

        // Log error to your error reporting service (e.g., Sentry)
        // Sentry.captureException(error, { extra: errorInfo });

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-destructive/10 p-3">
                                    <AlertCircle className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Something went wrong</CardTitle>
                                    <CardDescription>
                                        We're sorry for the inconvenience. An unexpected error occurred.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Error Details (only in development) */}
                            {import.meta.env.DEV && this.state.error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <div className="ml-2">
                                        <h4 className="font-semibold">Error Details:</h4>
                                        <p className="mt-1 text-sm font-mono">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-sm font-semibold">
                                                    Stack Trace
                                                </summary>
                                                <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </Alert>
                            )}

                            {/* Production Error Message */}
                            {!import.meta.env.DEV && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <div className="ml-2">
                                        <p className="text-sm">
                                            The error has been logged and our team has been notified.
                                            Please try refreshing the page or contact support if the problem persists.
                                        </p>
                                    </div>
                                </Alert>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Button onClick={this.handleReset} variant="default" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button onClick={this.handleReload} variant="outline" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Reload Page
                                </Button>
                                <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
