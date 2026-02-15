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
import { Checkbox } from '@/components/ui/checkbox';
import type { AvailableProgram } from '../types';

interface ManageProgramsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availablePrograms: AvailableProgram[];
    selectedPrograms: string[];
    onToggleProgram: (sportId: string) => void;
    onUpdate: () => void;
}

export function ManageProgramsDialog({
    open,
    onOpenChange,
    availablePrograms,
    selectedPrograms,
    onToggleProgram,
    onUpdate,
}: ManageProgramsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Programs Enrollment</DialogTitle>
                    <DialogDescription>
                        Select the programs this member should be enrolled in. Unselecting a sport will remove them from future schedules.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 gap-3">
                        {availablePrograms.map((program) => (
                            <div key={program.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id={`sport-${program.id}`}
                                    checked={selectedPrograms.includes(program.id)}
                                    onCheckedChange={() => onToggleProgram(program.id)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor={`sport-${program.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {program.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Monthly Fee: Rs. {Number(program.monthly_fee).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-amber-50 text-amber-800 border-amber-200 border rounded-md text-xs">
                        <h4 className="font-semibold mb-1">Important Note</h4>
                        Updating enrollments will recalculate future payment schedules. Past payments remain unaffected.
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onUpdate}>
                        Update Enrollments
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
