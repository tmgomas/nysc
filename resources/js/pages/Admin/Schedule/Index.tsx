import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar,
    Clock,
    Users,
    ChevronLeft,
    ChevronRight,
    Info,
    Plus,
    Trash2,
    PartyPopper,
    CalendarOff,
    MapPin,
    BookOpen,
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ProgramClass {
    id: string;
    label: string | null;
    day_of_week: string;
    start_time: string;
    end_time: string;
    capacity: number | null;
    valid_from: string | null;
    valid_to: string | null;
    coach?: { id: string; name: string } | null;
}

interface Program {
    id: string;
    name: string;
    schedule_type: string;
    schedule: Record<string, { start: string; end: string }> | null;
    weekly_limit: number | null;
    location_id: string | null;
    location?: { id: string; name: string } | null;
    classes: ProgramClass[];
}

interface Holiday {
    id: string;
    name: string;
    date: string;
    is_recurring: boolean;
}

interface SpecialBooking {
    id: string;
    location_id: string;
    title: string;
    start_date: string;
    end_date: string;
    start_time: string | null;
    end_time: string | null;
    reason: string | null;
    cancels_classes: boolean;
    location?: { id: string; name: string } | null;
}

interface LocationItem {
    id: string;
    name: string;
}

interface Props {
    programs: Program[];
    holidays: Holiday[];
    specialBookings: SpecialBooking[];
    locations: LocationItem[];
}

const SPORT_COLORS: Record<string, string> = {};
const COLOR_PALETTE = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6',
];

function getProgramColor(sportId: string, index: number): string {
    if (!SPORT_COLORS[sportId]) {
        SPORT_COLORS[sportId] = COLOR_PALETTE[index % COLOR_PALETTE.length];
    }
    return SPORT_COLORS[sportId];
}

function dayToNumber(day: string): number {
    const map: Record<string, number> = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6,
    };
    return map[day] ?? 1;
}

export default function ScheduleIndex({ programs, holidays, specialBookings, locations }: Props) {
    const calendarRef = useRef<InstanceType<typeof FullCalendar>>(null);
    const [selectedProgram, setSelectedProgram] = useState<string>('all');
    const [eventDetail, setEventDetail] = useState<any>(null);
    const [currentTitle, setCurrentTitle] = useState('');

    // Re-fetch events when program filter changes
    useEffect(() => {
        calendarRef.current?.getApi().refetchEvents();
    }, [selectedProgram]);

    // Cancel date from calendar
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const handleCancelFromCalendar = () => {
        if (!eventDetail?.program_id || !eventDetail?.class_id || !eventDetail?.clicked_date) return;
        setCancelling(true);
        router.post(`/admin/programs/${eventDetail.program_id}/classes/${eventDetail.class_id}/cancel-date`, {
            cancelled_date: eventDetail.clicked_date,
            reason: cancelReason || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Class cancelled for that date');
                setEventDetail(null);
                setCancelReason('');
                setCancelling(false);
                // Refresh calendar to show cancellation immediately
                calendarRef.current?.getApi().refetchEvents();
            },
            onError: () => setCancelling(false),
        });
    };

    // Panel visibility
    const [activePanel, setActivePanel] = useState<'none' | 'holidays' | 'bookings'>('none');

    // Holiday form
    const [holidayForm, setHolidayForm] = useState({ name: '', date: '', is_recurring: false });
    // Special Booking form
    const [bookingForm, setBookingForm] = useState({
        location_id: '', title: '', start_date: '', end_date: '',
        start_time: '', end_time: '', reason: '', cancels_classes: true,
    });

    // Build events from SERVER — handles cancellations, holidays, valid_from/valid_to
    // FullCalendar will call this each time the view date range changes
    const fetchEvents = (fetchInfo: any, successCallback: Function, failureCallback: Function) => {
        const params = new URLSearchParams({
            start: fetchInfo.startStr.split('T')[0],
            end: fetchInfo.endStr.split('T')[0],
            ...(selectedProgram !== 'all' ? { program_id: selectedProgram } : {}),
        });

        fetch(`/admin/schedule/events?${params}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch events');
                return res.json();
            })
            .then((data) => successCallback(data))
            .catch(() => failureCallback());
    };

    const handleEventClick = (info: any) => {
        const type = info.event.extendedProps?.type;
        if (type === 'holiday') return;
        // For recurring events, info.event.start is the specific occurrence date
        const clickedDate = info.event.start
            ? new Date(info.event.start).toISOString().split('T')[0]
            : null;
        setCancelReason('');
        setEventDetail({
            title: info.event.title,
            start: info.event.start,
            end: info.event.end,
            clicked_date: clickedDate,
            ...info.event.extendedProps,
        });
    };

    const navigateCalendar = (direction: 'prev' | 'next' | 'today') => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        if (direction === 'prev') api.prev();
        else if (direction === 'next') api.next();
        else api.today();
        setCurrentTitle(api.view.title);
    };

    const changeView = (view: string) => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        api.changeView(view);
        setCurrentTitle(api.view.title);
    };

    // Holiday CRUD
    const handleAddHoliday = () => {
        if (!holidayForm.name || !holidayForm.date) return;
        router.post('/admin/holidays', holidayForm, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Holiday added');
                setHolidayForm({ name: '', date: '', is_recurring: false });
            },
        });
    };

    const handleDeleteHoliday = (id: string) => {
        if (!window.confirm('Remove this holiday?')) return;
        router.delete(`/admin/holidays/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Holiday removed'),
        });
    };

    // Special Booking CRUD
    const handleAddBooking = () => {
        if (!bookingForm.location_id || !bookingForm.title || !bookingForm.start_date || !bookingForm.end_date) return;
        router.post('/admin/special-bookings', bookingForm, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Special booking created');
                setBookingForm({
                    location_id: '', title: '', start_date: '', end_date: '',
                    start_time: '', end_time: '', reason: '', cancels_classes: true,
                });
            },
        });
    };

    const handleDeleteBooking = (id: string) => {
        if (!window.confirm('Delete this special booking?')) return;
        router.delete(`/admin/special-bookings/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Booking deleted'),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Schedule', href: '/admin/schedule' },
            ]}
        >
            <Head title="Schedule Calendar" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <Calendar className="h-6 w-6" />
                                Schedule Calendar
                            </h2>
                            <p className="text-muted-foreground mt-1">
                                View all sport sessions, holidays, and special bookings
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Programs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {programs.map((program) => (
                                        <SelectItem key={program.id} value={program.id}>
                                            {program.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant={activePanel === 'holidays' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActivePanel(activePanel === 'holidays' ? 'none' : 'holidays')}
                            >
                                <PartyPopper className="mr-1.5 h-4 w-4" />
                                Holidays
                            </Button>
                            <Button
                                variant={activePanel === 'bookings' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setActivePanel(activePanel === 'bookings' ? 'none' : 'bookings')}
                            >
                                <BookOpen className="mr-1.5 h-4 w-4" />
                                Special Bookings
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/programs">Manage Programs</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Program Legend */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        {programs.map((program, index) => (
                            <Badge
                                key={program.id}
                                variant="outline"
                                className="cursor-pointer transition-all hover:scale-105"
                                style={{
                                    borderColor: getProgramColor(program.id, index),
                                    backgroundColor: selectedProgram === program.id
                                        ? getProgramColor(program.id, index) + '20'
                                        : 'transparent',
                                }}
                                onClick={() => setSelectedProgram(
                                    selectedProgram === program.id ? 'all' : program.id
                                )}
                            >
                                <span
                                    className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: getProgramColor(program.id, index) }}
                                />
                                {program.name}
                            </Badge>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                        {/* Calendar */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" onClick={() => navigateCalendar('prev')}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => navigateCalendar('today')}>
                                            Today
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => navigateCalendar('next')}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <h3 className="text-lg font-semibold ml-2">{currentTitle}</h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => changeView('timeGridWeek')}>Week</Button>
                                        <Button variant="ghost" size="sm" onClick={() => changeView('dayGridMonth')}>Month</Button>
                                        <Button variant="ghost" size="sm" onClick={() => changeView('timeGridDay')}>Day</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="fc-custom">
                                    <FullCalendar
                                        ref={calendarRef}
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        initialView="timeGridWeek"
                                        headerToolbar={false}
                                        events={fetchEvents}
                                        eventClick={handleEventClick}
                                        slotMinTime="06:00:00"
                                        slotMaxTime="22:00:00"
                                        allDaySlot={true}
                                        weekends={true}
                                        height="auto"
                                        expandRows={true}
                                        stickyHeaderDates={true}
                                        nowIndicator={true}
                                        slotLabelFormat={{
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            meridiem: 'short',
                                        }}
                                        eventTimeFormat={{
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            meridiem: 'short',
                                        }}
                                        datesSet={(info) => setCurrentTitle(info.view.title)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Side Panel */}
                        {activePanel !== 'none' && (
                            <div className="space-y-4">
                                {/* ===== HOLIDAYS PANEL ===== */}
                                {activePanel === 'holidays' && (
                                    <>
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <PartyPopper className="h-4 w-4" />
                                                    Add Holiday
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm">Holiday Name *</Label>
                                                    <Input
                                                        value={holidayForm.name}
                                                        onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                                                        placeholder="e.g. Independence Day"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm">Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={holidayForm.date}
                                                        onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="is_recurring"
                                                        checked={holidayForm.is_recurring}
                                                        onCheckedChange={(c) => setHolidayForm({ ...holidayForm, is_recurring: !!c })}
                                                    />
                                                    <Label htmlFor="is_recurring" className="text-sm">Recurring every year</Label>
                                                </div>
                                                <Button size="sm" className="w-full" onClick={handleAddHoliday} disabled={!holidayForm.name || !holidayForm.date}>
                                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                    Add Holiday
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base">Holidays ({holidays.length})</CardTitle>
                                                <CardDescription>All classes are cancelled on holidays</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {holidays.length > 0 ? (
                                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                                        {holidays.map((h) => (
                                                            <div key={h.id} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                                                                <div>
                                                                    <p className="font-medium">{h.name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                        {h.is_recurring && <Badge variant="outline" className="ml-1.5 text-[10px]">Yearly</Badge>}
                                                                    </p>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteHoliday(h.id)}>
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground text-center py-4">No holidays added yet</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </>
                                )}

                                {/* ===== SPECIAL BOOKINGS PANEL ===== */}
                                {activePanel === 'bookings' && (
                                    <>
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4" />
                                                    Add Special Booking
                                                </CardTitle>
                                                <CardDescription>Book a location for an event — optionally cancel classes</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm">Location *</Label>
                                                    <Select value={bookingForm.location_id} onValueChange={(v) => setBookingForm({ ...bookingForm, location_id: v })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select location" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {locations.map((loc) => (
                                                                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm">Event Title *</Label>
                                                    <Input
                                                        value={bookingForm.title}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                                                        placeholder="e.g. Swimming Meet"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-sm">Start Date *</Label>
                                                        <Input type="date" value={bookingForm.start_date} onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-sm">End Date *</Label>
                                                        <Input type="date" value={bookingForm.end_date} onChange={(e) => setBookingForm({ ...bookingForm, end_date: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-sm">Start Time</Label>
                                                        <Input type="time" value={bookingForm.start_time} onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-sm">End Time</Label>
                                                        <Input type="time" value={bookingForm.end_time} onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm">Reason</Label>
                                                    <Textarea
                                                        value={bookingForm.reason}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                                                        placeholder="Optional reason for the booking"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="cancels_classes"
                                                        checked={bookingForm.cancels_classes}
                                                        onCheckedChange={(c) => setBookingForm({ ...bookingForm, cancels_classes: !!c })}
                                                    />
                                                    <Label htmlFor="cancels_classes" className="text-sm">Cancel all classes at this location during booking</Label>
                                                </div>
                                                <Button size="sm" className="w-full" onClick={handleAddBooking} disabled={!bookingForm.location_id || !bookingForm.title || !bookingForm.start_date || !bookingForm.end_date}>
                                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                                    Create Booking
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base">Bookings ({specialBookings.length})</CardTitle>
                                                <CardDescription>Location reservations for events</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {specialBookings.length > 0 ? (
                                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                                        {specialBookings.map((b) => (
                                                            <div key={b.id} className="rounded-md border p-2.5 text-sm">
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <p className="font-medium">{b.title}</p>
                                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                            <MapPin className="h-3 w-3" />
                                                                            {b.location?.name || 'Unknown'}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                                            {new Date(b.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                            {b.start_date !== b.end_date && ` — ${new Date(b.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                                                            {b.start_time && ` • ${b.start_time}${b.end_time ? ` - ${b.end_time}` : ''}`}
                                                                        </p>
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteBooking(b.id)}>
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                                <div className="flex gap-1.5 mt-1.5">
                                                                    {b.cancels_classes && <Badge variant="destructive" className="text-[10px]">Cancels Classes</Badge>}
                                                                    {b.reason && <Badge variant="outline" className="text-[10px]">{b.reason}</Badge>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground text-center py-4">No special bookings</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Event Detail Dialog */}
            <Dialog open={!!eventDetail} onOpenChange={(open) => !open && setEventDetail(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            {eventDetail?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {eventDetail?.type === 'class' ? 'Class Session' : eventDetail?.type === 'booking' ? 'Special Booking' : 'Practice Session'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        {eventDetail?.start && (
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {new Date(eventDetail.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    {eventDetail?.end && ` - ${new Date(eventDetail.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                                </span>
                            </div>
                        )}
                        {eventDetail?.program_name && (
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{eventDetail.program_name}</span>
                            </div>
                        )}
                        {eventDetail?.location && (
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{eventDetail.location}</span>
                            </div>
                        )}
                        {eventDetail?.coach && (
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>Coach: {eventDetail.coach}</span>
                            </div>
                        )}
                        {eventDetail?.capacity && (
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>Max Students: {eventDetail.capacity}</span>
                            </div>
                        )}
                        {eventDetail?.reason && (
                            <p className="text-sm text-muted-foreground">Reason: {eventDetail.reason}</p>
                        )}
                        {eventDetail?.label && (
                            <Badge variant="secondary">{eventDetail.label}</Badge>
                        )}
                        {/* Valid period */}
                        {(eventDetail?.valid_from || eventDetail?.valid_to) && (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/30">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span>
                                    {eventDetail.valid_from
                                        ? `From: ${new Date(eventDetail.valid_from + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                                        : 'From: —'}
                                    {' · '}
                                    {eventDetail.valid_to
                                        ? `Until: ${new Date(eventDetail.valid_to + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                                        : 'Until: ongoing'}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Cancel date button — only for class events */}
                    {eventDetail?.type === 'class' && eventDetail?.clicked_date && (
                        <div className="border-t pt-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Cancel class on <strong>{new Date(eventDetail.clicked_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                            </p>
                            <Input
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Reason (optional)"
                            />
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={handleCancelFromCalendar}
                                disabled={cancelling}
                            >
                                <CalendarOff className="mr-1.5 h-3.5 w-3.5" />
                                {cancelling ? 'Cancelling...' : 'Cancel This Date'}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
