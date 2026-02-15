import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Member } from '../types';

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
    selectedScheduleId: string;
    setSelectedScheduleId: (id: string) => void;
    selectedScheduleIds?: string[];
    setSelectedScheduleIds?: (ids: string[]) => void;
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;
    selectedAmount: number;
    onSubmit: () => void;
}

export function PaymentDialog({
    open,
    onOpenChange,
    member,
    selectedScheduleId,
    setSelectedScheduleId,
    selectedScheduleIds = [],
    setSelectedScheduleIds,
    paymentMethod,
    setPaymentMethod,
    selectedAmount,
    onSubmit,
}: PaymentDialogProps) {
    const pendingPayments = member.payments.filter(p => p.status === 'pending');
    const pendingSchedules = member.payment_schedules.filter(s => s.status === 'pending');
    const uniqueMonths = Array.from(new Set(pendingSchedules.map(s => s.month_year)));

    // Check if in bulk payment mode
    const isBulkMode = selectedScheduleIds && selectedScheduleIds.length > 0;
    const selectedSchedulesData = isBulkMode
        ? pendingSchedules.filter(s => selectedScheduleIds.includes(s.id))
        : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isBulkMode ? 'Record Bulk Payment' : 'Record Monthly Payment'}
                    </DialogTitle>
                    <DialogDescription>
                        {isBulkMode
                            ? `Recording payment for ${selectedScheduleIds.length} selected schedule${selectedScheduleIds.length > 1 ? 's' : ''}.`
                            : 'Record a manual payment for a specific month.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {isBulkMode ? (
                        /* Bulk Payment Mode - Show selected schedules */
                        <div className="space-y-2">
                            <Label>Selected Payments ({selectedScheduleIds.length})</Label>
                            <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                                {selectedSchedulesData.map(schedule => (
                                    <div key={schedule.id} className="p-3 flex items-center justify-between text-sm">
                                        <div>
                                            <div className="font-medium">{schedule.month_year}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {schedule.program?.name || 'General'}
                                            </div>
                                        </div>
                                        <div className="font-mono font-semibold">
                                            Rs. {Number(schedule.amount).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Normal Mode - Show select dropdown */
                        <div className="space-y-2">
                            <Label>Select Payment</Label>
                            <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select month/sport to pay" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Pending One-off Payments */}
                                    {pendingPayments.map(payment => (
                                        <SelectItem key={payment.id} value={`PAYMENT:${payment.id}`}>
                                            {payment.type === 'admission' ? 'Admission Fee' : payment.type} - {payment.notes || 'Pending'} (Rs. {Number(payment.amount).toFixed(2)})
                                        </SelectItem>
                                    ))}

                                    {pendingPayments.length > 0 && pendingSchedules.length > 0 && (
                                        <SelectItem value="DIVIDER_1" disabled className="text-muted-foreground text-xs font-semibold bg-muted/30 pl-2">
                                            --- Monthly Schedules ---
                                        </SelectItem>
                                    )}

                                    {/* Pay All options */}
                                    {uniqueMonths.map(month => {
                                        const schedules = pendingSchedules.filter(s => s.month_year === month);
                                        if (schedules.length > 1) {
                                            const total = schedules.reduce((sum, s) => sum + Number(s.amount), 0);
                                            return (
                                                <SelectItem key={`ALL:${month}`} value={`ALL:${month}`} className="font-semibold text-primary">
                                                    {month} - All Programs (Total Rs. {total.toFixed(2)})
                                                </SelectItem>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Individual schedules */}
                                    {pendingSchedules.map(schedule => (
                                        <SelectItem key={schedule.id} value={schedule.id}>
                                            {schedule.month_year} - {schedule.program?.name || 'General'} (Rs. {Number(schedule.amount).toFixed(2)})
                                        </SelectItem>
                                    ))}

                                    {pendingSchedules.length === 0 && pendingPayments.length === 0 && (
                                        <SelectItem value="" disabled>No pending schedules</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-4 bg-muted rounded text-sm">
                        <span className="font-semibold">Total Amount:</span> Rs. {Number(selectedAmount) > 0 ? Number(selectedAmount).toFixed(2) : '0.00'}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isBulkMode ? (selectedScheduleIds?.length === 0) : !selectedScheduleId}
                    >
                        Record Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
