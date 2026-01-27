import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    payment_method: string;
    month_year: string | null;
    paid_date: string;
    months_count: number;
}

interface Props {
    payments: Payment[];
}

export default function PaymentHistory({ payments }: Props) {
    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-blue-100 text-blue-800',
            verified: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            admission: 'bg-purple-100 text-purple-800',
            monthly: 'bg-blue-100 text-blue-800',
            bulk: 'bg-green-100 text-green-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Payment History', href: '/member/payments' }]}>
            <Head title="Payment History" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h2 className="mb-6 text-xl font-semibold leading-tight text-gray-800">
                        Payment History
                    </h2>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Method
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Period
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {new Date(payment.paid_date).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTypeBadge(payment.type)}`}>
                                                        {payment.type}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                    Rs. {payment.amount.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {payment.payment_method}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {payment.month_year || '-'}
                                                    {payment.months_count > 1 && ` (${payment.months_count} months)`}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {payments.length === 0 && (
                                <div className="py-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">No payment history found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
