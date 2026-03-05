import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, Save, CreditCard } from 'lucide-react';

interface Member {
    id: string;
    member_number: string;
    name: string;
}

interface Program {
    id: string;
    name: string;
    monthly_fee: number;
    admission_fee: number;
}

interface Props {
    members: Member[];
    programs: Program[];
}

export default function Create({ members, programs }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        member_id: '',
        program_id: '',
        type: 'monthly',
        payment_method: 'cash',
        month_year: '',
        months_count: 1,
        receipt_url: '',
        reference_number: '',
    });

    const [memberSearch, setMemberSearch] = useState('');

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.member_number.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/payments');
    };

    // Generate month-year options (current month + 12 past months)
    const monthOptions = () => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 13; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push({ value: val, label });
        }
        return options;
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Payments', href: '/admin/payments' },
                { title: 'Record Payment', href: '/admin/payments/create' },
            ]}
        >
            <Head title="Record Payment" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/payments">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Record Payment</h2>
                            <p className="text-muted-foreground">
                                Add a new payment record manually
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            {/* Member Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Member</CardTitle>
                                    <CardDescription>
                                        Select the member for this payment
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Search Member</Label>
                                        <Input
                                            placeholder="Type name or member number..."
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="member_id">
                                            Member <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.member_id}
                                            onValueChange={(v) => setData('member_id', v)}
                                        >
                                            <SelectTrigger
                                                className={errors.member_id ? 'border-red-500' : ''}
                                            >
                                                <SelectValue placeholder="Select a member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredMembers.map((m) => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {m.name} ({m.member_number})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.member_id && (
                                            <p className="text-sm text-red-500">{errors.member_id}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payment Details
                                    </CardTitle>
                                    <CardDescription>
                                        Enter payment type and method
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    {/* Payment Type */}
                                    <div className="space-y-2">
                                        <Label htmlFor="type">
                                            Payment Type <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(v) => setData('type', v)}
                                        >
                                            <SelectTrigger
                                                className={errors.type ? 'border-red-500' : ''}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admission">Admission</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="bulk">Bulk</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="text-sm text-red-500">{errors.type}</p>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">
                                            Payment Method <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.payment_method}
                                            onValueChange={(v) => setData('payment_method', v)}
                                        >
                                            <SelectTrigger
                                                className={errors.payment_method ? 'border-red-500' : ''}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="online">Online</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_method && (
                                            <p className="text-sm text-red-500">{errors.payment_method}</p>
                                        )}
                                    </div>

                                    {/* Program (for monthly/bulk) */}
                                    {(data.type === 'monthly' || data.type === 'bulk') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="program_id">Program</Label>
                                            <Select
                                                value={data.program_id}
                                                onValueChange={(v) => setData('program_id', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select program (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {programs.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.program_id && (
                                                <p className="text-sm text-red-500">{errors.program_id}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Month/Year (for monthly or bulk) */}
                                    {(data.type === 'monthly' || data.type === 'bulk') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="month_year">
                                                Month / Year <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={data.month_year}
                                                onValueChange={(v) => setData('month_year', v)}
                                            >
                                                <SelectTrigger
                                                    className={errors.month_year ? 'border-red-500' : ''}
                                                >
                                                    <SelectValue placeholder="Select month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthOptions().map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.month_year && (
                                                <p className="text-sm text-red-500">{errors.month_year}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Months count (for bulk) */}
                                    {data.type === 'bulk' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="months_count">
                                                Number of Months <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="months_count"
                                                type="number"
                                                min={1}
                                                value={data.months_count}
                                                onChange={(e) =>
                                                    setData('months_count', parseInt(e.target.value) || 1)
                                                }
                                                className={errors.months_count ? 'border-red-500' : ''}
                                            />
                                            {errors.months_count && (
                                                <p className="text-sm text-red-500">{errors.months_count}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Reference Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="reference_number">Reference Number</Label>
                                        <Input
                                            id="reference_number"
                                            value={data.reference_number}
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            placeholder="Bank ref / receipt no."
                                        />
                                        {errors.reference_number && (
                                            <p className="text-sm text-red-500">{errors.reference_number}</p>
                                        )}
                                    </div>

                                    {/* Receipt URL */}
                                    <div className="space-y-2">
                                        <Label htmlFor="receipt_url">Receipt URL</Label>
                                        <Input
                                            id="receipt_url"
                                            type="url"
                                            value={data.receipt_url}
                                            onChange={(e) => setData('receipt_url', e.target.value)}
                                            placeholder="https://..."
                                        />
                                        {errors.receipt_url && (
                                            <p className="text-sm text-red-500">{errors.receipt_url}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => (window.location.href = '/admin/payments')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="min-w-[160px]">
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Record Payment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
