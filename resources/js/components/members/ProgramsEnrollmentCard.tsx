import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Pencil, Clock, MapPin, CalendarDays, Repeat } from 'lucide-react';
import type { Member } from './types';

interface ProgramsEnrollmentCardProps {
    member: Member;
    onManageClick: () => void;
}

const DAY_ORDER: Record<string, number> = {
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
    friday: 5, saturday: 6, sunday: 7,
};

const DAY_SHORT: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
    // Also handle Title case keys that come from practice_days format
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

function formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const min = m || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}:${min} ${ampm}`;
}

interface NormalizedDay {
    day: string;
    start_time: string;
    end_time: string;
}

/**
 * Normalize both schedule formats into a unified array:
 *
 * Format 1 (class_based / array):
 *   [{day: 'monday', start_time: '16:00', end_time: '18:00'}, ...]
 *
 * Format 2 (practice_days / object):
 *   {Monday: {start: '16:00', end: '18:00'}, Wednesday: {...}}
 */
function normalizeSchedule(schedule: unknown): NormalizedDay[] {
    if (!schedule) return [];

    // Array format (class_based)
    if (Array.isArray(schedule)) {
        return schedule
            .filter((s) => s && typeof s === 'object' && s.day)
            .map((s) => ({
                day: s.day,
                start_time: s.start_time || s.start || '',
                end_time: s.end_time || s.end || '',
            }));
    }

    // Object format (practice_days) → { Monday: {start, end}, ... }
    if (typeof schedule === 'object') {
        return Object.entries(schedule as Record<string, { start?: string; end?: string }>)
            .map(([day, times]) => ({
                day,
                start_time: times?.start || '',
                end_time: times?.end || '',
            }));
    }

    return [];
}

export function ProgramsEnrollmentCard({ member, onManageClick }: ProgramsEnrollmentCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Programs Enrollment
                </CardTitle>
                <Button variant="outline" size="sm" onClick={onManageClick}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Manage
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {member.programs.length > 0 ? (
                        member.programs.map((program) => {
                            const days = normalizeSchedule(program.schedule).sort(
                                (a, b) =>
                                    (DAY_ORDER[a.day.toLowerCase()] ?? 8) -
                                    (DAY_ORDER[b.day.toLowerCase()] ?? 8),
                            );

                            return (
                                <div
                                    key={program.id}
                                    className="border rounded-lg bg-card/50 hover:bg-muted/30 transition-colors overflow-hidden"
                                >
                                    {/* Program Header */}
                                    <div className="flex items-center justify-between p-4 pb-3">
                                        <div className="space-y-0.5">
                                            <h4 className="font-semibold">{program.name}</h4>
                                            <div className="flex gap-2 text-sm text-muted-foreground">
                                                <span>Monthly: Rs. {Number(program.monthly_fee).toLocaleString()}</span>
                                                <span>•</span>
                                                <span>
                                                    Enrolled:{' '}
                                                    {new Date(program.pivot.enrolled_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                program.pivot.status === 'active' ? 'default' : 'secondary'
                                            }
                                        >
                                            {program.pivot.status.toUpperCase()}
                                        </Badge>
                                    </div>

                                    {/* Schedule Section */}
                                    {(days.length > 0 || program.location || program.schedule_type || program.weekly_limit) && (
                                        <div className="px-4 pb-4 pt-0 space-y-3 border-t bg-muted/20">
                                            {/* Location */}
                                            {program.location && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{program.location.name}</span>
                                                </div>
                                            )}

                                            {/* Schedule Type & Weekly Limit */}
                                            {(program.schedule_type || program.weekly_limit) && (
                                                <div className={`flex flex-wrap gap-3 text-sm text-muted-foreground ${!program.location ? 'pt-3' : ''}`}>
                                                    {program.schedule_type && (
                                                        <div className="flex items-center gap-1.5">
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                            <span className="capitalize">
                                                                {program.schedule_type === 'practice_days'
                                                                    ? 'Practice Days'
                                                                    : program.schedule_type === 'class_based'
                                                                        ? 'Class Based'
                                                                        : program.schedule_type.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {program.weekly_limit && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Repeat className="h-3.5 w-3.5" />
                                                            <span>{program.weekly_limit}x per week</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Class Days & Times */}
                                            {days.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {program.schedule_type === 'practice_days' ? 'Practice Schedule' : 'Class Schedule'}
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        {days.map((day, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-md px-2 py-1.5"
                                                            >
                                                                <span className="text-xs font-semibold text-primary w-8 shrink-0">
                                                                    {DAY_SHORT[day.day] ?? day.day.substring(0, 3)}
                                                                </span>
                                                                {(day.start_time || day.end_time) ? (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatTime(day.start_time)} – {formatTime(day.end_time)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground italic">Time not set</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No programs enrolled</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
