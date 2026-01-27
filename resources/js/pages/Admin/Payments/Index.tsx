import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    payment_method: string;
    month_year: string | null;
    paid_date: string;
    member: {
        member_number: string;
        user?: {
            name: string;
        };
    };
}

interface PaginatedPayments {
    data: Payment[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    payments: PaginatedPayments;
}

export default function Index({ payments }: Props) {
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
        <AppLayout breadcrumbs={[{ title: 'Payments', href: '/admin/payments' }]}>
            <Head title="Payments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Payments Management
                        </h2>
                        <Link
                            href="/admin/payments/create"
                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                            Record Payment
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Member
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Month/Year
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {payment.member.member_number}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {payment.member.user?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                Rs. {payment.amount.toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTypeBadge(payment.type)}`}>
                                                    {payment.type}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {payment.payment_method}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {payment.month_year || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                {payment.status === 'paid' && (
                                                    <button
                                                        onClick={() => router.post(`/admin/payments/${payment.id}/verify`)}
                                                        className="text-green-600 hover:text-green-900 mr-3"
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/admin/payments/${payment.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
