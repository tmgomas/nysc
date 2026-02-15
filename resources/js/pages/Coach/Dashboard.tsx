import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Program {
    id: string;
    name: string;
}

interface CoachStats {
    assigned_programs_count: number;
    assigned_programs: string[];
    total_members: number;
    monthly_attendance: number;
}

interface Props {
    stats: CoachStats;
    programs: Program[];
}

export default function Dashboard({ stats, programs }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/coach/dashboard' }]}>
            <Head title="Coach Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h2 className="mb-6 text-xl font-semibold leading-tight text-gray-800">
                        Coach Dashboard
                    </h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Assigned Programs</CardDescription>
                                        <CardTitle className="text-3xl text-blue-600">
                                            {stats.assigned_programs_count}
                                        </CardTitle>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Total Members</CardDescription>
                                        <CardTitle className="text-3xl text-green-600">
                                            {stats.total_members}
                                        </CardTitle>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3">
                                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Monthly Attendance</CardDescription>
                                        <CardTitle className="text-3xl text-purple-600">
                                            {stats.monthly_attendance}
                                        </CardTitle>
                                    </div>
                                    <div className="rounded-full bg-purple-100 p-3">
                                        <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Assigned Programs */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>My Assigned Programs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {programs.map((program) => (
                                    <div
                                        key={program.id}
                                        className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4"
                                    >
                                        <h4 className="font-semibold text-gray-900">{program.name}</h4>
                                        <div className="mt-3 flex gap-2">
                                            <a
                                                href={`/coach/attendance?program_id=${program.id}`}
                                                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                                            >
                                                Mark Attendance
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <a
                            href="/coach/attendance"
                            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 hover:bg-gray-50 transition"
                        >
                            <div className="rounded-full bg-purple-100 p-3">
                                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Mark Attendance</h4>
                                <p className="text-sm text-gray-600">Record member attendance</p>
                            </div>
                        </a>

                        <a
                            href="/coach/members"
                            className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 hover:bg-gray-50 transition"
                        >
                            <div className="rounded-full bg-green-100 p-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">My Members</h4>
                                <p className="text-sm text-gray-600">View assigned members</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
