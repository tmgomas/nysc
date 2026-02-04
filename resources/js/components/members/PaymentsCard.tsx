import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    CreditCard,
    ChevronDown,
    ChevronUp,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    Receipt,
    Banknote,
    Smartphone,
    Building2,
    AlertCircle,
    CheckSquare,
    Square
} from 'lucide-react';
import type { Member } from './types';
import { useState, useMemo } from 'react';

interface PaymentsCardProps {
    member: Member;
    onRecordPayment: (selectedScheduleIds?: string[]) => void;
}

export function PaymentsCard({ member, onRecordPayment }: PaymentsCardProps) {
    const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set());
    const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const pendingPayments = member.payments.filter(p => p.status === 'pending');
    const pendingSchedules = member.payment_schedules.filter(s => s.status === 'pending');
    const recentPayments = member.payments
        .filter(p => p.status === 'paid' || p.status === 'verified')
        .sort((a, b) => new Date(b.paid_date || b.created_at).getTime() - new Date(a.paid_date || a.created_at).getTime())
        .slice(0, 10);

    // Calculate total for selected schedules
    const selectedTotal = Array.from(selectedSchedules).reduce((sum, scheduleId) => {
        const schedule = pendingSchedules.find(s => s.id === scheduleId);
        return sum + (schedule ? Number(schedule.amount) : 0);
    }, 0);

    // Group pending schedules by month
    const pendingByMonth = useMemo(() => {
        const grouped = new Map<string, typeof pendingSchedules>();
        pendingSchedules.forEach(schedule => {
            const month = schedule.month_year;
            if (!grouped.has(month)) {
                grouped.set(month, []);
            }
            grouped.get(month)!.push(schedule);
        });
        return grouped;
    }, [pendingSchedules]);

    const togglePaymentExpansion = (paymentId: string) => {
        setExpandedPayments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(paymentId)) {
                newSet.delete(paymentId);
            } else {
                newSet.add(paymentId);
            }
            return newSet;
        });
    };

    const getPaymentMethodIcon = (method: string | null) => {
        switch (method) {
            case 'cash':
                return <Banknote className="h-3.5 w-3.5" />;
            case 'online':
                return <Smartphone className="h-3.5 w-3.5" />;
            case 'bank_transfer':
                return <Building2 className="h-3.5 w-3.5" />;
            default:
                return <CreditCard className="h-3.5 w-3.5" />;
        }
    };

    const getPaymentMethodLabel = (method: string | null) => {
        switch (method) {
            case 'cash':
                return 'Cash';
            case 'online':
                return 'Online';
            case 'bank_transfer':
                return 'Bank Transfer';
            default:
                return 'N/A';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date();
    };

    // Selection handlers
    const toggleScheduleSelection = (scheduleId: string) => {
        setSelectedSchedules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(scheduleId)) {
                newSet.delete(scheduleId);
            } else {
                newSet.add(scheduleId);
            }
            return newSet;
        });
    };

    const selectAllInMonth = (monthSchedules: typeof pendingSchedules) => {
        setSelectedSchedules(prev => {
            const newSet = new Set(prev);
            monthSchedules.forEach(schedule => newSet.add(schedule.id));
            return newSet;
        });
    };

    const deselectAllInMonth = (monthSchedules: typeof pendingSchedules) => {
        setSelectedSchedules(prev => {
            const newSet = new Set(prev);
            monthSchedules.forEach(schedule => newSet.delete(schedule.id));
            return newSet;
        });
    };

    const clearSelection = () => {
        setSelectedSchedules(new Set());
        setIsSelectionMode(false);
    };

    const handleBulkPayment = () => {
        if (selectedSchedules.size === 0) return;
        // Pass selected schedule IDs to parent for bulk payment
        const selectedIds = Array.from(selectedSchedules);
        onRecordPayment(selectedIds);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payments & Schedules
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {isSelectionMode && selectedSchedules.size > 0 && (
                            <div className="flex items-center gap-2 mr-2">
                                <Badge variant="secondary" className="text-xs">
                                    {selectedSchedules.size} selected
                                </Badge>
                                <Badge variant="default" className="text-xs font-mono">
                                    Rs. {selectedTotal.toLocaleString()}
                                </Badge>
                            </div>
                        )}
                        {pendingSchedules.length > 0 && (
                            <>
                                {isSelectionMode ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={clearSelection}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleBulkPayment}
                                            disabled={selectedSchedules.size === 0}
                                        >
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Pay Selected
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setIsSelectionMode(true)}
                                        >
                                            <CheckSquare className="h-4 w-4 mr-2" />
                                            Select Multiple
                                        </Button>
                                        {member.status === 'active' && (
                                            <Button size="sm" onClick={() => onRecordPayment()}>
                                                <DollarSign className="h-4 w-4 mr-2" />
                                                Record Payment
                                            </Button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {pendingSchedules.length === 0 && member.status === 'active' && (
                            <Button size="sm" onClick={() => onRecordPayment()}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Record Payment
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Upcoming Due Payments */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Upcoming Due Payments
                        </h4>
                        {(pendingSchedules.length > 0 || pendingPayments.length > 0) && (
                            <Badge variant="secondary" className="text-xs">
                                {pendingSchedules.length + pendingPayments.length} pending
                            </Badge>
                        )}
                    </div>

                    {(pendingSchedules.length > 0 || pendingPayments.length > 0) ? (
                        <div className="space-y-6">
                            {/* Pending Payments (Admission/Initial) - Mobile Cards */}
                            {pendingPayments.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-xs font-semibold text-muted-foreground uppercase">Initial Payments</h5>
                                    {pendingPayments.map(payment => {
                                        const isExpanded = expandedPayments.has(payment.id);
                                        const hasItems = payment.items && payment.items.length > 0;
                                        const overdue = payment.due_date && isOverdue(payment.due_date);

                                        return (
                                            <div
                                                key={payment.id}
                                                className={`border rounded-lg overflow-hidden transition-all ${overdue ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'
                                                    }`}
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant={overdue ? "destructive" : "secondary"} className="text-xs">
                                                                    {payment.type.toUpperCase()}
                                                                </Badge>
                                                                {payment.receipt_number && (
                                                                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                                                                        <Receipt className="h-3 w-3" />
                                                                        {payment.receipt_number}
                                                                    </span>
                                                                )}
                                                                {overdue && (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                                        Overdue
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {payment.notes && (
                                                                <p className="text-sm text-muted-foreground mb-2">{payment.notes}</p>
                                                            )}

                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                                {payment.due_date && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        Due: {formatDate(payment.due_date)}
                                                                    </span>
                                                                )}
                                                                {hasItems && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {payment.items?.length} {payment.items?.length === 1 ? 'item' : 'items'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2">
                                                            <div className="text-right">
                                                                <div className="text-2xl font-bold text-amber-600">
                                                                    Rs. {Number(payment.amount).toLocaleString()}
                                                                </div>
                                                            </div>

                                                            {hasItems && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => togglePaymentExpansion(payment.id)}
                                                                    className="h-7 text-xs"
                                                                >
                                                                    {isExpanded ? (
                                                                        <>
                                                                            <ChevronUp className="h-3 w-3 mr-1" />
                                                                            Hide Details
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ChevronDown className="h-3 w-3 mr-1" />
                                                                            View Details
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expandable Payment Items */}
                                                {hasItems && isExpanded && (
                                                    <div className="border-t bg-white/50">
                                                        <div className="p-4 space-y-2">
                                                            <div className="text-xs font-semibold text-muted-foreground mb-3">Payment Breakdown:</div>
                                                            {payment.items?.map(item => (
                                                                <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded bg-muted/30">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                                        <div>
                                                                            <div className="text-sm font-medium">
                                                                                {item.description || `${item.type} - ${item.sport?.name}`}
                                                                            </div>
                                                                            {item.month_year && (
                                                                                <div className="text-xs text-muted-foreground">{item.month_year}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            {item.sport?.name || 'General'}
                                                                        </Badge>
                                                                        <div className="font-mono text-sm font-medium">
                                                                            Rs. {Number(item.amount).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pending Schedules (Monthly) - Grouped by Month */}
                            {pendingByMonth.size > 0 && (
                                <div className="space-y-4">
                                    <h5 className="text-xs font-semibold text-muted-foreground uppercase">Monthly Payments</h5>
                                    {Array.from(pendingByMonth.entries()).map(([monthYear, schedules]) => {
                                        const monthTotal = schedules.reduce((sum, s) => sum + Number(s.amount), 0);
                                        const hasOverdue = schedules.some(s => isOverdue(s.due_date));

                                        return (
                                            <div key={monthYear} className="border rounded-lg overflow-hidden">
                                                {/* Month Header */}
                                                <div className={`p-3 ${hasOverdue ? 'bg-red-50 border-b border-red-200' : 'bg-muted/30 border-b'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {isSelectionMode && (
                                                                <Checkbox
                                                                    checked={schedules.every(s => selectedSchedules.has(s.id))}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            selectAllInMonth(schedules);
                                                                        } else {
                                                                            deselectAllInMonth(schedules);
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                            <Calendar className="h-4 w-4" />
                                                            <span className="font-semibold">{monthYear}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {schedules.length} {schedules.length === 1 ? 'payment' : 'payments'}
                                                            </Badge>
                                                            {hasOverdue && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                                    Overdue
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-lg font-bold">
                                                            Rs. {monthTotal.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop Table View */}
                                                <div className="hidden md:block">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                {isSelectionMode && <TableHead className="w-12"></TableHead>}
                                                                <TableHead>Sport</TableHead>
                                                                <TableHead>Due Date</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead className="text-right">Amount</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {schedules.map(schedule => {
                                                                const overdue = isOverdue(schedule.due_date);
                                                                const isSelected = selectedSchedules.has(schedule.id);
                                                                return (
                                                                    <TableRow key={schedule.id} className={`${overdue ? 'bg-red-50/30' : ''} ${isSelected ? 'bg-primary/5' : ''}`}>
                                                                        {isSelectionMode && (
                                                                            <TableCell>
                                                                                <Checkbox
                                                                                    checked={isSelected}
                                                                                    onCheckedChange={() => toggleScheduleSelection(schedule.id)}
                                                                                />
                                                                            </TableCell>
                                                                        )}
                                                                        <TableCell className="font-medium">
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="secondary" className="text-xs">
                                                                                    {schedule.sport?.name || 'General'}
                                                                                </Badge>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {formatDate(schedule.due_date)}
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {overdue ? (
                                                                                <Badge variant="destructive" className="text-xs">
                                                                                    Overdue
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    Pending
                                                                                </Badge>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-mono font-semibold">
                                                                            Rs. {Number(schedule.amount).toLocaleString()}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                {/* Mobile Card View */}
                                                <div className="md:hidden divide-y">
                                                    {schedules.map(schedule => {
                                                        const overdue = isOverdue(schedule.due_date);
                                                        const isSelected = selectedSchedules.has(schedule.id);
                                                        return (
                                                            <div key={schedule.id} className={`p-4 ${overdue ? 'bg-red-50/30' : 'bg-card'} ${isSelected ? 'bg-primary/5' : ''}`}>
                                                                <div className="flex items-start gap-3">
                                                                    {isSelectionMode && (
                                                                        <Checkbox
                                                                            checked={isSelected}
                                                                            onCheckedChange={() => toggleScheduleSelection(schedule.id)}
                                                                            className="mt-1"
                                                                        />
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {schedule.sport?.name || 'General'}
                                                                            </Badge>
                                                                            {overdue && (
                                                                                <Badge variant="destructive" className="text-xs">
                                                                                    Overdue
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="text-xs text-muted-foreground">
                                                                                Due: {formatDate(schedule.due_date)}
                                                                            </div>
                                                                            <div className="text-xl font-bold">
                                                                                Rs. {Number(schedule.amount).toLocaleString()}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 border rounded-lg bg-muted/20">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                            <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                            <p className="text-xs text-muted-foreground mt-1">No pending payments</p>
                        </div>
                    )}
                </div>

                {/* Recent Payment History */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Recent Payment History
                        </h4>
                        {recentPayments.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {recentPayments.length} payments
                            </Badge>
                        )}
                    </div>

                    {recentPayments.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Receipt</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentPayments.map(payment => {
                                            const hasItems = payment.items && payment.items.length > 0;
                                            return (
                                                <TableRow key={payment.id} className="hover:bg-muted/50">
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {payment.type.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.receipt_number ? (
                                                            <span className="text-xs font-mono flex items-center gap-1">
                                                                <Receipt className="h-3 w-3" />
                                                                {payment.receipt_number}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatDate(payment.paid_date || payment.created_at)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.payment_method ? (
                                                            <div className="flex items-center gap-1.5">
                                                                {getPaymentMethodIcon(payment.payment_method)}
                                                                <span className="text-sm capitalize">
                                                                    {getPaymentMethodLabel(payment.payment_method)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={payment.status === 'verified' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {payment.status === 'verified' ? (
                                                                <><CheckCircle2 className="h-3 w-3 mr-1" />VERIFIED</>
                                                            ) : (
                                                                'PAID'
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-semibold text-green-600">
                                                        Rs. {Number(payment.amount).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                                {recentPayments.map(payment => {
                                    const isExpanded = expandedPayments.has(payment.id);
                                    const hasItems = payment.items && payment.items.length > 0;

                                    return (
                                        <div
                                            key={payment.id}
                                            className="border rounded-lg overflow-hidden bg-card hover:shadow-sm transition-all"
                                        >
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <Badge
                                                                variant={payment.status === 'verified' ? 'default' : 'secondary'}
                                                                className="text-xs"
                                                            >
                                                                {payment.status === 'verified' ? (
                                                                    <><CheckCircle2 className="h-3 w-3 mr-1" />VERIFIED</>
                                                                ) : (
                                                                    'PAID'
                                                                )}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {payment.type.toUpperCase()}
                                                            </Badge>
                                                            {payment.receipt_number && (
                                                                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                                                                    <Receipt className="h-3 w-3" />
                                                                    {payment.receipt_number}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(payment.paid_date || payment.created_at)}
                                                            </span>
                                                            {payment.payment_method && (
                                                                <span className="flex items-center gap-1 capitalize">
                                                                    {getPaymentMethodIcon(payment.payment_method)}
                                                                    {getPaymentMethodLabel(payment.payment_method)}
                                                                </span>
                                                            )}
                                                            {hasItems && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {payment.items?.length} {payment.items?.length === 1 ? 'item' : 'items'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-green-600">
                                                                Rs. {Number(payment.amount).toLocaleString()}
                                                            </div>
                                                        </div>

                                                        {hasItems && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => togglePaymentExpansion(payment.id)}
                                                                className="h-7 text-xs"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        <ChevronUp className="h-3 w-3 mr-1" />
                                                                        Hide
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="h-3 w-3 mr-1" />
                                                                        Details
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expandable Payment Items */}
                                            {hasItems && isExpanded && (
                                                <div className="border-t bg-muted/20">
                                                    <div className="p-4 space-y-2">
                                                        <div className="text-xs font-semibold text-muted-foreground mb-3">Payment Breakdown:</div>
                                                        {payment.items?.map(item => (
                                                            <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded bg-card">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                    <div>
                                                                        <div className="text-sm font-medium">
                                                                            {item.description || `${item.type} - ${item.sport?.name}`}
                                                                        </div>
                                                                        {item.month_year && (
                                                                            <div className="text-xs text-muted-foreground">{item.month_year}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {item.sport?.name || 'General'}
                                                                    </Badge>
                                                                    <div className="font-mono text-sm font-medium text-green-600">
                                                                        Rs. {Number(item.amount).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 border rounded-lg bg-muted/20">
                            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium text-muted-foreground">No payment history yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Payments will appear here once recorded</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
