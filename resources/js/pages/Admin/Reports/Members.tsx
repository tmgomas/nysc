import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Activity, TrendingUp } from 'lucide-react';

interface Props {
    statusStats: Record<string, number>;
    sportStats: Array<{ name: string; count: number }>;
    registrationTrend: Array<{ month: string; count: number }>;
    totalMembers: number;
    newMembersThisMonth: number;
}

export default function MembersReport({ statusStats, sportStats, registrationTrend, totalMembers, newMembersThisMonth }: Props) {

    // Helper to get max value for scaling charts
    const maxProgramCount = Math.max(...programStats.map(s => s.count), 1);
    const maxTrendCount = Math.max(...registrationTrend.map(t => t.count), 1);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-500',
            pending: 'bg-yellow-500',
            suspended: 'bg-red-500',
            inactive: 'bg-gray-500',
        };
        return colors[status] || 'bg-gray-400';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '/admin/reports/members' }, { title: 'Member Statistics', href: '' }]}>
            <Head title="Member Reports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tight">Member Statistics</h2>
                        <p className="text-muted-foreground">
                            Overview of member growth, distribution, and status.
                        </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalMembers}</div>
                                <p className="text-xs text-muted-foreground">All registered members</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{newMembersThisMonth}</div>
                                <p className="text-xs text-muted-foreground">Registrations in current month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statusStats['active'] || 0}</div>
                                <p className="text-xs text-muted-foreground">Currently active status</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                        {/* Member Status Breakdown */}
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Member Status</CardTitle>
                                <CardDescription>Distribution of members by account status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(statusStats).map(([status, count]) => (
                                        <div key={status} className="flex items-center">
                                            <div className="w-32 capitalize text-sm font-medium">{status}</div>
                                            <div className="flex-1 flex items-center gap-3">
                                                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getStatusColor(status)}`}
                                                        style={{ width: `${(count / totalMembers) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="text-sm font-bold w-12 text-right">{count}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Programs Preference */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Popular Programs</CardTitle>
                                <CardDescription>Number of active members per sport</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {sportStats.sort((a, b) => b.count - a.count).map((program) => (
                                        <div key={program.name} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{program.name}</span>
                                                <span className="text-muted-foreground">{program.count} members</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${(program.count / maxProgramCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {sportStats.length === 0 && (
                                        <div className="text-center text-muted-foreground py-8">No sport data available</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Registration Trend */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Registration Trend
                            </CardTitle>
                            <CardDescription>New member registrations over the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-end gap-2 sm:gap-4 mt-4">
                                {registrationTrend.map((item) => (
                                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full flex justify-center items-end h-[150px]">
                                            <div
                                                className="w-full max-w-[40px] bg-primary/80 hover:bg-primary rounded-t-sm transition-all relative group-hover:scale-105"
                                                style={{ height: `${(item.count / maxTrendCount) * 100}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.count}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-medium">{item.month}</span>
                                    </div>
                                ))}
                                {registrationTrend.length === 0 && (
                                    <div className="w-full text-center text-muted-foreground self-center">No trend data available</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}
