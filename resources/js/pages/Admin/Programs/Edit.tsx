import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, Loader2, Save, Calendar, CalendarOff, Clock, Plus, Edit, Trash2, X, Users, Power, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

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
    coach?: { id: string; name: string } | null;
    cancellations?: { id: string; cancelled_date: string; reason: string | null }[];
}

interface ScheduleDay {
    start: string;
    end: string;
}

interface Program {
    id: string;
    name: string;
    description: string | null;
    admission_fee: number;
    monthly_fee: number;
    capacity: number | null;
    location_id: string | null;
    location: { id: string; name: string } | null;
    schedule: Record<string, ScheduleDay> | null;
    schedule_type: string;
    weekly_limit: number | null;
    is_active: boolean;
    classes: ProgramClassItem[];
}

interface Props {
    program: Program;
    coaches: { id: string; name: string; specialization: string }[];
    locations: { id: string; name: string }[];
}

export default function EditProgram({ program, coaches, locations }: Props) {
    const { confirm, ConfirmDialog } = useConfirm();
    const [classDialogOpen, setClassDialogOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ProgramClassItem | null>(null);

    // Cancel date state
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellingClass, setCancellingClass] = useState<ProgramClassItem | null>(null);
    const [cancelForm, setCancelForm] = useState({ cancelled_date: '', reason: '' });

    // Practice schedule period state
    const [practiceSchedulePeriod, setPracticeSchedulePeriod] = useState<{
        valid_from: string;
        valid_to: string;
        preset: string;
    }>({
        valid_from: '',
        valid_to: '',
        preset: '',
    });

    const openCancelDialog = (cls: ProgramClassItem) => {
        setCancellingClass(cls);
        setCancelForm({ cancelled_date: '', reason: '' });
        setCancelDialogOpen(true);
    };

    const handleCancelDate = () => {
        if (!cancellingClass || !cancelForm.cancelled_date) return;
        router.post(`/admin/programs/${program.id}/classes/${cancellingClass.id}/cancel-date`, cancelForm, {
            preserveScroll: true,
            onSuccess: () => {
                setCancelDialogOpen(false);
                toast.success('Class cancelled for that date');
            },
        });
    };

    const handleRestoreDate = (cls: ProgramClassItem, cancellationId: string) => {
        router.delete(`/admin/programs/${program.id}/classes/${cls.id}/cancellations/${cancellationId}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Date restored'),
        });
    };

    const { data, setData, put, processing, errors } = useForm({
        name: program.name || '',
        description: program.description || '',
        admission_fee: program.admission_fee || '',
        monthly_fee: program.monthly_fee || '',
        capacity: program.capacity || '',
        location_id: program.location_id || '',
        schedule_type: program.schedule_type || 'practice_days',
        weekly_limit: program.weekly_limit || '',
        schedule: program.schedule || {},
        is_active: Boolean(program.is_active),
        update_existing_schedules: false,
    });

    // Class form state
    const [classForm, setClassForm] = useState({
        label: '',
        days: [] as string[],
        day_of_week: '',
        start_time: '16:00',
        end_time: '18:00',
        coach_id: '',
        capacity: '',
        recurrence: 'weekly',
        valid_from: '',
        valid_to: '',
    });

    const applyPeriodPreset = (preset: string) => {
        const now = new Date();
        let from = '';
        let to = '';

        switch (preset) {
            case 'current_year':
                from = `${now.getFullYear()}-01-01`;
                to = `${now.getFullYear()}-12-31`;
                break;
            case '6_months': {
                from = now.toISOString().split('T')[0];
                const sixM = new Date(now);
                sixM.setMonth(sixM.getMonth() + 6);
                to = sixM.toISOString().split('T')[0];
                break;
            }
            case '3_months': {
                from = now.toISOString().split('T')[0];
                const threeM = new Date(now);
                threeM.setMonth(threeM.getMonth() + 3);
                to = threeM.toISOString().split('T')[0];
                break;
            }
            case '1_month': {
                from = now.toISOString().split('T')[0];
                const oneM = new Date(now);
                oneM.setMonth(oneM.getMonth() + 1);
                to = oneM.toISOString().split('T')[0];
                break;
            }
            case 'clear':
                from = '';
                to = '';
                break;
        }

        setClassForm((prev) => ({ ...prev, valid_from: from, valid_to: to }));
    };

    const applyPracticePreset = (preset: string) => {
        const now = new Date();
        let from = '';
        let to = '';

        switch (preset) {
            case 'current_year':
                from = `${now.getFullYear()}-01-01`;
                to = `${now.getFullYear()}-12-31`;
                break;
            case '6_months': {
                from = now.toISOString().split('T')[0];
                const sixM = new Date(now);
                sixM.setMonth(sixM.getMonth() + 6);
                to = sixM.toISOString().split('T')[0];
                break;
            }
            case '3_months': {
                from = now.toISOString().split('T')[0];
                const threeM = new Date(now);
                threeM.setMonth(threeM.getMonth() + 3);
                to = threeM.toISOString().split('T')[0];
                break;
            }
            case '1_month': {
                from = now.toISOString().split('T')[0];
                const oneM = new Date(now);
                oneM.setMonth(oneM.getMonth() + 1);
                to = oneM.toISOString().split('T')[0];
                break;
            }
            case 'custom':
                from = '';
                to = '';
                break;
        }

        setPracticeSchedulePeriod({ preset, valid_from: from, valid_to: to });
    };

    const handleGeneratePracticeSchedule = () => {
        if (selectedDays.length === 0) {
            toast.error('Please select at least one practice day first');
            return;
        }
        if (!practiceSchedulePeriod.valid_from || !practiceSchedulePeriod.valid_to) {
            toast.error('Please select a schedule period');
            return;
        }

        // Submit all selected days in one request (backend creates one row per day)
        router.post(
            `/admin/programs/${program.id}/classes`,
            {
                label: 'Practice',
                days: selectedDays,
                start_time: scheduleObj[selectedDays[0]]?.start || '16:00',
                end_time: scheduleObj[selectedDays[0]]?.end || '18:00',
                recurrence: 'weekly',
                valid_from: practiceSchedulePeriod.valid_from,
                valid_to: practiceSchedulePeriod.valid_to,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Practice schedule generated for ${selectedDays.length} day(s)!`);
                    setPracticeSchedulePeriod({ preset: '', valid_from: '', valid_to: '' });
                },
                onError: () => toast.error('Failed to generate schedule'),
            }
        );
    };


    const toggleDay = (day: string) => {
        const current = { ...(data.schedule as Record<string, ScheduleDay>) };
        if (current[day]) {
            delete current[day];
        } else {
            current[day] = { start: '16:00', end: '18:00' };
        }
        setData('schedule', current);
    };

    const updateDayTime = (day: string, field: 'start' | 'end', value: string) => {
        const current = { ...(data.schedule as Record<string, ScheduleDay>) };
        if (current[day]) {
            current[day] = { ...current[day], [field]: value };
            setData('schedule', current);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/programs/${program.id}`);
    };

    // Class Management
    const openAddClassDialog = () => {
        setEditingClass(null);
        setClassForm({
            label: '',
            days: [],
            day_of_week: '',
            start_time: '16:00',
            end_time: '18:00',
            coach_id: '',
            capacity: '',
            recurrence: 'weekly',
            valid_from: '',
            valid_to: '',
        });
        setClassDialogOpen(true);
    };

    const openEditClassDialog = (cls: ProgramClassItem) => {
        setEditingClass(cls);
        setClassForm({
            label: cls.label || '',
            days: [],
            day_of_week: cls.day_of_week,
            start_time: cls.start_time?.substring(0, 5) || '16:00',
            end_time: cls.end_time?.substring(0, 5) || '18:00',
            coach_id: cls.coach_id || '',
            capacity: cls.capacity?.toString() || '',
            recurrence: cls.recurrence || 'weekly',
            valid_from: cls.valid_from || '',
            valid_to: cls.valid_to || '',
        });
        setClassDialogOpen(true);
    };

    const toggleClassDay = (day: string) => {
        setClassForm((prev) => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter((d) => d !== day)
                : [...prev.days, day],
        }));
    };

    const handleClassSubmit = () => {
        if (editingClass) {
            // Update existing class
            router.put(
                `/admin/programs/${program.id}/classes/${editingClass.id}`,
                {
                    label: classForm.label || null,
                    day_of_week: classForm.day_of_week,
                    start_time: classForm.start_time,
                    end_time: classForm.end_time,
                    coach_id: classForm.coach_id || null,
                    capacity: classForm.capacity ? parseInt(classForm.capacity) : null,
                    recurrence: classForm.recurrence,
                    valid_from: classForm.valid_from || null,
                    valid_to: classForm.valid_to || null,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Class updated successfully');
                        setClassDialogOpen(false);
                    },
                    onError: () => toast.error('Failed to update class'),
                }
            );
        } else {
            // Create new class(es)
            if (classForm.days.length === 0) {
                toast.error('Please select at least one day');
                return;
            }
            router.post(
                `/admin/programs/${program.id}/classes`,
                {
                    label: classForm.label || null,
                    days: classForm.days,
                    start_time: classForm.start_time,
                    end_time: classForm.end_time,
                    coach_id: classForm.coach_id || null,
                    capacity: classForm.capacity ? parseInt(classForm.capacity) : null,
                    recurrence: classForm.recurrence,
                    valid_from: classForm.valid_from || null,
                    valid_to: classForm.valid_to || null,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`${classForm.days.length} class slot(s) created`);
                        setClassDialogOpen(false);
                    },
                    onError: () => toast.error('Failed to create class'),
                }
            );
        }
    };

    const handleDeleteClass = async (cls: ProgramClassItem) => {
        const confirmed = await confirm({
            title: 'Delete Class Slot',
            description: `Delete "${cls.label || cls.day_of_week} ${cls.start_time?.substring(0, 5)}-${cls.end_time?.substring(0, 5)}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'destructive',
        });

        if (confirmed) {
            router.delete(`/admin/programs/${program.id}/classes/${cls.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Class slot deleted'),
                onError: () => toast.error('Failed to delete class'),
            });
        }
    };

    const scheduleObj = data.schedule as Record<string, ScheduleDay>;
    const selectedDays = Object.keys(scheduleObj);

    const formatTime = (time: string) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Programs', href: '/admin/programs' },
                { title: 'Edit Program', href: `/admin/programs/${program.id}/edit` },
            ]}
        >
            <Head title={`Edit ${program.name}`} />
            <ConfirmDialog />

            <div className="py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/programs">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Edit Program</h2>
                            <p className="text-muted-foreground">
                                Update fees and details for {program.name}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Details Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Program Details</CardTitle>
                                    <CardDescription>
                                        Update the information for this program.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Program Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Swimming"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of the program..."
                                            rows={3}
                                        />
                                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="admission_fee">Admission Fee (Rs.) <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="admission_fee"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.admission_fee}
                                                onChange={(e) => setData('admission_fee', e.target.value)}
                                                placeholder="0.00"
                                                className={errors.admission_fee ? 'border-red-500' : ''}
                                            />
                                            {errors.admission_fee && <p className="text-sm text-red-500">{errors.admission_fee}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="monthly_fee">Monthly Fee (Rs.) <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="monthly_fee"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.monthly_fee}
                                                onChange={(e) => setData('monthly_fee', e.target.value)}
                                                placeholder="0.00"
                                                className={errors.monthly_fee ? 'border-red-500' : ''}
                                            />
                                            {errors.monthly_fee && <p className="text-sm text-red-500">{errors.monthly_fee}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Capacity (Optional)</Label>
                                            <Input
                                                id="capacity"
                                                type="number"
                                                min="1"
                                                value={data.capacity}
                                                onChange={(e) => setData('capacity', e.target.value)}
                                                placeholder="Max members"
                                                className={errors.capacity ? 'border-red-500' : ''}
                                            />
                                            <p className="text-xs text-muted-foreground">Leave blank for unlimited.</p>
                                            {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location_id">Location / Venue</Label>
                                            <Select
                                                value={data.location_id}
                                                onValueChange={(val) => setData('location_id', val)}
                                            >
                                                <SelectTrigger id="location_id" className={errors.location_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map((loc) => (
                                                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">Manage locations from Admin → Locations.</p>
                                            {errors.location_id && <p className="text-sm text-red-500">{errors.location_id}</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 border rounded-md p-4 bg-muted/20">
                                        <div className="flex items-start space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', !!checked)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="is_active" className="text-sm font-medium leading-none">
                                                    Active Status
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    If unchecked, this sport will be hidden from new registrations.
                                                </p>
                                            </div>
                                        </div>

                                        {Number(data.monthly_fee) !== Number(program.monthly_fee) && (
                                            <div className="flex items-start space-x-2 pt-2 border-t border-dashed border-gray-300">
                                                <Checkbox
                                                    id="update_existing_schedules"
                                                    checked={data.update_existing_schedules}
                                                    onCheckedChange={(checked) => setData('update_existing_schedules', !!checked)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label htmlFor="update_existing_schedules" className="text-sm font-medium leading-none text-amber-600">
                                                        Update Future Payments for Existing Members?
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Check this to apply the new fee (Rs. {data.monthly_fee}) to all pending future bills.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Schedule Configuration Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Schedule Configuration
                                    </CardTitle>
                                    <CardDescription>
                                        Configure the schedule type and attendance limits.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="schedule_type">Schedule Type <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={data.schedule_type}
                                                onValueChange={(val) => setData('schedule_type', val)}
                                            >
                                                <SelectTrigger id="schedule_type">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="practice_days">Practice Days</SelectItem>
                                                    <SelectItem value="class_based">Class-Based</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                {data.schedule_type === 'practice_days'
                                                    ? 'Members attend on fixed practice days.'
                                                    : 'Members are assigned to specific class time slots.'}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="weekly_limit">Weekly Attendance Limit</Label>
                                            <Input
                                                id="weekly_limit"
                                                type="number"
                                                min="1"
                                                max="7"
                                                value={data.weekly_limit}
                                                onChange={(e) => setData('weekly_limit', e.target.value)}
                                                placeholder="e.g. 2 for Swimming, 3 for Cricket"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Max days per week a member can attend.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Practice Days Schedule */}
                                    {data.schedule_type === 'practice_days' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <div>
                                                <Label className="text-base font-medium">Practice Days & Times</Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Click a day to toggle it on/off, then set times.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <Button
                                                        key={day}
                                                        type="button"
                                                        variant={scheduleObj[day] ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => toggleDay(day)}
                                                        className="min-w-[60px]"
                                                    >
                                                        {DAY_SHORT[day]}
                                                    </Button>
                                                ))}
                                            </div>

                                            {selectedDays.length > 0 && (
                                                <div className="space-y-3">
                                                    {DAYS_OF_WEEK.filter((d) => scheduleObj[d]).map((day) => (
                                                        <div key={day} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                                            <Badge variant="secondary" className="min-w-[50px] justify-center">
                                                                {DAY_SHORT[day]}
                                                            </Badge>
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                                                <Input
                                                                    type="time"
                                                                    value={scheduleObj[day]?.start || ''}
                                                                    onChange={(e) => updateDayTime(day, 'start', e.target.value)}
                                                                    className="w-auto"
                                                                />
                                                                <span className="text-muted-foreground">to</span>
                                                                <Input
                                                                    type="time"
                                                                    value={scheduleObj[day]?.end || ''}
                                                                    onChange={(e) => updateDayTime(day, 'end', e.target.value)}
                                                                    className="w-auto"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                                                onClick={() => toggleDay(day)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {selectedDays.length === 0 && (
                                                <div className="rounded-lg border border-dashed p-6 text-center">
                                                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Click on days above to set practice times
                                                    </p>
                                                </div>
                                            )}

                                            {/* ── Schedule Period Generator ── */}
                                            {selectedDays.length > 0 && (
                                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-primary" />
                                                        <Label className="text-sm font-semibold text-primary">Generate Practice Schedule</Label>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Select a period to auto-add these practice days to the schedule table (same as Class-Based slots).
                                                    </p>

                                                    {/* Preset Buttons */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            { label: 'Current Year', value: 'current_year' },
                                                            { label: '6 Months', value: '6_months' },
                                                            { label: '3 Months', value: '3_months' },
                                                            { label: '1 Month', value: '1_month' },
                                                            { label: 'Custom', value: 'custom' },
                                                        ].map((preset) => (
                                                            <Button
                                                                key={preset.value}
                                                                type="button"
                                                                size="sm"
                                                                variant={practiceSchedulePeriod.preset === preset.value ? 'default' : 'outline'}
                                                                onClick={() => applyPracticePreset(preset.value)}
                                                            >
                                                                {preset.label}
                                                            </Button>
                                                        ))}
                                                    </div>

                                                    {/* Date Range inputs */}
                                                    {practiceSchedulePeriod.preset && (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs text-muted-foreground">From</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={practiceSchedulePeriod.valid_from}
                                                                    onChange={(e) =>
                                                                        setPracticeSchedulePeriod((p) => ({
                                                                            ...p,
                                                                            valid_from: e.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs text-muted-foreground">To</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={practiceSchedulePeriod.valid_to}
                                                                    onChange={(e) =>
                                                                        setPracticeSchedulePeriod((p) => ({
                                                                            ...p,
                                                                            valid_to: e.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Generate button & summary */}
                                                    {practiceSchedulePeriod.valid_from && practiceSchedulePeriod.valid_to && (
                                                        <div className="flex items-start justify-between gap-4 pt-1 border-t border-primary/20">
                                                            <p className="text-xs text-muted-foreground">
                                                                Will add <strong>{selectedDays.length}</strong> day slot(s):{' '}
                                                                <strong>{selectedDays.join(', ')}</strong>
                                                                <br />
                                                                Period: <strong>{practiceSchedulePeriod.valid_from}</strong> →{' '}
                                                                <strong>{practiceSchedulePeriod.valid_to}</strong>
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={handleGeneratePracticeSchedule}
                                                                className="shrink-0"
                                                            >
                                                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                                Generate
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Submit Program Details */}
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Program
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Class Management Card (only for class_based programs) */}
                        {data.schedule_type === 'class_based' && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Clock className="h-5 w-5" />
                                                Class Time Slots
                                            </CardTitle>
                                            <CardDescription>
                                                Manage class sessions with coaches and capacity.
                                            </CardDescription>
                                        </div>
                                        <Button size="sm" onClick={openAddClassDialog}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Class
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {program.classes && program.classes.length > 0 ? (
                                        <div className="space-y-3">
                                            {program.classes.map((cls) => (
                                                <div key={cls.id} className={`rounded-lg border p-4 ${cls.is_active ? 'bg-muted/20' : 'bg-muted/10 opacity-60'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <Badge variant="secondary" className="min-w-[50px] justify-center shrink-0">
                                                                {DAY_SHORT[cls.day_of_week] || cls.day_of_week}
                                                            </Badge>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className={`font-medium text-sm ${!cls.is_active ? 'line-through' : ''}`}>
                                                                        {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                                                                    </span>
                                                                    {cls.label && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {cls.label}
                                                                        </Badge>
                                                                    )}
                                                                    {!cls.is_active && (
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            Inactive
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                                                    {cls.coach && (
                                                                        <span>Coach: {cls.coach.name}</span>
                                                                    )}
                                                                    {cls.capacity && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Users className="h-3 w-3" />
                                                                            Max {cls.capacity}
                                                                        </span>
                                                                    )}
                                                                    {(cls.valid_from || cls.valid_to) && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            {cls.valid_from || '...'} → {cls.valid_to || '...'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Cancel a specific date"
                                                                className="text-amber-600 hover:text-amber-700"
                                                                onClick={() => openCancelDialog(cls)}
                                                            >
                                                                <CalendarOff className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title={cls.is_active ? 'Deactivate class' : 'Activate class'}
                                                                className={cls.is_active ? 'text-green-600 hover:text-red-600' : 'text-red-500 hover:text-green-600'}
                                                                onClick={() => {
                                                                    router.post(`/admin/programs/${program.id}/classes/${cls.id}/toggle`, {}, {
                                                                        preserveScroll: true,
                                                                        onSuccess: () => toast.success(cls.is_active ? 'Class deactivated' : 'Class activated'),
                                                                    });
                                                                }}
                                                            >
                                                                <Power className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openEditClassDialog(cls)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDeleteClass(cls)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {/* Cancelled dates */}
                                                    {cls.cancellations && cls.cancellations.length > 0 && (
                                                        <div className="mt-2 ml-[62px] flex flex-wrap gap-1.5">
                                                            {cls.cancellations.map((c) => (
                                                                <Badge
                                                                    key={c.id}
                                                                    variant="outline"
                                                                    className="text-[11px] text-destructive border-destructive/30 gap-1"
                                                                >
                                                                    <CalendarOff className="h-3 w-3" />
                                                                    {new Date(c.cancelled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                    {c.reason && ` — ${c.reason}`}
                                                                    <button
                                                                        className="ml-1 hover:text-primary"
                                                                        title="Restore this date"
                                                                        onClick={() => handleRestoreDate(cls, c.id)}
                                                                    >
                                                                        <RotateCcw className="h-3 w-3" />
                                                                    </button>
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed p-8 text-center">
                                            <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                            <p className="font-medium">No classes yet</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Add class time slots with coaches and capacity limits.
                                            </p>
                                            <Button size="sm" className="mt-4" onClick={openAddClassDialog}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add First Class
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div >

            {/* Add/Edit Class Dialog */}
            < Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen} >
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            {editingClass ? 'Edit Class Slot' : 'Add Class Slot'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingClass
                                ? 'Update this class time slot.'
                                : 'Select days and set time, coach, and capacity. One row per day will be created.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 overflow-y-auto flex-1 pr-1">
                        <div className="space-y-2">
                            <Label>Label (Optional)</Label>
                            <Input
                                value={classForm.label}
                                onChange={(e) => setClassForm({ ...classForm, label: e.target.value })}
                                placeholder="e.g. Learn to Swim - Batch A"
                            />
                        </div>

                        {/* Day selection */}
                        {editingClass ? (
                            <div className="space-y-2">
                                <Label>Day</Label>
                                <Select
                                    value={classForm.day_of_week}
                                    onValueChange={(val) => setClassForm({ ...classForm, day_of_week: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS_OF_WEEK.map((day) => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Days <span className="text-red-500">*</span></Label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <Button
                                            key={day}
                                            type="button"
                                            variant={classForm.days.includes(day) ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => toggleClassDay(day)}
                                            className="min-w-[60px]"
                                        >
                                            {DAY_SHORT[day]}
                                        </Button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Select multiple days — one class slot per day will be created.
                                </p>
                            </div>
                        )}

                        {/* Time */}
                        <div className="grid gap-4 grid-cols-2">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={classForm.start_time}
                                    onChange={(e) => setClassForm({ ...classForm, start_time: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={classForm.end_time}
                                    onChange={(e) => setClassForm({ ...classForm, end_time: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Coach */}
                        <div className="space-y-2">
                            <Label>Coach (Optional)</Label>
                            <Select
                                value={classForm.coach_id}
                                onValueChange={(val) => setClassForm({ ...classForm, coach_id: val === '_none' ? '' : val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a coach" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">No Coach</SelectItem>
                                    {coaches.map((coach) => (
                                        <SelectItem key={coach.id} value={coach.id}>
                                            {coach.name} {coach.specialization ? `(${coach.specialization})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <Label>Max Students (Optional)</Label>
                            <Input
                                type="number"
                                min="1"
                                value={classForm.capacity}
                                onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
                                placeholder="Leave blank for unlimited"
                            />
                        </div>

                        {/* Validity Period */}
                        <div className="space-y-2">
                            <Label>Validity Period</Label>
                            <div className="flex flex-wrap gap-1.5">
                                <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => applyPeriodPreset('current_year')}>
                                    Current Year
                                </Button>
                                <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => applyPeriodPreset('6_months')}>
                                    6 Months
                                </Button>
                                <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => applyPeriodPreset('3_months')}>
                                    3 Months
                                </Button>
                                <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => applyPeriodPreset('1_month')}>
                                    1 Month
                                </Button>
                                {(classForm.valid_from || classForm.valid_to) && (
                                    <Button type="button" variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => applyPeriodPreset('clear')}>
                                        <X className="h-3 w-3 mr-1" />Clear
                                    </Button>
                                )}
                            </div>
                            <div className="grid gap-3 grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={classForm.valid_from}
                                        onChange={(e) => setClassForm({ ...classForm, valid_from: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">End Date</Label>
                                    <Input
                                        type="date"
                                        value={classForm.valid_to}
                                        onChange={(e) => setClassForm({ ...classForm, valid_to: e.target.value })}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Leave blank if the class runs indefinitely.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClassDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleClassSubmit}>
                            {editingClass ? 'Update Class' : 'Add Class'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Cancel Date Dialog */}
            < Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} >
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarOff className="h-5 w-5" />
                            Cancel Specific Date
                        </DialogTitle>
                        <DialogDescription>
                            Cancel this class for a specific date. The class will be marked as cancelled only for that day.
                        </DialogDescription>
                    </DialogHeader>
                    {cancellingClass && (
                        <div className="py-2">
                            <Badge variant="secondary">
                                {cancellingClass.day_of_week} {formatTime(cancellingClass.start_time)} - {formatTime(cancellingClass.end_time)}
                            </Badge>
                        </div>
                    )}
                    <div className="grid gap-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Date to Cancel *</Label>
                            <Input
                                type="date"
                                value={cancelForm.cancelled_date}
                                onChange={(e) => setCancelForm({ ...cancelForm, cancelled_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Reason (Optional)</Label>
                            <Input
                                value={cancelForm.reason}
                                onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                                placeholder="e.g. Coach unavailable, Weather"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleCancelDate} disabled={!cancelForm.cancelled_date}>
                            Cancel This Date
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </AppLayout >
    );
}
