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
import type { Member } from '../types';

interface ApproveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
    isPaymentConfirmed: boolean;
    setIsPaymentConfirmed: (confirmed: boolean) => void;
    onApprove: () => void;
}

export function ApproveDialog({
    open,
    onOpenChange,
    member,
    isPaymentConfirmed,
    setIsPaymentConfirmed,
    onApprove,
}: ApproveDialogProps) {
    const totalAdmissionFee = member.sports.reduce((sum, sport) => sum + Number(sport.admission_fee), 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approve Member Registration</DialogTitle>
                    <DialogDescription>
                        This will activate the member account, generate payment schedules, and create a user login.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="p-4 rounded-lg bg-muted text-sm space-y-2">
                        <div className="flex justify-between font-medium">
                            <span>Total Admission Fee:</span>
                            <span>Rs. {totalAdmissionFee.toFixed(2)}</span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Please collect this amount before approving the member.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="confirmPayment"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={isPaymentConfirmed}
                            onChange={(e) => setIsPaymentConfirmed(e.target.checked)}
                        />
                        <Label htmlFor="confirmPayment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I confirm that the admission fee has been paid
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onApprove} disabled={!isPaymentConfirmed}>
                        Confirm Approval
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
