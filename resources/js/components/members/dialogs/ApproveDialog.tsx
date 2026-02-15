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
    onApprove: () => void;
}

export function ApproveDialog({
    open,
    onOpenChange,
    member,
    onApprove,
}: ApproveDialogProps) {
    const totalAdmissionFee = member.programs.reduce((sum, program) => sum + Number(program.admission_fee), 0);
    const totalMonthlyFee = member.programs.reduce((sum, program) => sum + Number(program.monthly_fee), 0);
    const totalDue = totalAdmissionFee + totalMonthlyFee;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Approve Member Registration</DialogTitle>
                    <DialogDescription>
                        This will activate the member account, generate sport-specific references, and create a pending payment.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm space-y-3">
                        <div className="font-semibold text-amber-900">Pending Payment Will Be Created:</div>
                        <div className="space-y-2 text-amber-800">
                            <div className="flex justify-between">
                                <span>Admission Fees:</span>
                                <span className="font-mono">Rs. {totalAdmissionFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>First Month Fees:</span>
                                <span className="font-mono">Rs. {totalMonthlyFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t border-amber-300 pt-2">
                                <span>Total Due:</span>
                                <span className="font-mono">Rs. {totalDue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                        <p className="text-blue-900 font-medium mb-2">What happens on approval:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800 text-xs">
                            <li>Member account will be activated</li>
                            <li>Program-specific references will be generated</li>
                            <li>A pending payment will be created</li>
                            <li>Member can be marked as paid later from their profile</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onApprove}>
                        Confirm Approval
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
