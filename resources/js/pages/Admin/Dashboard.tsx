import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Badge from '@/components/Badge';
import { Scan, Search, Loader2, Clock, Calendar } from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
    members: {
        total: number;
        active: number;
        pending: number;
        new_this_month: number;
    };
    payments: {
        total_this_month: number;
        pending_count: number;
        overdue_count: number;
    };
    attendance: {
        today: number;
        this_month: number;
    };
    sports: {
        total: number;
        active: number;
    };
}

interface ScheduleItem {
    sport_name: string;
    label?: string | null;
    start_time: string | null;
    end_time: string | null;
    coach?: string | null;
    capacity?: number | null;
    members_count?: number;
    type: 'class' | 'practice';
}

interface Props {
    stats: DashboardStats;
    todaySchedule: ScheduleItem[];
    todayName: string;
}

function formatTime(time: string | null): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
}

export default function Dashboard({ stats, todaySchedule, todayName }: Props) {
    const [rfid, setRfid] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const scanValue = searchInputRef.current?.value.trim();
            if (!scanValue) return;

            setIsSearching(true);
            try {
                const response = await axios.post(route('admin.rfid.verify'), { rfid_data: scanValue });

                if (response.data.valid && response.data.data.member) {
                    router.visit(route('admin.members.show', response.data.data.member.id));
                }
            } catch (error: any) {
                console.error('RFID Verify Error:', error);
                setRfid('');

                if (error.response && error.response.data) {
                    const message = error.response.data.message || 'Validation Failed';
                    const scannedData = error.response.data.data?.rfid_data;
                    alert(`${message}\nScanned Code: ${scannedData || 'N/A'}`);
                } else {
                    alert('An unexpected error occurred. Please check the console.');
                }

                searchInputRef.current?.focus();
            } finally {
                setIsSearching(false);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }]}>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* RFID Search Section */}
                    <Card className="mb-8 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2.5">
                                    <Scan className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>RFID Quick Access</CardTitle>
                                    <CardDescription>Scan a member's RFID card to instantly view their profile.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="relative max-w-xl">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {isSearching ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    ) : (
                                        <Search className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Scan RFID card or type ID..."
                                    className="pl-10 h-12 text-lg"
                                    value={rfid}
                                    onChange={(e) => setRfid(e.target.value)}
                                    onKeyDown={handleSearch}
                                    disabled={isSearching}
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                        Press Enter
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Members Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Total Members</CardDescription>
                                        <CardTitle className="text-3xl">{stats.members.total}</CardTitle>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Badge variant="success">Active: {stats.members.active}</Badge>
                                    <Badge variant="warning">Pending: {stats.members.pending}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payments Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>This Month Revenue</CardDescription>
                                        <CardTitle className="text-3xl">
                                            Rs. {stats.payments.total_this_month.toLocaleString()}
                                        </CardTitle>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3">
                                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Badge variant="warning">Pending: {stats.payments.pending_count}</Badge>
                                    <Badge variant="danger">Overdue: {stats.payments.overdue_count}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attendance Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Today's Attendance</CardDescription>
                                        <CardTitle className="text-3xl">{stats.attendance.today}</CardTitle>
                                    </div>
                                    <div className="rounded-full bg-purple-100 p-3">
                                        <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>This month: {stats.attendance.this_month}</CardDescription>
                            </CardContent>
                        </Card>

                        {/* Sports Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardDescription>Active Sports</CardDescription>
                                        <CardTitle className="text-3xl">{stats.sports.active}</CardTitle>
                                    </div>
                                    <div className="rounded-full bg-orange-100 p-3">
                                        <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>Total: {stats.sports.total}</CardDescription>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Today's Schedule Widget */}
                    <Card className="mt-8">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-indigo-100 p-2">
                                        <Calendar className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <CardTitle>Today's Schedule</CardTitle>
                                        <CardDescription>{todayName}</CardDescription>
                                    </div>
                                </div>
                                <a
                                    href="/admin/schedule"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    View Full Calendar →
                                </a>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {todaySchedule && todaySchedule.length > 0 ? (
                                <div className="space-y-3">
                                    {todaySchedule.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-mono font-medium min-w-[110px]">
                                                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">{item.sport_name}</span>
                                                    {item.label && (
                                                        <Badge variant="outline" className="text-xs">{item.label}</Badge>
                                                    )}
                                                    <Badge
                                                        variant={item.type === 'class' ? 'info' : 'success'}
                                                        className="text-xs"
                                                    >
                                                        {item.type === 'class' ? 'Class' : 'Practice'}
                                                    </Badge>
                                                </div>
                                                {item.coach && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Coach: {item.coach}
                                                        {item.capacity ? ` • Max ${item.capacity} students` : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">No sessions scheduled for today</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <a
                                    href="/admin/members/create"
                                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                                >
                                    <div className="rounded-full bg-blue-100 p-2">
                                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Add Member</span>
                                </a>

                                <a
                                    href="/admin/payments/create"
                                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                                >
                                    <div className="rounded-full bg-green-100 p-2">
                                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Record Payment</span>
                                </a>

                                <a
                                    href="/admin/attendance"
                                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                                >
                                    <div className="rounded-full bg-purple-100 p-2">
                                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Mark Attendance</span>
                                </a>

                                <a
                                    href="/admin/schedule"
                                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                                >
                                    <div className="rounded-full bg-indigo-100 p-2">
                                        <Calendar className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">View Schedule</span>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
