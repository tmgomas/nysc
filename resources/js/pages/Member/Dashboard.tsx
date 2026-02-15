import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Badge from '@/components/Badge';

interface MemberStats {
    total_paid: number;
    total_pending: number;
    has_overdue: boolean;
    monthly_attendance_count: number;
    total_attendance_count: number;
    active_programs_count: number;
    total_monthly_fee: number;
    last_payment?: {
        amount: number;
        paid_date: string;
    };
    next_due_payment?: {
        amount: number;
        due_date: string;
    };
}

interface Props {
    stats: MemberStats;
    member: {
        member_number: string;
        registration_date: string;
        status: string;
    };
}

export default function Dashboard({ stats, member }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/member/dashboard' }]}>
            <Head title="Member Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h2 className="mb-6 text-xl font-semibold leading-tight text-gray-800">
                        Member Dashboard
                    </h2>

                    {/* Welcome Card */}
                    <div className="mb-6 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 shadow-sm sm:rounded-lg">
                        <div className="p-6 text-white">
                            <h3 className="text-2xl font-bold">Welcome Back!</h3>
                            <p className="mt-2">Member Number: {member.member_number}</p>
                            <p className="text-sm opacity-90">Member since: {new Date(member.registration_date).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Payment Status */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Total Paid</CardDescription>
                                        <CardTitle className="text-2xl text-green-600">
                                            Rs. {stats.total_paid.toLocaleString()}
                                        </CardTitle>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3">
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                            {stats.has_overdue && (
                                <CardContent>
                                    <Badge variant="danger" size="sm">⚠️ Overdue payments</Badge>
                                </CardContent>
                            )}
                        </Card>

                        {/* Pending Payments */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Pending</CardDescription>
                                        <CardTitle className="text-2xl text-yellow-600">
                                            Rs. {stats.total_pending.toLocaleString()}
                                        </CardTitle>
                                    </div>
                                    <div className="rounded-full bg-yellow-100 p-3">
                                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Attendance */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>This Month</CardDescription>
                                        <CardTitle className="text-2xl text-purple-600">
                                            {stats.monthly_attendance_count} visits
                                        </CardTitle>
                                    </div>
                                    <div className="rounded-full bg-purple-100 p-3">
                                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>Total: {stats.total_attendance_count}</CardDescription>
                            </CardContent>
                        </Card>

                        {/* Active Programs */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Active Programs</CardDescription>
                                        <CardTitle className="text-2xl text-orange-600">
                                            {stats.active_programs_count}
                                        </CardTitle>
                                    </div>
                                    <div className="rounded-full bg-orange-100 p-3">
                                        <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>Monthly: Rs. {stats.total_monthly_fee.toLocaleString()}</CardDescription>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.last_payment && (
                                    <div className="mb-4">
                                        <CardDescription>Last Payment</CardDescription>
                                        <p className="text-lg font-semibold text-gray-900">
                                            Rs. {stats.last_payment.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(stats.last_payment.paid_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {stats.next_due_payment && (
                                    <div>
                                        <CardDescription>Next Due</CardDescription>
                                        <p className="text-lg font-semibold text-gray-900">
                                            Rs. {stats.next_due_payment.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Due: {new Date(stats.next_due_payment.due_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <a
                                    href={'/member/payments'}
                                    className="mt-4 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    View Payment History
                                </a>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <a
                                        href={'/member/profile'}
                                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition"
                                    >
                                        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">My Profile</span>
                                    </a>
                                    <a
                                        href={'/member/attendance'}
                                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition"
                                    >
                                        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Attendance History</span>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
