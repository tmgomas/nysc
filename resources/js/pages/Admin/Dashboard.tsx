import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Badge from '@/components/Badge';
import {
    Scan, Loader2, Clock, Calendar,
    Users, DollarSign, TrendingUp, Activity,
    ArrowRight, CreditCard, Zap, BarChart2,
    ChevronRight, Bell, UserCheck, TrendingDown,
    Award, Dumbbell, Target,
} from 'lucide-react';
import axios from 'axios';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    ComposedChart, Line,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
    members: {
        total: number; active: number; pending: number;
        suspended: number; new_this_month: number; growth_percent: number | null;
    };
    payments: {
        total_this_month: number; pending_count: number; overdue_count: number;
        collection_rate: number; revenue_growth: number | null;
    };
    attendance: { today: number; this_month: number; this_week: number; };
    programs: { total: number; active: number; };
    coaches: { total: number; active: number; };
}

interface ScheduleItem {
    sport_name: string; label?: string | null;
    start_time: string | null; end_time: string | null;
    coach?: string | null; capacity?: number | null; type: 'class' | 'practice';
}
interface TrendItem { date: string; full_date: string; count: number; }
interface RevenueTrendItem { month: string; revenue: number; }
interface ProgramItem { name: string; value: number; }
interface MemberGrowthItem { month: string; label: string; new: number; total: number; }
interface AttendanceByProgramItem { name: string; full_name: string; count: number; }
interface TopProgramRevenue { name: string; full_name: string; revenue: number; }
interface CoachWorkloadItem { name: string; programs: number; classes: number; specialization: string; }
interface PaymentBreakdownItem { name: string; value: number; count: number; }
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
    // New
    memberGrowthTrend: MemberGrowthItem[];
    attendanceByProgram: AttendanceByProgramItem[];
    topProgramsByRevenue: TopProgramRevenue[];
    coachWorkload: CoachWorkloadItem[];
    paymentBreakdown: PaymentBreakdownItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(time: string | null): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
}

function formatCurrency(amount: number): string {
    return 'Rs. ' + amount.toLocaleString('en-LK', { minimumFractionDigits: 0 });
}

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color, badge }: {
    icon: React.ElementType; label: string; value: string | number;
    sub?: React.ReactNode; color: string; badge?: React.ReactNode;
}) {
    return (
        <Card className="relative overflow-hidden">
            <div className={`absolute inset-0 opacity-5 ${color}`} />
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-3xl font-bold tracking-tight">{value}</p>
                            {badge}
                        </div>
                        {sub && <div className="mt-2">{sub}</div>}
                    </div>
                    <div className={`rounded-xl p-2.5 ${color} bg-opacity-10 shrink-0`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function GrowthBadge({ value }: { value: number | null }) {
    if (value === null) return null;
    const positive = value >= 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-1.5 py-0.5 ${positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(value)}%
        </span>
    );
}

function CollectionRateBar({ rate }: { rate: number }) {
    const color = rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Collection Rate</span>
                <span className="font-semibold">{rate}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${rate}%` }} />
            </div>
        </div>
    );
}

function StatusDot({ status }: { status: string }) {
    const colors: Record<string, string> = {
        active: 'bg-emerald-500', pending: 'bg-amber-500',
        suspended: 'bg-red-500', verified: 'bg-emerald-500',
        paid: 'bg-blue-500', rejected: 'bg-red-500',
    };
    return <span className={`inline-block h-2 w-2 rounded-full ${colors[status] ?? 'bg-gray-400'}`} />;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Dashboard({
    stats, todaySchedule, todayName,
    attendanceTrend, revenueTrend, membersByProgram,
    recentMembers, recentPayments, overduePayments, pendingRegistrations,
    memberGrowthTrend, attendanceByProgram, topProgramsByRevenue,
    coachWorkload, paymentBreakdown,
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

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ── Top Bar ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 max-w-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                {isSearching
                                    ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    : <Scan className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Scan RFID / type member ID…"
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

                    {/* ── Enhanced Stats Row ── */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                        <StatCard
                            icon={Users}
                            label="Total Members"
                            value={stats.members.total}
                            color="bg-indigo-500 text-indigo-600"
                            badge={<GrowthBadge value={stats.members.growth_percent} />}
                            sub={
                                <div className="flex flex-wrap gap-2">
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
                            badge={<GrowthBadge value={stats.payments.revenue_growth} />}
                            sub={<CollectionRateBar rate={stats.payments.collection_rate} />}
                        />
                        <StatCard
                            icon={Activity}
                            label="Today's Attendance"
                            value={stats.attendance.today}
                            color="bg-violet-500 text-violet-600"
                            sub={
                                <div className="space-y-0.5">
                                    <p className="text-xs text-muted-foreground">This week: <strong>{stats.attendance.this_week}</strong></p>
                                    <p className="text-xs text-muted-foreground">This month: <strong>{stats.attendance.this_month}</strong></p>
                                </div>
                            }
                        />
                        <StatCard
                            icon={Zap}
                            label="Active Programs"
                            value={stats.programs.active}
                            color="bg-amber-500 text-amber-600"
                            sub={<p className="text-xs text-muted-foreground">Total programs: {stats.programs.total}</p>}
                        />
                        <StatCard
                            icon={Award}
                            label="Active Coaches"
                            value={stats.coaches.active}
                            color="bg-pink-500 text-pink-600"
                            sub={<p className="text-xs text-muted-foreground">Total coaches: {stats.coaches.total}</p>}
                        />
                    </div>

                    {/* ── New Members This Month highlight ── */}
                    {stats.members.new_this_month > 0 && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-800 px-5 py-3 flex items-center gap-3">
                            <Target className="h-5 w-5 text-indigo-600 shrink-0" />
                            <p className="text-sm text-indigo-800 dark:text-indigo-300">
                                <strong>{stats.members.new_this_month} new member{stats.members.new_this_month !== 1 ? 's' : ''}</strong> registered this month.
                                {stats.members.suspended > 0 && (
                                    <span className="ml-3 text-red-600 dark:text-red-400">
                                        {stats.members.suspended} member{stats.members.suspended !== 1 ? 's' : ''} currently suspended.
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* ── Main 2-Column Layout ── */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                        {/* ──── Left Column (2/3) ──── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Member Growth – 12 Months */}
                            {memberGrowthTrend.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">Member Growth – Last 12 Months</CardTitle>
                                                <CardDescription>New registrations per month (bars) vs cumulative total (line)</CardDescription>
                                            </div>
                                            <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <ComposedChart data={memberGrowthTrend} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="newMemberGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                                                <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
                                                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                                <Bar yAxisId="left" dataKey="new" name="New Members" fill="url(#newMemberGrad)" radius={[4, 4, 0, 0]} />
                                                <Line yAxisId="right" type="monotone" dataKey="total" name="Total Members" stroke="#10b981" strokeWidth={2} dot={false} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Attendance Trend – 7 Days */}
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
                                    <ResponsiveContainer width="100%" height={160}>
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

                            {/* 2-col mini charts row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                {/* Attendance by Program */}
                                {attendanceByProgram.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-2">
                                                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <CardTitle className="text-base">Attendance by Program</CardTitle>
                                                    <CardDescription className="text-xs">This month</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={160}>
                                                <BarChart data={attendanceByProgram} layout="vertical" margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
                                                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={50} />
                                                    <Tooltip
                                                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                                        formatter={(v, _n, entry) => [v + ' check-ins', entry?.payload?.full_name]}
                                                    />
                                                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                                        {attendanceByProgram.map((_, i) => (
                                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Payment Breakdown – Pie */}
                                {paymentBreakdown.length > 0 && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <CardTitle className="text-base">Payment Breakdown</CardTitle>
                                                    <CardDescription className="text-xs">By type · this month</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ResponsiveContainer width="100%" height={160}>
                                                <PieChart>
                                                    <Pie
                                                        data={paymentBreakdown}
                                                        cx="50%" cy="50%"
                                                        innerRadius={40} outerRadius={65}
                                                        paddingAngle={3} dataKey="value"
                                                    >
                                                        {paymentBreakdown.map((_, i) => (
                                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                                        formatter={(v, _n, entry) => [formatCurrency(Number(v)), entry?.payload?.name]}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="mt-1 space-y-1">
                                                {paymentBreakdown.map((p, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                                        <span className="text-xs text-muted-foreground flex-1 truncate">{p.name}</span>
                                                        <span className="text-xs font-semibold">{formatCurrency(p.value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Revenue Trend */}
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
                                    <ResponsiveContainer width="100%" height={160}>
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

                            {/* Top Programs by Revenue */}
                            {topProgramsByRevenue.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <CardTitle className="text-base">Top Programs by Revenue</CardTitle>
                                                <CardDescription>Last 6 months · verified payments</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ul className="divide-y">
                                            {topProgramsByRevenue.map((p, i) => {
                                                const maxRev = topProgramsByRevenue[0].revenue;
                                                const pct = maxRev > 0 ? Math.round((p.revenue / maxRev) * 100) : 0;
                                                return (
                                                    <li key={i} className="px-6 py-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                                                                <span className="text-sm font-medium truncate max-w-[180px]">{p.full_name}</span>
                                                            </div>
                                                            <span className="text-sm font-semibold text-emerald-600">{formatCurrency(p.revenue)}</span>
                                                        </div>
                                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden ml-6">
                                                            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

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

                        {/* ──── Right Column (1/3) ──── */}
                        <div className="space-y-6">

                            {/* Alerts */}
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
                                                            <a href={`/admin/members/${pr.id}`} className="shrink-0 text-amber-700 hover:text-amber-900">
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
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-sm font-medium truncate">{item.sport_name}</span>
                                                                {item.label && (
                                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.label}</Badge>
                                                                )}
                                                                <Badge
                                                                    variant={item.type === 'class' ? 'info' : 'success'}
                                                                    className="text-[10px] px-1.5 py-0">
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

                            {/* Members by Program Pie */}
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
                                                <Pie data={membersByProgram} cx="50%" cy="50%"
                                                    innerRadius={45} outerRadius={70}
                                                    paddingAngle={3} dataKey="value">
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

                            {/* Coach Workload */}
                            {coachWorkload.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <CardTitle className="text-base">Coach Workload</CardTitle>
                                                <CardDescription className="text-xs">Active classes per coach</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ul className="divide-y">
                                            {coachWorkload.map((c, i) => (
                                                <li key={i} className="px-5 py-2.5 flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] + '20', color: CHART_COLORS[i % CHART_COLORS.length] }}>
                                                        {c.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{c.name}</p>
                                                        <p className="text-[11px] text-muted-foreground">{c.specialization || '—'}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-bold">{c.classes}</p>
                                                        <p className="text-[10px] text-muted-foreground">classes</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
