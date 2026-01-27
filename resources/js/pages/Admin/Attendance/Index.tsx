import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { debounce } from 'lodash';

interface Sport {
    id: string;
    name: string;
}

interface Attendance {
    id: string;
    check_in_time: string; // H:i
    check_out_time?: string;
}

interface Member {
    id: string;
    member_number: string;
    full_name: string;
    attendance: Attendance | null;
}

interface Props {
    sports: Sport[];
    filters: {
        date?: string;
        sport_id?: string;
    };
    members: Member[];
    currentDate: string;
}

interface AttendanceState {
    id: string; // Member ID
    present: boolean;
    check_in: string;
}

export default function Index({ sports, filters, members, currentDate }: Props) {
    const [selectedDate, setSelectedDate] = useState(filters.date || currentDate);
    const [selectedSportId, setSelectedSportId] = useState(filters.sport_id || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceData, setAttendanceData] = useState<AttendanceState[]>([]);
    const [processing, setProcessing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Initialize state from props
    useEffect(() => {
        if (members && members.length > 0) {
            const initialData = members.map(m => ({
                id: m.id,
                present: !!m.attendance,
                check_in: m.attendance?.check_in_time || '08:00', // Default time
            }));
            setAttendanceData(initialData);
        } else {
            setAttendanceData([]);
        }
        setIsDirty(false);
    }, [members]);

    // Handle Filters Change
    const applyFilters = (date: string, sportId: string) => {
        router.get(
            route('admin.attendance.index'),
            { date, sport_id: sportId },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (selectedSportId) {
            applyFilters(date, selectedSportId);
        }
    };

    const handleSportChange = (sportId: string) => {
        setSelectedSportId(sportId);
        applyFilters(selectedDate, sportId);
    };

    // Handle Attendance Changes using local state
    const togglePresent = (memberId: string, checked: boolean) => {
        setAttendanceData(prev => prev.map(item =>
            item.id === memberId ? { ...item, present: checked } : item
        ));
        setIsDirty(true);
    };

    const updateCheckInTime = (memberId: string, time: string) => {
        setAttendanceData(prev => prev.map(item =>
            item.id === memberId ? { ...item, check_in: time } : item
        ));
        setIsDirty(true);
    };

    const handleSave = () => {
        if (!selectedSportId) return;

        setProcessing(true);
        router.post(route('admin.attendance.bulk'), {
            date: selectedDate,
            sport_id: selectedSportId,
            attendances: attendanceData.map(a => ({
                member_id: a.id,
                present: a.present,
                check_in: a.check_in
            }))
        }, {
            onSuccess: () => {
                setProcessing(false);
                setIsDirty(false);
            },
            onError: () => setProcessing(false) // Keep dirty state on error
        });
    };

    // Derived states
    const filteredMembers = members.filter(m =>
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.member_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const presentCount = attendanceData.filter(a => a.present).length;

    return (
        <AppLayout breadcrumbs={[{ title: 'Attendance', href: '/admin/attendance' }]}>
            <Head title="Attendance Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Header & Controls */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                                Attendance Management
                            </h2>
                            <p className="text-muted-foreground">
                                Mark daily attendance for sports activities.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="w-40 border-0 shadow-none focus-visible:ring-0 px-0 h-9"
                                />
                            </div>
                            <div className="h-6 w-px bg-border" />
                            <Select value={selectedSportId} onValueChange={handleSportChange}>
                                <SelectTrigger className="w-[200px] border-0 shadow-none focus:ring-0 h-9">
                                    <SelectValue placeholder="Select Sport" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sports.map(sport => (
                                        <SelectItem key={sport.id} value={sport.id}>{sport.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Main Content */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle>Mark Attendance</CardTitle>
                                <CardDescription>
                                    {selectedSportId
                                        ? `${members.length} active members found. ${presentCount} marked present.`
                                        : "Select a sport to load members list."}
                                </CardDescription>
                            </div>
                            {selectedSportId && (
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search members..."
                                            className="pl-9 w-[250px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleSave} disabled={processing || !isDirty || members.length === 0}>
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </CardHeader>

                        <CardContent>
                            {!selectedSportId ? (
                                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <Filter className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <h3 className="text-lg font-medium">No Sport Selected</h3>
                                    <p>Please select a sport from the dropdown above to view members.</p>
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <p>No active members found for this sport.</p>
                                </div>
                            ) : (
                                <div className="relative overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                                            <tr>
                                                <th className="p-4 w-[50px]">
                                                    {/* Explicit "Presence" column */}
                                                </th>
                                                <th className="p-4">Member Info</th>
                                                <th className="p-4">Check-in Time</th>
                                                <th className="p-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredMembers.map((member) => {
                                                const state = attendanceData.find(a => a.id === member.id) || { present: false, check_in: '08:00', id: member.id };

                                                return (
                                                    <tr key={member.id} className={state.present ? "bg-green-50/50 hover:bg-green-50" : "hover:bg-muted/50"}>
                                                        <td className="p-4">
                                                            <Checkbox
                                                                checked={state.present}
                                                                onCheckedChange={(checked) => togglePresent(member.id, checked as boolean)}
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-medium text-gray-900">{member.full_name}</div>
                                                            <div className="text-muted-foreground text-xs">{member.member_number}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <Input
                                                                type="time"
                                                                value={state.check_in}
                                                                onChange={(e) => updateCheckInTime(member.id, e.target.value)}
                                                                disabled={!state.present}
                                                                className={`w-[120px] h-8 ${!state.present ? 'opacity-50' : ''}`}
                                                            />
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {state.present ? (
                                                                <Badge className="bg-green-600 hover:bg-green-700">Present</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-muted-foreground border-dashed">Absent</Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
