import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    CheckCircle,
    XCircle,
    Clock,
    CalendarCheck,
    CalendarX,
    AlertTriangle,
    Users,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ClassAbsence } from '@/components/members/types';

interface PaginatedAbsences {
    data: ClassAbsence[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    absences: PaginatedAbsences;
    filters: { status?: string; program_id?: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="h-3 w-3" /> },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="h-3 w-3" /> },
    makeup_selected: { label: 'Makeup Booked', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <CalendarCheck className="h-3 w-3" /> },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="h-3 w-3" /> },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <AlertTriangle className="h-3 w-3" /> },
    no_makeup: { label: 'No Makeup', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <CalendarX className="h-3 w-3" /> },
};

export default function ClassAbsencesIndex({ absences, filters }: Props) {
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [actionDialog, setActionDialog] = useState<null | { type: 'approve' | 'reject'; absence: ClassAbsence }>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        router.get(route('admin.class-absences.index'), { status: value === 'all' ? '' : value }, { preserveState: true });
    };

    const handleAction = () => {
        if (!actionDialog) return;
        setIsSubmitting(true);

        const url = actionDialog.type === 'approve'
            ? route('admin.class-absences.approve', actionDialog.absence.id)
            : route('admin.class-absences.reject', actionDialog.absence.id);

        toast.promise(
            new Promise<void>((resolve, reject) => {
                router.post(url, { admin_notes: adminNotes }, {
                    onSuccess: () => { resolve(); setActionDialog(null); setAdminNotes(''); setIsSubmitting(false); },
                    onError: () => { reject(); setIsSubmitting(false); },
                });
            }),
            {
                loading: actionDialog.type === 'approve' ? 'Approving...' : 'Rejecting...',
                success: actionDialog.type === 'approve' ? 'Absence approved! Member notified.' : 'Absence rejected.',
                error: 'Action failed',
            }
        );
    };

    const pendingCount = absences.data.filter(a => a.status === 'pending').length;

    return (
        <AppLayout>
            <Head title="Class Absences" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Class Absences</h1>
                        <p className="text-muted-foreground">Manage member absence requests and makeup class approvals</p>
                    </div>
                    {pendingCount > 0 && (
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">{pendingCount} pending approval{pendingCount > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Pending', count: absences.data.filter(a => a.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        { label: 'Approved', count: absences.data.filter(a => a.status === 'approved').length, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Makeup Booked', count: absences.data.filter(a => a.status === 'makeup_selected').length, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Completed', count: absences.data.filter(a => a.status === 'completed').length, color: 'text-green-600', bg: 'bg-green-50' },
                    ].map(s => (
                        <Card key={s.label} className={`${s.bg} border-0`}>
                            <CardContent className="p-4">
                                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                                <div className="text-sm text-muted-foreground">{s.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Filter by status:</span>
                    <Select value={statusFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Absences</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="makeup_selected">Makeup Booked</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">{absences.total} total</span>
                </div>

                {/* Absence Cards */}
                <div className="space-y-3">
                    {absences.data.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p>No absence requests found.</p>
                            </CardContent>
                        </Card>
                    )}

                    {absences.data.map(absence => {
                        const cfg = STATUS_CONFIG[absence.status] ?? STATUS_CONFIG.pending;
                        const isUrgent = absence.status === 'approved' && absence.days_left !== null && (absence.days_left ?? 0) <= 2;

                        return (
                            <Card key={absence.id} className={isUrgent ? 'border-orange-300 bg-orange-50/30' : ''}>
                                <CardContent className="p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Member info */}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold">{absence.member?.full_name}</span>
                                                <span className="text-xs text-muted-foreground">#{absence.member?.member_number}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                                {isUrgent && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                                        <AlertTriangle className="h-3 w-3" /> {absence.days_left}d left
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <span>
                                                    <span className="font-medium text-foreground">Class:</span>{' '}
                                                    {absence.program_class?.program?.name} — {absence.program_class?.label ?? absence.program_class?.day_of_week}
                                                    {absence.program_class?.formatted_time && ` (${absence.program_class.formatted_time})`}
                                                </span>
                                                <span>
                                                    <span className="font-medium text-foreground">Absent:</span>{' '}
                                                    {new Date(absence.absent_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                {absence.reason && (
                                                    <span>
                                                        <span className="font-medium text-foreground">Reason:</span> {absence.reason}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Makeup info */}
                                            {absence.status === 'makeup_selected' && absence.makeup_class && (
                                                <div className="mt-1 flex items-center gap-2 text-sm text-purple-700 bg-purple-50 rounded px-2 py-1 w-fit">
                                                    <CalendarCheck className="h-3.5 w-3.5" />
                                                    Makeup: {absence.makeup_class.label ?? absence.makeup_class.day_of_week}
                                                    {absence.makeup_date && ` on ${new Date(absence.makeup_date).toLocaleDateString()}`}
                                                </div>
                                            )}
                                            {absence.status === 'approved' && absence.makeup_deadline && (
                                                <div className="mt-1 text-xs text-blue-600">
                                                    Member must select makeup by {new Date(absence.makeup_deadline).toLocaleDateString()}
                                                    {absence.days_left !== null && ` (${absence.days_left} day${absence.days_left !== 1 ? 's' : ''} remaining)`}
                                                </div>
                                            )}
                                            {absence.admin_notes && (
                                                <div className="mt-1 text-xs text-muted-foreground italic">Admin note: {absence.admin_notes}</div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {absence.status === 'pending' && (
                                            <div className="flex gap-2 shrink-0">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => setActionDialog({ type: 'approve', absence })}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setActionDialog({ type: 'reject', absence })}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Pagination */}
                {absences.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: absences.last_page }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                size="sm"
                                variant={page === absences.current_page ? 'default' : 'outline'}
                                onClick={() => router.get(route('admin.class-absences.index'), { ...filters, page })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Approve / Reject Dialog */}
            <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setAdminNotes(''); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog?.type === 'approve' ? '✅ Approve Absence' : '❌ Reject Absence'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog?.type === 'approve'
                                ? 'The member will be notified and given 7 days to select a makeup class within the same month.'
                                : 'The member will be notified that the request was rejected.'}
                        </DialogDescription>
                    </DialogHeader>

                    {actionDialog && (
                        <div className="py-2 space-y-3">
                            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                                <div><span className="font-medium">Member:</span> {actionDialog.absence.member?.full_name}</div>
                                <div><span className="font-medium">Class:</span> {actionDialog.absence.program_class?.label ?? actionDialog.absence.program_class?.day_of_week}</div>
                                <div><span className="font-medium">Date:</span> {new Date(actionDialog.absence.absent_date).toLocaleDateString()}</div>
                            </div>
                            <div className="space-y-1">
                                <Label>Admin Note (optional)</Label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder={actionDialog.type === 'approve' ? 'Any instructions for the member...' : 'Reason for rejection...'}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setActionDialog(null); setAdminNotes(''); }}>Cancel</Button>
                        <Button
                            disabled={isSubmitting}
                            className={actionDialog?.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                            variant={actionDialog?.type === 'reject' ? 'destructive' : 'default'}
                            onClick={handleAction}
                        >
                            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : null}
                            {actionDialog?.type === 'approve' ? 'Approve & Notify' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
