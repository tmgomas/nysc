import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CreditCard, Loader2, Calendar, FileText, CheckCircle, AlertCircle, Printer, Download } from 'lucide-react';

declare global {
    interface Window {
        payhere: any;
    }
}

interface PaymentItem {
    id: string;
    type: string;
    amount: number;
    month_year: string | null;
    description: string | null;
    program: {
        id: string;
        name: string;
    } | null;
}

interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    payment_method: string | null;
    month_year: string | null;
    paid_date: string | null;
    due_date: string | null;
    months_count: number;
    receipt_number: string | null;
    reference_number: string | null;
    items: PaymentItem[];
    program: {
        id: string;
        name: string;
    } | null;
}

interface Props {
    payments: Payment[];
    pendingPayments: Payment[];
    payHereEnabled: boolean;
    payHereMerchantId: string;
}

const loadPayHereScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.payhere) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://www.payhere.lk/lib/payhere.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PayHere SDK'));
        document.head.appendChild(script);
    });
};

export default function PaymentHistory({ payments, pendingPayments, payHereEnabled, payHereMerchantId }: Props) {
    const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    const handlePayOnline = useCallback(async (paymentId: string) => {
        setProcessingPaymentId(paymentId);
        setErrorMessage(null);
        setSuccessMessage(null);
        setInfoMessage(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(`/member/payments/${paymentId}/pay-online`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to initiate payment');
            }

            const checkoutData = await response.json();

            await loadPayHereScript();

            window.payhere.onCompleted = async function(orderId: string) {
                setProcessingPaymentId(null);
                try {
                    await fetch(`/member/payments/${paymentId}/confirm-online`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify({ order_id: orderId }),
                    });
                } catch (e) {
                    console.error('Failed to auto-confirm payment:', e);
                }
                setSuccessMessage('Payment completed successfully! Refreshing...');
                setTimeout(() => router.reload(), 1500);
            };

            window.payhere.onDismissed = function() {
                setProcessingPaymentId(null);
                setInfoMessage('Payment was cancelled by user.');
            };

            window.payhere.onError = function(error: string) {
                setProcessingPaymentId(null);
                setErrorMessage('Payment error: ' + error);
            };

            const paymentData = {
                sandbox: true,
                ...checkoutData.form_data,
            };

            window.payhere.startPayment(paymentData);
        } catch (error: any) {
            setProcessingPaymentId(null);
            setErrorMessage(error.message || 'Failed to initiate payment');
        }
    }, []);

    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-blue-100 text-blue-800 border-blue-200',
            verified: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            admission: 'bg-purple-100 text-purple-800 border-purple-200',
            monthly: 'bg-blue-100 text-blue-800 border-blue-200',
            bulk: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const totalPending = pendingPayments.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <AppLayout breadcrumbs={[{ title: 'Payments', href: '/member/payments' }]}>
            <Head title="Payments" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Alerts */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>{successMessage}</div>
                        </div>
                    )}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>{errorMessage}</div>
                        </div>
                    )}
                    {infoMessage && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>{infoMessage}</div>
                        </div>
                    )}

                    {/* Outstanding Total Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-blue-100 font-medium mb-1">Total Outstanding Amount</h2>
                            <div className="text-4xl font-bold">Rs. {totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        {pendingPayments.length > 0 && payHereEnabled && (
                             <div className="bg-white/10 rounded-lg px-4 py-3 text-sm backdrop-blur-sm border border-white/20">
                                {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''} require attention
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`${
                                    activeTab === 'pending'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                            >
                                Pending Payments
                                {pendingPayments.length > 0 && (
                                    <span className={`ml-2 rounded-full py-0.5 px-2.5 text-xs font-medium ${
                                        activeTab === 'pending' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'
                                    }`}>
                                        {pendingPayments.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`${
                                    activeTab === 'history'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
                            >
                                Payment History
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    {activeTab === 'pending' ? (
                        <div className="space-y-4">
                            {pendingPayments.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                                    <p className="mt-1 text-gray-500">You have no pending payments at this time.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {pendingPayments.map((payment) => (
                                        <div key={payment.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
                                            <div className="p-5 flex-grow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getTypeBadge(payment.type)}`}>
                                                        {payment.type}
                                                    </span>
                                                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="mb-4">
                                                    <div className="text-sm text-gray-500 mb-1">Amount Due</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        Rs. {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600">
                                                    {payment.due_date && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span>Due: {new Date(payment.due_date).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                    {payment.month_year && (
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-gray-400" />
                                                            <span>Period: {payment.month_year} {payment.months_count > 1 ? `(${payment.months_count} mos)` : ''}</span>
                                                        </div>
                                                    )}
                                                    {payment.program && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold">P</div>
                                                            <span className="truncate">{payment.program.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="p-5 bg-gray-50 border-t border-gray-100 mt-auto">
                                                <button
                                                    onClick={() => handlePayOnline(payment.id)}
                                                    disabled={processingPaymentId === payment.id || !payHereEnabled}
                                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    {processingPaymentId === payment.id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CreditCard className="w-4 h-4" />
                                                            Pay Online
                                                        </>
                                                    )}
                                                </button>
                                                {!payHereEnabled && (
                                                    <p className="text-xs text-center text-gray-500 mt-2">
                                                        Online payments are currently disabled.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Method</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {payments.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                                    <p className="text-sm text-gray-500">No payment history found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getTypeBadge(payment.type)}`}>
                                                            {payment.type}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                        Rs. {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {payment.payment_method || '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {payment.month_year || '-'}
                                                        {payment.months_count > 1 && ` (${payment.months_count} mos)`}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(payment.status)}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                                        {(payment.status === 'verified' || payment.status === 'paid') && (
                                                            <div className="flex items-center justify-end gap-3">
                                                                <a 
                                                                    href={`/member/payments/${payment.id}/receipt?action=print`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                                                                    title="Print Receipt"
                                                                >
                                                                    <Printer className="w-4 h-4" />
                                                                    Print
                                                                </a>
                                                                <a 
                                                                    href={`/member/payments/${payment.id}/receipt?action=download`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                                                    title="Download Receipt"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    Download
                                                                </a>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
