import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ChevronLeft,
    Settings,
    Users,
    GraduationCap,
    CalendarDays,
    MapPin,
    DollarSign,
    Clock,
    UserPlus,
    X,
    ChevronRight,
    Layers,
    Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

const DAY_SHORT: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

interface AssignedMember {
    id: string; // MemberProgramClass id
    member: { id: string; full_name: string; calling_name: string | null; member_number: string; contact_number: string | null };
    status: string;
}

interface ProgramClassItem {
    id: string;
    label: string | null;
    day_of_week: string;
    start_time: string;
    end_time: string;
    coach_id: string | null;
    capacity: number | null;
    recurrence: string;
    valid_from: string | null;
    valid_to: string | null;
    is_active: boolean;
    coach: { id: string; name: string; specialization: string | null } | null;
    assigned_members: AssignedMember[];
}

interface SubClass {
    label: string;
    slots: ProgramClassItem[];
    memberCount: number;
    coach: { id: string; name: string; specialization: string | null } | null;
}

interface Program {
    id: string;
    name: string;
    short_code: string | null;
    description: string | null;
    admission_fee: string | number;
    monthly_fee: string | number;
    capacity: number | null;
    location: { id: string; name: string } | null;
    schedule: Record<string, { start: string; end: string }> | null;
    schedule_type: string;
    weekly_limit: number | null;
    is_active: boolean;
    classes: ProgramClassItem[];
    coaches: { id: string; name: string; specialization: string | null; contact_number: string | null }[];
}

interface EnrolledMember {
    id: string;
    full_name: string;
    calling_name: string | null;
    member_number: string;
}

interface Coach {
    id: string;
    name: string;
    specialization: string | null;
}

interface Stats {
    members_count: number;
    coaches_count: number;
    classes_count: number;
    active_classes_count: number;
}

interface Props {
    program: Program;
    enrolledMembers: EnrolledMember[];
    allCoaches: Coach[];
    stats: Stats;
}

function formatTime(time: string) {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
}

/** Group program_classes by label into SubClass objects */
function groupByLabel(classes: ProgramClassItem[]): SubClass[] {
    const map = new Map<string, ProgramClassItem[]>();
    for (const cls of classes) {
        const key = cls.label ?? 'General';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(cls);
    }
    const result: SubClass[] = [];
    map.forEach((slots, label) => {
        // Prefer the coach of the first active slot
        const firstWithCoach = slots.find(s => s.coach);
        const allMembers = slots.flatMap(s => s.assigned_members);
        // De-dupe members by member.id
        const uniqueMembers = allMembers.filter(
            (m, i, arr) => arr.findIndex(x => x.member.id === m.member.id) === i,
        );
        result.push({
            label,
            slots,
            memberCount: uniqueMembers.length,
            coach: firstWithCoach?.coach ?? null,
        });
    });
    return result;
}

export default function ShowProgram({ program, enrolledMembers, allCoaches, stats }: Props) {
    const { confirm, ConfirmDialog } = useConfirm();
    const [selectedSubClass, setSelectedSubClass] = useState<SubClass | null>(null);

    const subClasses = groupByLabel(program.classes);

    // Members already in the selected sub-class (any slot)
    const assignedMemberIds = selectedSubClass
        ? new Set(
            selectedSubClass.slots
                .flatMap(s => s.assigned_members)
                .map(m => m.member.id),
        )
        : new Set<string>();

    // Enrolled members NOT yet in this sub-class
    const availableToAssign = enrolledMembers.filter(m => !assignedMemberIds.has(m.id));

    const handleAssignMember = (memberId: string, slot: ProgramClassItem) => {
        router.post(
            `/admin/class-assignments/assign`,
            { member_id: memberId, program_class_id: slot.id },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Member assigned successfully'),
                onError: () => toast.error('Failed to assign member'),
            },
        );
    };

    const handleRemoveMember = async (assignment: AssignedMember, slot: ProgramClassItem) => {
        const confirmed = await confirm({
            title: 'Remove Member',
            description: `Remove ${assignment.member.full_name} from this class slot?`,
            confirmText: 'Remove',
            cancelText: 'Cancel',
            variant: 'destructive',
        });
        if (!confirmed) return;
        router.post(
            `/admin/class-assignments/unassign`,
            { member_id: assignment.member.id, program_class_id: slot.id },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Member removed successfully'),
                onError: () => toast.error('Failed to remove member'),
            },
        );
    };

    const handleChangeCoach = (coachId: string, slot: ProgramClassItem) => {
        router.put(
            `/admin/programs/${program.id}/classes/${slot.id}`,
            {
                label: slot.label,
                day_of_week: slot.day_of_week,
                start_time: slot.start_time,
                end_time: slot.end_time,
                coach_id: coachId === '_none' ? null : coachId,
                capacity: slot.capacity,
                recurrence: slot.recurrence,
                valid_from: slot.valid_from,
                valid_to: slot.valid_to,
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Coach updated'),
                onError: () => toast.error('Failed to update coach'),
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Programs', href: '/admin/programs' },
                { title: program.name, href: `/admin/programs/${program.id}` },
            ]}
        >
            <Head title={program.name} />
            <ConfirmDialog />

            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/admin/programs">
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
                                    {program.short_code && (
                                        <Badge variant="secondary" className="text-xs font-mono">{program.short_code}</Badge>
                                    )}
                                    <Badge variant={program.is_active ? 'default' : 'destructive'}>
                                        {program.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                        {program.schedule_type === 'class_based' ? 'Class Based' : 'Practice Based'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                                    {program.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {program.location.name}
                                        </span>
                                    )}
                                    {program.description && (
                                        <span className="line-clamp-1 max-w-md">{program.description}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/programs/${program.id}/edit`}>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Link>
                        </Button>
                    </div>

                    {/* ── Stats Row ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.members_count}</p>
                                    <p className="text-xs text-muted-foreground">Members</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.coaches_count}</p>
                                    <p className="text-xs text-muted-foreground">Coaches</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{subClasses.length}</p>
                                    <p className="text-xs text-muted-foreground">Sub-classes</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                    <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">Rs. {Number(program.monthly_fee).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Monthly Fee</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Main Content ── */}
                    {program.schedule_type === 'class_based' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Sub-class list */}
                            <div className="space-y-3 lg:col-span-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <Layers className="h-4 w-4" />
                                        Sub-classes
                                    </h2>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/programs/${program.id}/edit`}>
                                            Manage
                                        </Link>
                                    </Button>
                                </div>

                                {subClasses.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-8 text-center">
                                            <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">No sub-classes yet.</p>
                                            <Button size="sm" className="mt-3" asChild>
                                                <Link href={`/admin/programs/${program.id}/edit`}>Add Classes</Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    subClasses.map((sc) => (
                                        <Card
                                            key={sc.label}
                                            className={`cursor-pointer transition-all hover:shadow-md border-2 ${selectedSubClass?.label === sc.label
                                                    ? 'border-primary shadow-md'
                                                    : 'border-transparent hover:border-primary/30'
                                                }`}
                                            onClick={() =>
                                                setSelectedSubClass(selectedSubClass?.label === sc.label ? null : sc)
                                            }
                                        >
                                            <CardContent className="py-4 px-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">{sc.label}</p>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                                            {sc.coach && (
                                                                <span className="flex items-center gap-1">
                                                                    <GraduationCap className="h-3 w-3" />
                                                                    {sc.coach.name}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {sc.memberCount} members
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <CalendarDays className="h-3 w-3" />
                                                                {sc.slots.length} slot{sc.slots.length !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        {/* Slot day/time badges */}
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {sc.slots.slice(0, 3).map(slot => (
                                                                <Badge key={slot.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                    {DAY_SHORT[slot.day_of_week]} {formatTime(slot.start_time)}
                                                                </Badge>
                                                            ))}
                                                            {sc.slots.length > 3 && (
                                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                    +{sc.slots.length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${selectedSubClass?.label === sc.label ? 'rotate-90' : ''}`} />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {/* Sub-class Detail Panel */}
                            <div className="lg:col-span-2">
                                {selectedSubClass ? (
                                    <SubClassDetail
                                        subClass={selectedSubClass}
                                        programId={program.id}
                                        availableToAssign={availableToAssign}
                                        allCoaches={allCoaches}
                                        onAssignMember={handleAssignMember}
                                        onRemoveMember={handleRemoveMember}
                                        onChangeCoach={handleChangeCoach}
                                    />
                                ) : (
                                    <Card className="h-full">
                                        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                                            <Activity className="h-10 w-10 text-muted-foreground mb-3" />
                                            <p className="font-medium">Select a sub-class</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Click a sub-class on the left to view its members and details.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Practice-based program view */
                        <PracticeView program={program} />
                    )}

                    {/* Program-level Coaches */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <GraduationCap className="h-4 w-4" />
                                Program Coaches
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {program.coaches.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No coaches assigned to this program.</p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {program.coaches.map(coach => (
                                        <div key={coach.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                {coach.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{coach.name}</p>
                                                {coach.specialization && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{coach.specialization}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}

/* ─────────────────────────────────────────────
   Sub-class Detail Panel
───────────────────────────────────────────── */
interface SubClassDetailProps {
    subClass: SubClass;
    programId: string;
    availableToAssign: EnrolledMember[];
    allCoaches: Coach[];
    onAssignMember: (memberId: string, slot: ProgramClassItem) => void;
    onRemoveMember: (assignment: AssignedMember, slot: ProgramClassItem) => void;
    onChangeCoach: (coachId: string, slot: ProgramClassItem) => void;
}

function SubClassDetail({
    subClass,
    availableToAssign,
    allCoaches,
    onAssignMember,
    onRemoveMember,
    onChangeCoach,
}: SubClassDetailProps) {
    const [activeSlotId, setActiveSlotId] = useState<string>(subClass.slots[0]?.id ?? '');
    const activeSlot = subClass.slots.find(s => s.id === activeSlotId) ?? subClass.slots[0];

    // De-duped member list across all slots for this sub-class
    const allAssigned: { member: AssignedMember['member']; slots: ProgramClassItem[] }[] = [];
    const seen = new Set<string>();
    for (const slot of subClass.slots) {
        for (const asgn of slot.assigned_members) {
            if (!seen.has(asgn.member.id)) {
                seen.add(asgn.member.id);
                allAssigned.push({ member: asgn.member, slots: [slot] });
            } else {
                const existing = allAssigned.find(a => a.member.id === asgn.member.id);
                existing?.slots.push(slot);
            }
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{subClass.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Slot tabs if multiple */}
                    {subClass.slots.length > 1 && (
                        <div className="flex flex-wrap gap-2 pb-2 border-b">
                            {subClass.slots.map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setActiveSlotId(slot.id)}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeSlotId === slot.id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'hover:bg-muted border-muted-foreground/30'
                                        }`}
                                >
                                    {DAY_SHORT[slot.day_of_week]} {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeSlot && (
                        <>
                            {/* Slot info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4 shrink-0" />
                                    <span>{DAY_SHORT[activeSlot.day_of_week]} · {formatTime(activeSlot.start_time)} – {formatTime(activeSlot.end_time)}</span>
                                </div>
                                {activeSlot.capacity && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4 shrink-0" />
                                        <span>Capacity: {activeSlot.capacity}</span>
                                    </div>
                                )}
                            </div>

                            {/* Coach */}
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Coach</p>
                                <Select
                                    value={activeSlot.coach_id ?? '_none'}
                                    onValueChange={(val) => onChangeCoach(val, activeSlot)}
                                >
                                    <SelectTrigger className="w-[240px]">
                                        <SelectValue placeholder="Assign a coach" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_none">No Coach</SelectItem>
                                        {allCoaches.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name} {c.specialization ? `(${c.specialization})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Members of this slot */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Members ({activeSlot.assigned_members.length}{activeSlot.capacity ? `/${activeSlot.capacity}` : ''})
                                    </p>
                                    {/* Add member dropdown */}
                                    {availableToAssign.length > 0 && (
                                        <Select
                                            value=""
                                            onValueChange={(val) => val && onAssignMember(val, activeSlot)}
                                        >
                                            <SelectTrigger className="w-[180px] h-7 text-xs">
                                                <UserPlus className="h-3 w-3 mr-1" />
                                                <SelectValue placeholder="Add member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableToAssign.map(m => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {m.calling_name || m.full_name} ({m.member_number})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {activeSlot.assigned_members.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No members assigned to this slot.</p>
                                ) : (
                                    <div className="divide-y rounded-lg border overflow-hidden">
                                        {activeSlot.assigned_members.map(asgn => (
                                            <div key={asgn.id} className="flex items-center justify-between px-3 py-2 bg-card hover:bg-muted/40 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                                        {(asgn.member.calling_name || asgn.member.full_name).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium leading-none">
                                                            {asgn.member.calling_name || asgn.member.full_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{asgn.member.member_number}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onRemoveMember(asgn, activeSlot)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* All members across sub-class */}
            {subClass.slots.length > 1 && allAssigned.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-muted-foreground">All Members in "{subClass.label}" ({allAssigned.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {allAssigned.map(({ member }) => (
                                <Badge key={member.id} variant="secondary" className="text-xs">
                                    {member.calling_name || member.full_name}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Practice-based View
───────────────────────────────────────────── */
function PracticeView({ program }: { program: Program }) {
    const schedule = program.schedule as Record<string, { start: string; end: string }> | null;
    const days = schedule ? Object.keys(schedule) : [];
    const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedDays = days.sort((a, b) => orderedDays.indexOf(a) - orderedDays.indexOf(b));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="h-4 w-4" />
                    Practice Schedule
                </CardTitle>
            </CardHeader>
            <CardContent>
                {sortedDays.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No practice days configured.</p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {sortedDays.map(day => (
                            <div key={day} className="flex items-center gap-2 rounded-lg border px-4 py-3 bg-muted/20">
                                <Badge variant="secondary" className="min-w-[42px] justify-center">
                                    {DAY_SHORT[day]}
                                </Badge>
                                <span className="text-sm">
                                    {formatTime(schedule![day].start)} – {formatTime(schedule![day].end)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                {program.weekly_limit && (
                    <p className="text-xs text-muted-foreground mt-3">Weekly attendance limit: {program.weekly_limit} sessions</p>
                )}
            </CardContent>
        </Card>
    );
}
