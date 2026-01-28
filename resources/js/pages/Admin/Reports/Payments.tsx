import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
    id: number;
    amount: string;
    paid_date: string;
    payment_method: string;
    status: 'pending' | 'verified' | 'rejected';
    reference_number: string;
    member: {
        id: number;
        member_no: string;
        user: {
            name: string;
            email: string;
        };
    };
    verified_by?: {
        name: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    payments: {
        data: Payment[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    summary: {
        total_collected: number;
        pending_verification: number;
    };
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function PaymentsReport({ payments, summary, filters }: Props) {
    const [dateRange, setDateRange] = useState({
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.reports.payments'), dateRange as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '/admin/reports/members' }, { title: 'Payments Report', href: '' }]}>
            <Head title="Payments Report" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Financial Reports</h2>
                            <p className="text-muted-foreground">
                                Track payments, verify transactions, and view financial summaries.
                            </p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    LKR {new Intl.NumberFormat('en-LK').format(summary.total_collected)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Verified payments in selected period
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.pending_verification}</div>
                                <p className="text-xs text-muted-foreground">Payments waiting for approval</p>
                            </CardContent>
                        </Card>
                        {/* Filters Card included in the grid or separate? Let's keep it separate for better mobile layout */}
                    </div>

                    {/* Filters & Content */}
                    <div className="grid gap-6 md:grid-cols-4">
                        {/* Sidebar Filters */}
                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Filter Reports</CardTitle>
                                    <CardDescription>Select date range</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleFilter} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">Start Date</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={dateRange.start_date}
                                                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">End Date</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={dateRange.end_date}
                                                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Apply Filters
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Data Table */}
                        <div className="md:col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Transaction History</CardTitle>
                                    <CardDescription>
                                        Showing {payments.from || 0} to {payments.to || 0} of {payments.total} results
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Member</TableHead>
                                                    <TableHead>Details</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Verified By</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payments.data.length > 0 ? (
                                                    payments.data.map((payment) => (
                                                        <TableRow key={payment.id}>
                                                            <TableCell className="font-medium">
                                                                {format(new Date(payment.paid_date), 'MMM dd, yyyy')}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{payment.member.user.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{payment.member.member_no}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col text-sm">
                                                                    <span className="capitalize">{payment.payment_method}</span>
                                                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={payment.reference_number}>
                                                                        Ref: {payment.reference_number || '-'}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>LKR {payment.amount}</TableCell>
                                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                                {payment.verified_by?.name || '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="h-24 text-center">
                                                            No payments found for the selected period.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {payments.links.map((link, i) => (
                                                <Button
                                                    key={i}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, dateRange, { preserveState: true })}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
