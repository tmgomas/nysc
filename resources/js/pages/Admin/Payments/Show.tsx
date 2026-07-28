import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    DollarSign,
    CreditCard,
    Calendar,
    User,
    FileText,
    Trophy,
    Printer,
    Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface OnlineTransaction {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    gateway: string;
    gateway_transaction_id: string | null;
    gateway_method: string | null;
    status: string;
    initiated_at: string | null;
    completed_at: string | null;
    gateway_response?: any;
}

interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    payment_method: string;
    month_year: string | null;
    paid_date: string;
    reference_number: string | null;
    receipt_url: string | null;
    latest_online_transaction?: OnlineTransaction | null;
    online_transactions?: OnlineTransaction[];
    member: {
        id: string;
        member_number: string;
        user?: {
            name: string;
            email: string;
        };
        programs?: Array<{
            id: string;
            name: string;
        }>;
    };
    payment_items?: Array<{
        id: string;
        description: string;
        amount: number;
    }>;
}

interface Props {
    payment: Payment;
}

export default function Show({ payment }: Props) {
    const { confirm, ConfirmDialog } = useConfirm();

    const handleVerify = async () => {
        const confirmed = await confirm({
            title: 'Verify Payment',
            description: `Verify payment of Rs. ${payment.amount.toLocaleString()}?`,
            confirmText: 'Verify',
            cancelText: 'Cancel',
        });

        if (confirmed) {
            toast.promise(
                new Promise((resolve, reject) => {
                    router.post(`/admin/payments/${payment.id}/verify`, {}, {
                        onSuccess: () => resolve(true),
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Verifying payment...',
                    success: 'Payment verified successfully!',
                    error: 'Failed to verify payment',
                }
            );
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'secondary',
            paid: 'default',
            verified: 'default',
            rejected: 'destructive',
        };
        return variants[status as keyof typeof variants] || 'outline';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'text-yellow-600 bg-yellow-50',
            paid: 'text-blue-600 bg-blue-50',
            verified: 'text-green-600 bg-green-50',
            rejected: 'text-red-600 bg-red-50',
        };
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Payments', href: '/admin/payments' },
                { title: `Payment #${payment.id.substring(0, 8)}`, href: `/admin/payments/${payment.id}` },
            ]}
        >
            <Head title={`Payment Details`} />
            <ConfirmDialog />

            <div className="py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/admin/payments">
                                    <Button variant="outline" size="icon">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">Payment Details</h2>
                                    <p className="text-muted-foreground">
                                        Payment ID: {payment.id}
                                    </p>
                                </div>
                            </div>
                            {payment.status === 'paid' && (
                                <Button onClick={handleVerify}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Verify Payment
                                </Button>
                            )}
                            {(payment.status === 'verified' || payment.status === 'paid') && (
                                <div className="flex gap-2">
                                    <a href={`/admin/payments/${payment.id}/receipt?action=print`} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline">
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print
                                        </Button>
                                    </a>
                                    <a href={`/admin/payments/${payment.id}/receipt?action=download`} target="_blank" rel="noopener noreferrer">
                                        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Status Card */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${getStatusColor(payment.status)}`}>
                                            <DollarSign className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold">
                                                Rs. {payment.amount.toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={getStatusBadge(payment.status) as any}>
                                                    {payment.status}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {payment.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Member Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Member Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Member Number</div>
                                        <Link
                                            href={`/admin/members/${payment.member.id}`}
                                            className="font-medium hover:underline"
                                        >
                                            {payment.member.member_number}
                                        </Link>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Name</div>
                                        <div className="font-medium">
                                            {payment.member.user?.name || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Email</div>
                                        <div className="font-medium">
                                            {payment.member.user?.email || 'N/A'}
                                        </div>
                                    </div>
                                    {payment.member.programs && payment.member.programs.length > 0 && (
                                        <div>
                                            <div className="text-sm text-muted-foreground">Enrolled Programs</div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {payment.member.programs.map((program) => (
                                                    <Badge key={program.id} variant="outline">
                                                        {program.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Payment Method</div>
                                        <div className="font-medium capitalize">
                                            {payment.payment_method.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Payment Date</div>
                                        <div className="font-medium">
                                            {new Date(payment.paid_date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    {payment.month_year && (
                                        <div>
                                            <div className="text-sm text-muted-foreground">Month/Year</div>
                                            <div className="font-medium">{payment.month_year}</div>
                                        </div>
                                    )}
                                    {payment.reference_number && (
                                        <div>
                                            <div className="text-sm text-muted-foreground">Reference Number</div>
                                            <div className="font-medium">{payment.reference_number}</div>
                                        </div>
                                    )}
                                </div>

                                {payment.receipt_url && (
                                    <>
                                        <Separator />
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-2">Receipt</div>
                                            <a
                                                href={payment.receipt_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                View Receipt
                                            </a>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Online Gateway Details (PayHere) */}
                        {(payment.payment_method === 'online' || payment.latest_online_transaction) && (
                            <Card className="border-indigo-100 bg-indigo-50/20 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-indigo-900">
                                            <CreditCard className="h-5 w-5 text-indigo-600" />
                                            Online Payment Gateway (PayHere)
                                        </div>
                                        {payment.latest_online_transaction && (
                                            <Badge variant={payment.latest_online_transaction.status === 'success' ? 'default' : 'secondary'}>
                                                {payment.latest_online_transaction.status.toUpperCase()}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        Real-time transaction details from PayHere gateway
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {payment.latest_online_transaction ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Order ID</div>
                                                <div className="font-mono text-sm font-semibold text-gray-900">
                                                    {payment.latest_online_transaction.order_id}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">PayHere Transaction ID</div>
                                                <div className="font-mono text-sm font-semibold text-indigo-600">
                                                    {payment.latest_online_transaction.gateway_transaction_id || payment.reference_number || 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Payment Method / Channel</div>
                                                <div className="font-medium text-gray-900">
                                                    {payment.latest_online_transaction.gateway_method || 'CARD / Online'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Currency & Amount</div>
                                                <div className="font-semibold text-gray-900">
                                                    {payment.latest_online_transaction.currency || 'LKR'} {Number(payment.latest_online_transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            {payment.latest_online_transaction.initiated_at && (
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Initiated At</div>
                                                    <div className="font-medium text-xs text-gray-700">
                                                        {new Date(payment.latest_online_transaction.initiated_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                            {payment.latest_online_transaction.completed_at && (
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Completed At</div>
                                                    <div className="font-medium text-xs font-semibold text-emerald-700">
                                                        {new Date(payment.latest_online_transaction.completed_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No detailed gateway transaction log found for this online payment.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Items */}
                        {payment.payment_items && payment.payment_items.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Payment Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {payment.payment_items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="font-medium">{item.description}</div>
                                                <div className="font-semibold">
                                                    Rs. {item.amount.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Link href={`/admin/members/${payment.member.id}`}>
                                        <Button variant="outline">
                                            <User className="mr-2 h-4 w-4" />
                                            View Member Profile
                                        </Button>
                                    </Link>
                                    <Link href="/admin/payments">
                                        <Button variant="outline">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Payments
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
