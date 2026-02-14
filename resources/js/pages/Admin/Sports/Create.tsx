import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
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
import { ChevronLeft, Loader2, Save, Calendar, Clock, Plus, X } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

interface ScheduleDay {
    start: string;
    end: string;
}

interface Props {
    coaches: { id: string; name: string; specialization: string }[];
    locations: { id: string; name: string }[];
}

export default function Create({ coaches, locations }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        description: string;
        admission_fee: string;
        monthly_fee: string;
        capacity: string;
        location_id: string;
        schedule_type: string;
        weekly_limit: string;
        schedule: Record<string, ScheduleDay>;
        is_active: boolean;
    }>({
        name: '',
        description: '',
        admission_fee: '',
        monthly_fee: '',
        capacity: '',
        location_id: '',
        schedule_type: 'practice_days',
        weekly_limit: '',
        schedule: {},
        is_active: true,
    });

    const toggleDay = (day: string) => {
        const current = { ...data.schedule };
        if (current[day]) {
            delete current[day];
        } else {
            current[day] = { start: '16:00', end: '18:00' };
        }
        setData('schedule', current);
    };

    const updateDayTime = (day: string, field: 'start' | 'end', value: string) => {
        const current = { ...data.schedule };
        if (current[day]) {
            current[day] = { ...current[day], [field]: value };
            setData('schedule', current);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/sports');
    };

    const selectedDays = Object.keys(data.schedule);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sports', href: '/admin/sports' },
                { title: 'Add New', href: '/admin/sports/create' },
            ]}
        >
            <Head title="Add Sport" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/sports">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Add New Sport</h2>
                            <p className="text-muted-foreground">
                                Create a new sport with fees, schedule, and capacity rules
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sport Details</CardTitle>
                                <CardDescription>
                                    Enter the basic information for the sport.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Sport Name <span className="text-red-500">*</span></Label>
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
                                        placeholder="Brief description of the sport..."
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

                                <div className="flex items-start space-x-2 rounded-md border p-4">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', !!checked)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor="is_active"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Active Status
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            If unchecked, this sport will be hidden from new registrations.
                                        </p>
                                    </div>
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
                                    Configure the schedule type and attendance limits for this sport.
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
                                                <SelectItem value="practice_days">
                                                    Practice Days (Cricket, Football...)
                                                </SelectItem>
                                                <SelectItem value="class_based">
                                                    Class-Based (Swimming...)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            {data.schedule_type === 'practice_days'
                                                ? 'Members attend on fixed practice days.'
                                                : 'Members are assigned to specific class time slots.'}
                                        </p>
                                        {errors.schedule_type && <p className="text-sm text-red-500">{errors.schedule_type}</p>}
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
                                            className={errors.weekly_limit ? 'border-red-500' : ''}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Max days per week a member can attend.
                                        </p>
                                        {errors.weekly_limit && <p className="text-sm text-red-500">{errors.weekly_limit}</p>}
                                    </div>
                                </div>

                                {/* Practice Days Schedule (only for practice_days type) */}
                                {data.schedule_type === 'practice_days' && (
                                    <div className="space-y-4 border-t pt-4">
                                        <div>
                                            <Label className="text-base font-medium">Practice Days & Times</Label>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Select the days and set practice times. Click a day to toggle it.
                                            </p>
                                        </div>

                                        {/* Day selector */}
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_OF_WEEK.map((day) => (
                                                <Button
                                                    key={day}
                                                    type="button"
                                                    variant={data.schedule[day] ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => toggleDay(day)}
                                                    className="min-w-[60px]"
                                                >
                                                    {DAY_SHORT[day]}
                                                </Button>
                                            ))}
                                        </div>

                                        {/* Time inputs for selected days */}
                                        {selectedDays.length > 0 && (
                                            <div className="space-y-3">
                                                {DAYS_OF_WEEK.filter((d) => data.schedule[d]).map((day) => (
                                                    <div
                                                        key={day}
                                                        className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                                                    >
                                                        <Badge variant="secondary" className="min-w-[50px] justify-center">
                                                            {DAY_SHORT[day]}
                                                        </Badge>
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                                            <Input
                                                                type="time"
                                                                value={data.schedule[day]?.start || ''}
                                                                onChange={(e) => updateDayTime(day, 'start', e.target.value)}
                                                                className="w-auto"
                                                            />
                                                            <span className="text-muted-foreground">to</span>
                                                            <Input
                                                                type="time"
                                                                value={data.schedule[day]?.end || ''}
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
                                    </div>
                                )}

                                {/* Info for class-based */}
                                {data.schedule_type === 'class_based' && (
                                    <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                                        <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Class Time Slots</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            After creating this sport, you can add class time slots with coaches and capacities from the Edit page.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Create Sport
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
