import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Clock,
    Users,
    Plus,
    Trash2,
    CalendarCheck,
    CalendarX,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Member, ProgramClass, MemberProgramClass, UpcomingClass } from './types';

interface Props {
    member: Member;
    availableClasses: ProgramClass[]; // all active program_classes for member's enrolled programs
    upcomingClasses?: UpcomingClass[];
}

const ABSENCE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
    makeup_selected: { label: 'Makeup Booked', color: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600' },
    no_makeup: { label: 'No Makeup', color: 'bg-gray-100 text-gray-600' },
};

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function ClassAssignmentCard({ member, availableClasses, upcomingClasses = [] }: Props) {
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [assignNotes, setAssignNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const assignedClasses: MemberProgramClass[] = member.program_classes ?? [];
    const absences = member.absences ?? [];

    // Classes not yet assigned to this member (active only)
    const unassignedClasses = availableClasses.filter(cls =>
        cls.is_active &&
        !assignedClasses.some(a => a.program_class_id === cls.id && a.status === 'active')
    );

    // Sort assigned by day of week
    const sortedAssigned = [...assignedClasses]
        .filter(a => a.status === 'active')
        .sort((a, b) =>
            DAY_ORDER.indexOf(a.program_class.day_of_week.toLowerCase()) -
            DAY_ORDER.indexOf(b.program_class.day_of_week.toLowerCase())
        );

    const handleAssign = () => {
        if (!selectedClassId) return;
        setIsSubmitting(true);

        toast.promise(
            new Promise<void>((resolve, reject) => {
                router.post(route('admin.class-assignments.assign'), {
                    member_id: member.id,
                    program_class_id: selectedClassId,
                    notes: assignNotes || null,
                }, {
                    onSuccess: () => {
                        resolve();
                        setIsAssignOpen(false);
                        setSelectedClassId('');
                        setAssignNotes('');
                        setIsSubmitting(false);
                    },
                    onError: () => { reject(); setIsSubmitting(false); },
                });
            }),
            {
                loading: 'Assigning class...',
                success: 'Member assigned to class successfully!',
                error: 'Failed to assign class',
            }
        );
    };

    const handleUnassign = (programClassId: string, className: string) => {
        if (!confirm(`Remove ${member.full_name} from "${className}"?`)) return;

        toast.promise(
            new Promise<void>((resolve, reject) => {
                router.post(route('admin.class-assignments.unassign'), {
                    member_id: member.id,
                    program_class_id: programClassId,
                }, {
                    onSuccess: () => resolve(),
                    onError: () => reject(),
                });
            }),
            {
                loading: 'Removing from class...',
                success: 'Member removed from class.',
                error: 'Failed to remove from class',
            }
        );
    };

    const selectedClass = availableClasses.find(c => c.id === selectedClassId);
    const recentAbsences = absences.slice(0, 8);

    return (
        <div className="space-y-6">
            {/* ── Assigned Classes ─────────────────────────────────── */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Assigned Class Slots
                        </CardTitle>
                        <CardDescription>
                            Specific class sessions {member.full_name} is scheduled for
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setIsAssignOpen(true)}
                        disabled={unassignedClasses.length === 0}
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Assign Class
                    </Button>
                </CardHeader>

                <CardContent>
                    {sortedAssigned.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No class slots assigned yet.</p>
                            <p className="text-xs mt-1">Click "Assign Class" to add this member to a specific batch.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sortedAssigned.map(assignment => {
                                const cls = assignment.program_class;
                                const absencesForClass = absences.filter(
                                    a => a.program_class_id === assignment.program_class_id
                                );
                                const pendingAbsences = absencesForClass.filter(a => a.status === 'pending').length;

                                return (
                                    <div
                                        key={assignment.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                    >
                                        {/* Day badge */}
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-primary uppercase">
                                                {cls.day_of_week.slice(0, 3)}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                                                {cls.program?.name}
                                                {cls.label && <span className="text-muted-foreground">— {cls.label}</span>}
                                                {pendingAbsences > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {pendingAbsences} absence pending
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                <span className="capitalize">{cls.day_of_week}</span>
                                                {cls.formatted_time && <span>· {cls.formatted_time}</span>}
                                                {cls.capacity && (
                                                    <span className="flex items-center gap-0.5">
                                                        · <Users className="h-3 w-3" /> Cap: {cls.capacity}
                                                    </span>
                                                )}
                                                {cls.coach && <span>· {cls.coach.name}</span>}
                                            </div>
                                        </div>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                            title="Remove from class"
                                            onClick={() => handleUnassign(cls.id, cls.label ?? cls.day_of_week)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Upcoming Schedule ──────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4" />
                        Upcoming Schedule
                    </CardTitle>
                    <CardDescription>Next upcoming class dates and times for this member</CardDescription>
                </CardHeader>
                <CardContent>
                    {upcomingClasses.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No upcoming classes scheduled.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {upcomingClasses.map((uClass, idx) => {
                                const classDate = new Date(uClass.date);
                                const isToday = new Date().toDateString() === classDate.toDateString();

                                return (
                                    <div
                                        key={uClass.id + '-' + idx}
                                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${isToday ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-primary uppercase leading-tight">
                                                {classDate.toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-sm font-bold text-primary leading-tight">
                                                {classDate.getDate()}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                                                {uClass.program_name}
                                                {uClass.label && <span className="text-muted-foreground">— {uClass.label}</span>}
                                                {isToday && (
                                                    <Badge variant="default" className="text-[10px] h-4 px-1">TODAY</Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                <span className="capitalize">{uClass.day_of_week}</span>
                                                {uClass.formatted_time && <span>· {uClass.formatted_time}</span>}
                                                {uClass.coach_name && <span>· {uClass.coach_name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Absence History ──────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarX className="h-4 w-4" />
                        Absence History
                    </CardTitle>
                    <CardDescription>Recent absence requests and makeup class status</CardDescription>
                </CardHeader>

                <CardContent>
                    {recentAbsences.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No absence records.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentAbsences.map(absence => {
                                const cfg = ABSENCE_STATUS_CONFIG[absence.status] ?? ABSENCE_STATUS_CONFIG.pending;
                                const isUrgent = absence.status === 'approved' &&
                                    absence.days_left !== null && (absence.days_left ?? 0) <= 2;

                                return (
                                    <div
                                        key={absence.id}
                                        className={`p-3 rounded-lg border text-sm ${isUrgent ? 'border-orange-300 bg-orange-50' : 'bg-card'}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium">
                                                        {new Date(absence.absent_date).toLocaleDateString('en-US', {
                                                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {absence.program_class?.label ?? absence.program_class?.day_of_week}
                                                    </span>
                                                </div>
                                                {absence.makeup_class && (
                                                    <div className="flex items-center gap-1 text-xs text-purple-700">
                                                        <CalendarCheck className="h-3 w-3" />
                                                        Makeup: {absence.makeup_class.label ?? absence.makeup_class.day_of_week}
                                                        {absence.makeup_date && ` · ${new Date(absence.makeup_date).toLocaleDateString()}`}
                                                    </div>
                                                )}
                                                {absence.status === 'approved' && absence.makeup_deadline && (
                                                    <div className="text-xs text-blue-600">
                                                        Select makeup by {new Date(absence.makeup_deadline).toLocaleDateString()}
                                                        {isUrgent && <span className="font-bold text-orange-600"> · Only {absence.days_left}d left!</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={`${cfg.color} text-xs shrink-0`} variant="outline">
                                                {cfg.label}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Assign Dialog ────────────────────────────────────── */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Assign to Class Slot</DialogTitle>
                        <DialogDescription>
                            Select a class slot to assign {member.full_name} to. They must be enrolled in that program first.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Class Slot</Label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {unassignedClasses.length === 0 ? (
                                        <SelectItem value="" disabled>No available slots</SelectItem>
                                    ) : (
                                        unassignedClasses
                                            .sort((a, b) =>
                                                DAY_ORDER.indexOf(a.day_of_week.toLowerCase()) -
                                                DAY_ORDER.indexOf(b.day_of_week.toLowerCase())
                                            )
                                            .map(cls => (
                                                <SelectItem key={cls.id} value={cls.id} disabled={cls.is_full ?? false}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{cls.program?.name} — {cls.label ?? cls.day_of_week}</span>
                                                        {cls.formatted_time && <span className="text-muted-foreground text-xs">({cls.formatted_time})</span>}
                                                        {cls.is_full && <span className="text-xs text-red-500 font-medium">FULL</span>}
                                                        {cls.available_spots !== undefined && !cls.is_full && (
                                                            <span className="text-xs text-muted-foreground">{cls.available_spots} spots left</span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedClass && (
                            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                                <div><span className="font-medium">Day:</span> <span className="capitalize">{selectedClass.day_of_week}</span></div>
                                {selectedClass.formatted_time && <div><span className="font-medium">Time:</span> {selectedClass.formatted_time}</div>}
                                {selectedClass.capacity && (
                                    <div>
                                        <span className="font-medium">Capacity:</span>{' '}
                                        {selectedClass.assigned_count ?? '?'}/{selectedClass.capacity}
                                        {' '}({selectedClass.available_spots ?? selectedClass.capacity} available)
                                    </div>
                                )}
                                {selectedClass.coach && <div><span className="font-medium">Coach:</span> {selectedClass.coach.name}</div>}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Textarea
                                value={assignNotes}
                                onChange={e => setAssignNotes(e.target.value)}
                                placeholder="Any notes about this assignment..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                        <Button disabled={!selectedClassId || isSubmitting} onClick={handleAssign}>
                            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                            Assign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
