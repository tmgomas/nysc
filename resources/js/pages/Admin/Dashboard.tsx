import React, { useState, useRef, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Badge from '@/components/Badge';
import {
    Scan, Search, Loader2, Clock, Calendar,
    Users, DollarSign, TrendingUp, Activity,
    AlertTriangle, ArrowRight, CheckCircle2,
    UserCheck, CreditCard, Zap, BarChart2,
    ChevronRight, Bell
} from 'lucide-react';
import axios from 'axios';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DashboardStats {
    members: { total: number; active: number; pending: number; new_this_month: number; };
    payments: { total_this_month: number; pending_count: number; overdue_count: number; };
    attendance: { today: number; this_month: number; };
    programs: { total: number; active: number; };
}

interface ScheduleItem {
    sport_name: string;
    label?: string | null;
    start_time: string | null;
    end_time: string | null;
    coach?: string | null;
    capacity?: number | null;
    type: 'class' | 'practice';
}

interface TrendItem { date: string; full_date: string; count: number; }
interface RevenueTrendItem { month: string; revenue: number; }
interface ProgramItem { name: string; value: number; }
interface RecentMember { id: string; name: string; calling_name: string; status: string; registration_date: string; programs: string; initials: string; }
interface RecentPayment { id: string; member_name: string; amount: number; status: string; type: string; date: string; }
interface OverduePayment { id: string; member_id: string; member_name: string; amount: number; due_date: string; days_overdue: number; type: string; }
interface PendingRegistration { id: string; name: string; calling_name: string; applied_at: string; initials: string; }

interface Props {
    stats: DashboardStats;
    todaySchedule: ScheduleItem[];
    todayName: string;
    attendanceTrend: TrendItem[];
    revenueTrend: RevenueTrendItem[];
    membersByProgram: ProgramItem[];
    recentMembers: RecentMember[];
    recentPayments: RecentPayment[];
    overduePayments: OverduePayment[];
    pendingRegistrations: PendingRegistration[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(time: string | null): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
}

function formatCurrency(amount: number): string {
    return 'Rs. ' + amount.toLocaleString('en-LK', { minimumFractionDigits: 0 });
}

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType; label: string; value: string | number;
    sub?: React.ReactNode; color: string;
}) {
    return (
        <Card className="relative overflow-hidden">
            <div className={`absolute inset-0 opacity-5 ${color}`} />
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
                        {sub && <div className="mt-2">{sub}</div>}
                    </div>
                    <div className={`rounded-xl p-2.5 ${color} bg-opacity-10`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusDot({ status }: { status: string }) {
    const colors: Record<string, string> = {
        active: 'bg-emerald-500',
        pending: 'bg-amber-500',
        suspended: 'bg-red-500',
        verified: 'bg-emerald-500',
        paid: 'bg-blue-500',
        rejected: 'bg-red-500',
    };
    return <span className={`inline-block h-2 w-2 rounded-full ${colors[status] ?? 'bg-gray-400'}`} />;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Dashboard({
    stats,
    todaySchedule,
    todayName,
    attendanceTrend,
    revenueTrend,
    membersByProgram,
    recentMembers,
    recentPayments,
    overduePayments,
    pendingRegistrations,
}: Props) {
    const [rfid, setRfid] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { searchInputRef.current?.focus(); }, []);

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
                setRfid('');
                const message = error.response?.data?.message || 'Validation Failed';
                const scannedData = error.response?.data?.data?.rfid_data;
                alert(`${message}\nScanned Code: ${scannedData || 'N/A'}`);
                searchInputRef.current?.focus();
            } finally {
                setIsSearching(false);
            }
        }
    };

    const alertCount = overduePayments.length + pendingRegistrations.length;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }]}>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">

                        {/* ── Top Bar: RFID Scanner + Quick Actions ── */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            {/* RFID Scanner – compact */}
                            <div className="relative flex-1 max-w-sm">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    {isSearching
                                        ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        : <Scan className="h-4 w-4 text-muted-foreground" />
                                    }
                                </div>
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Scan RFID / type ID…"
                                    className="pl-9 pr-20 h-10"
                                    value={rfid}
                                    onChange={(e) => setRfid(e.target.value)}
                                    onKeyDown={handleSearch}
                                    disabled={isSearching}
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <kbd className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 border">↵ Enter</kbd>
                                </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex flex-wrap gap-2 sm:ml-auto">
                                <a href="/admin/members/create"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
                                    <Users className="h-4 w-4" /> Add Member
                                </a>
                                <a href="/admin/payments/create"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm">
                                    <CreditCard className="h-4 w-4" /> Record Payment
                                </a>
                                <a href="/admin/attendance"
                                    className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors shadow-sm">
                                    <UserCheck className="h-4 w-4" /> Attendance
                                </a>
                                <a href="/admin/schedule"
                                    className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors shadow-sm">
                                    <Calendar className="h-4 w-4" /> Schedule
                                </a>
                            </div>
                        </div>

                        {/* ── Stats Row ── */}
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <StatCard
                                icon={Users}
                                label="Total Members"
                                value={stats.members.total}
                                color="bg-indigo-500 text-indigo-600"
                                sub={
                                    <div className="flex gap-2">
                                        <Badge variant="success">Active: {stats.members.active}</Badge>
                                        <Badge variant="warning">Pending: {stats.members.pending}</Badge>
                                    </div>
                                }
                            />
                            <StatCard
                                icon={DollarSign}
                                label="Revenue This Month"
                                value={formatCurrency(stats.payments.total_this_month)}
                                color="bg-emerald-500 text-emerald-600"
                                sub={
                                    <div className="flex gap-2">
                                        <Badge variant="warning">Pending: {stats.payments.pending_count}</Badge>
                                        {stats.payments.overdue_count > 0 && (
                                            <Badge variant="danger">Overdue: {stats.payments.overdue_count}</Badge>
                                        )}
                                    </div>
                                }
                            />
                            <StatCard
                                icon={Activity}
                                label="Today's Attendance"
                                value={stats.attendance.today}
                                color="bg-violet-500 text-violet-600"
                                sub={<p className="text-xs text-muted-foreground">This month: {stats.attendance.this_month}</p>}
                            />
                            <StatCard
                                icon={Zap}
                                label="Active Programs"
                                value={stats.programs.active}
                                color="bg-amber-500 text-amber-600"
                                sub={<p className="text-xs text-muted-foreground">Total: {stats.programs.total}</p>}
                            />
                        </div>

                        {/* ── Main 2-Column Layout ── */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                            {/* ──── Left Column (2/3 width) ────────────────────────── */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Attendance Trend Chart */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">Attendance – Last 7 Days</CardTitle>
                                                <CardDescription>Daily check-ins across all programs</CardDescription>
                                            </div>
                                            <Activity className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <AreaChart data={attendanceTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                                    formatter={(v) => [v, 'Check-ins']}
                                                    labelFormatter={(l, p) => p[0]?.payload?.full_date ?? l}
                                                />
                                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#attendGrad)" dot={{ r: 3, fill: '#6366f1' }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Revenue Trend Chart */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">Revenue – Last 6 Months</CardTitle>
                                                <CardDescription>Verified payment totals per month</CardDescription>
                                            </div>
                                            <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={revenueTrend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
                                                <Tooltip
                                                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                                    formatter={(v) => [formatCurrency(Number(v)), 'Revenue']}
                                                />
                                                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Recent Members */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Recent Registrations</CardTitle>
                                            <a href="/admin/members" className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                View all <ChevronRight className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {recentMembers.length === 0 ? (
                                            <p className="px-6 pb-5 text-sm text-muted-foreground">No members yet.</p>
                                        ) : (
                                            <ul className="divide-y">
                                                {recentMembers.map((m) => (
                                                    <li key={m.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                                                            {m.initials}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate text-sm font-medium">{m.name}</p>
                                                            <p className="text-xs text-muted-foreground">{m.programs || '—'} · {m.registration_date}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <StatusDot status={m.status} />
                                                            <a href={`/admin/members/${m.id}`} className="text-muted-foreground hover:text-primary transition-colors">
                                                                <ArrowRight className="h-4 w-4" />
                                                            </a>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recent Payments */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Recent Payments</CardTitle>
                                            <a href="/admin/payments" className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                View all <ChevronRight className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {recentPayments.length === 0 ? (
                                            <p className="px-6 pb-5 text-sm text-muted-foreground">No payments yet.</p>
                                        ) : (
                                            <ul className="divide-y">
                                                {recentPayments.map((p) => (
                                                    <li key={p.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                            <CreditCard className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate text-sm font-medium">{p.member_name}</p>
                                                            <p className="text-xs text-muted-foreground">{p.type} · {p.date}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-right">
                                                            <div>
                                                                <p className="text-sm font-semibold">{formatCurrency(p.amount)}</p>
                                                                <div className="flex justify-end">
                                                                    <Badge variant={p.status === 'verified' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}>
                                                                        {p.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* ──── Right Column (1/3 width) ────────────────────────── */}
                            <div className="space-y-6">

                                {/* Alerts Panel */}
                                {alertCount > 0 && (
                                    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-2">
                                                <Bell className="h-4 w-4 text-amber-600" />
                                                <CardTitle className="text-sm text-amber-800 dark:text-amber-400">
                                                    {alertCount} Alert{alertCount !== 1 ? 's' : ''} Need Attention
                                                </CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {/* Overdue Payments */}
                                            {overduePayments.length > 0 && (
                                                <div>
                                                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-red-600">
                                                        Overdue Payments ({overduePayments.length})
                                                    </p>
                                                    <ul className="space-y-1.5">
                                                        {overduePayments.map((op) => (
                                                            <li key={op.id} className="flex items-center justify-between gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-xs font-medium">{op.member_name}</p>
                                                                    <p className="text-[10px] text-muted-foreground">{op.days_overdue}d overdue · {op.due_date}</p>
                                                                </div>
                                                                <a href={`/admin/members/${op.member_id}`}
                                                                    className="shrink-0 text-[11px] font-medium text-red-600 hover:underline">
                                                                    {formatCurrency(op.amount)}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Pending Registrations */}
                                            {pendingRegistrations.length > 0 && (
                                                <div>
                                                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                                        Pending Approvals ({pendingRegistrations.length})
                                                    </p>
                                                    <ul className="space-y-1.5">
                                                        {pendingRegistrations.map((pr) => (
                                                            <li key={pr.id} className="flex items-center gap-2">
                                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold">
                                                                    {pr.initials}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-xs font-medium">{pr.calling_name || pr.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground">{pr.applied_at}</p>
                                                                </div>
                                                                <a href={`/admin/members/${pr.id}`}
                                                                    className="shrink-0 text-amber-700 hover:text-amber-900">
                                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Today's Schedule */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-indigo-500" />
                                                <CardTitle className="text-base">Today – {todayName}</CardTitle>
                                            </div>
                                            <a href="/admin/schedule" className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                Calendar <ChevronRight className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {todaySchedule.length === 0 ? (
                                            <div className="flex flex-col items-center py-8 text-center">
                                                <Calendar className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                                                <p className="text-sm text-muted-foreground">No sessions today</p>
                                            </div>
                                        ) : (
                                            <ul className="divide-y">
                                                {todaySchedule.map((item, idx) => (
                                                    <li key={idx} className="px-5 py-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex items-center gap-1 text-muted-foreground shrink-0 pt-0.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="text-sm font-medium truncate">{item.sport_name}</span>
                                                                    {item.label && (
                                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.label}</Badge>
                                                                    )}
                                                                    <Badge
                                                                        variant={item.type === 'class' ? 'info' : 'success'}
                                                                        className="text-[10px] px-1.5 py-0"
                                                                    >
                                                                        {item.type === 'class' ? 'Class' : 'Practice'}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {formatTime(item.start_time)}
                                                                    {item.end_time && ` – ${formatTime(item.end_time)}`}
                                                                    {item.coach && ` · ${item.coach}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Members by Program (Pie) */}
                                {membersByProgram.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-2">
                                                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                                                <CardTitle className="text-base">Members by Program</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={160}>
                                                <PieChart>
                                                    <Pie
                                                        data={membersByProgram}
                                                        cx="50%" cy="50%"
                                                        innerRadius={45} outerRadius={70}
                                                        paddingAngle={3} dataKey="value"
                                                    >
                                                        {membersByProgram.map((_, i) => (
                                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                                        formatter={(v, _n, entry) => [v + ' members', entry?.payload?.name ?? '']}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Legend */}
                                            <div className="mt-1 space-y-1">
                                                {membersByProgram.map((p, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                                        <span className="text-xs text-muted-foreground flex-1 truncate">{p.name}</span>
                                                        <span className="text-xs font-semibold">{p.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
