import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    DollarSign,
    CreditCard,
    TrendingUp,
    Users,
    Calendar,
    Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    payment_method: string;
    month_year: string | null;
    paid_date: string;
    member: {
        id: string;
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
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    payments: PaginatedPayments;
    filters: {
        status?: string;
        type?: string;
        search?: string;
    };
    stats?: {
        total_amount: number;
        pending_count: number;
        verified_count: number;
        total_count: number;
    };
}

export default function Index({ payments, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [type, setType] = useState(filters.type || 'all');
    const { confirm, ConfirmDialog } = useConfirm();

    const handleFilter = () => {
        const params: any = {};
        if (search) params.search = search;
        if (status && status !== 'all') params.status = status;
        if (type && type !== 'all') params.type = type;

        router.get('/admin/payments', params, { preserveState: true });
    };

    const handleVerify = async (payment: Payment) => {
        const confirmed = await confirm({
            title: 'Verify Payment',
            description: `Verify payment of Rs. ${Number(payment.amount).toLocaleString()} from ${payment.member.user?.name || payment.member.member_number}?`,
            confirmText: 'Verify',
            cancelText: 'Cancel',
        });

        if (confirmed) {
            toast.promise(
                new Promise((resolve, reject) => {
                    router.post(`/admin/payments/${payment.id}/verify`, {}, {
                        onSuccess: () => resolve(payment.member.user?.name || payment.member.member_number),
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Verifying payment...',
                    success: (name) => `Payment from ${name} verified successfully!`,
                    error: 'Failed to verify payment',
                }
            );
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'secondary',
            paid: 'default',
            verified: 'default',
            rejected: 'destructive',
        };
        return variants[status as keyof typeof variants] || 'outline';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'text-yellow-600 bg-yellow-50',
            paid: 'text-blue-600 bg-blue-50',
            verified: 'text-green-600 bg-green-50',
            rejected: 'text-red-600 bg-red-50',
        };
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50';
    };

    const getTypeBadge = (type: string) => {
        const variants = {
            admission: 'secondary',
            monthly: 'default',
            bulk: 'outline',
        };
        return variants[type as keyof typeof variants] || 'outline';
    };

    // Calculate stats if not provided
    const calculatedStats = stats || {
        total_amount: payments.data.reduce((sum, p) => sum + Number(p.amount), 0),
        pending_count: payments.data.filter(p => p.status === 'pending').length,
        verified_count: payments.data.filter(p => p.status === 'verified').length,
        total_count: payments.total,
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Payments', href: '/admin/payments' }]}>
            <Head title="Payments Management" />
            <ConfirmDialog />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
                                <p className="text-muted-foreground">
                                    Manage and track all payment transactions
                                </p>
                            </div>
                            <Link href="/admin/payments/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Record Payment
                                </Button>
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Amount
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        Rs. {calculatedStats.total_amount.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        All time payments
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Payments
                                    </CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {calculatedStats.total_count}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Payment records
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Pending
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {calculatedStats.pending_count}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Awaiting verification
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Verified
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {calculatedStats.verified_count}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Completed payments
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </CardTitle>
                                <CardDescription>
                                    Search and filter payments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Search</label>
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Member number or name..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="verified">Verified</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type</label>
                                        <Select value={type} onValueChange={setType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="admission">Admission</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="bulk">Bulk</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-end">
                                        <Button onClick={handleFilter} className="w-full">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mobile Card View */}
                        <div className="block lg:hidden space-y-4">
                            {payments.data.map((payment) => (
                                <Card key={payment.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    {payment.member.user?.name || payment.member.member_number}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    {payment.member.member_number}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/payments/${payment.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {payment.status === 'paid' && (
                                                        <DropdownMenuItem onClick={() => handleVerify(payment)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Verify Payment
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-bold">
                                                Rs. {Number(payment.amount).toLocaleString()}
                                            </div>
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(payment.status)}`}>
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CreditCard className="h-4 w-4" />
                                            {payment.payment_method?.replace('_', ' ') || '-'}
                                        </div>
                                        {payment.month_year && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {payment.month_year}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(payment.paid_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <Badge variant={getTypeBadge(payment.type) as any}>
                                                {payment.type}
                                            </Badge>
                                            <Badge variant={getStatusBadge(payment.status) as any}>
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <Card className="hidden lg:block">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Member
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Amount
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Type
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Method
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Month/Year
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.data.map((payment) => (
                                            <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <Link
                                                            href={`/admin/members/${payment.member.id}`}
                                                            className="text-sm font-medium hover:underline"
                                                        >
                                                            {payment.member.user?.name || 'N/A'}
                                                        </Link>
                                                        <div className="text-sm text-muted-foreground">
                                                            {payment.member.member_number}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold">
                                                    Rs. {Number(payment.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={getTypeBadge(payment.type) as any}>
                                                        {payment.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm capitalize">
                                                    {payment.payment_method?.replace('_', ' ') || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {payment.month_year || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={getStatusBadge(payment.status) as any}>
                                                        {payment.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/payments/${payment.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </Button>
                                                        {payment.status === 'paid' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleVerify(payment)}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Verify
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="border-t px-6 py-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium">{payments.data.length}</span> of{' '}
                                        <span className="font-medium">{payments.total}</span> payments
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: payments.last_page }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === payments.current_page ? 'default' : 'outline'}
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/payments?page=${page}&search=${search}&status=${status !== 'all' ? status : ''}&type=${type !== 'all' ? type : ''}`}
                                                >
                                                    {page}
                                                </Link>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Empty State */}
                        {payments.data.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Try adjusting your filters or record a new payment
                                    </p>
                                    <Button asChild>
                                        <Link href="/admin/payments/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Record Payment
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
