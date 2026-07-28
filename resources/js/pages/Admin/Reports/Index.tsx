import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Users, DollarSign, CalendarCheck, TrendingUp } from 'lucide-react';

interface ReportIndexProps {
    kpis: {
        revenue: number;
        activeMembers: number;
        attendanceToday: number;
    };
    attendanceTrend: { date: string; count: number }[];
    recentPayments: any[];
}

export default function ReportsIndex({ kpis, attendanceTrend, recentPayments }: ReportIndexProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '/admin/reports' }, { title: 'Dashboard', href: '' }]}>
            <Head title="Reporting & Analytics" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-white/20 dark:border-slate-800 backdrop-blur-xl shadow-lg">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-8 h-8 text-indigo-500" />
                            Analytics Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Monitor real-time metrics and export financial reports.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <a 
                            href={route('reports.export', { type: 'payments' })}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-md transition-all font-semibold"
                        >
                            <Download className="w-5 h-5" />
                            Export Payments CSV
                        </a>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Revenue</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                    LKR {Number(kpis.revenue).toLocaleString()}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Members</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                    {kpis.activeMembers}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Attendance</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                    {kpis.attendanceToday}
                                </p>
                            </div>
                            <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl">
                                <CalendarCheck className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Attendance Trend (14 Days)</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fill: '#64748b' }} 
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.substring(5)} // Show MM-DD
                                    />
                                    <YAxis 
                                        tick={{ fill: '#64748b' }} 
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#8b5cf6" 
                                        strokeWidth={3}
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Payments</h2>
                            <Link href={route('reports.payments')} className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">
                                View All
                            </Link>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                            {payment.member?.calling_name || payment.member?.full_name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {payment.type} &bull; {payment.paid_date}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                            +{Number(payment.amount).toLocaleString()}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            payment.status === 'verified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            payment.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            
                            {recentPayments.length === 0 && (
                                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                                    No recent payments found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
