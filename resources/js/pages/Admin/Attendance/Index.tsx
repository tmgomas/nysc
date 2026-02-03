import React, { useState, useEffect, useCallback } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NFCReader from '@/components/NFC/NFCReader';
import RFIDReader from '@/components/RFID/RFIDReader';
import { Loader2, Save, Calendar as CalendarIcon, Filter, Search, QrCode, XCircle, CheckCircle, Nfc, CreditCard } from 'lucide-react';
import { debounce } from 'lodash';
import QrScanner from '@/components/RefactoredQrScanner';
import axios from 'axios';
import { route } from 'ziggy-js';

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
    check_out: string;
}

const apiPost = async (url: string, data: any) => {
    const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

export default function Index({ sports, filters, members, currentDate }: Props) {
    const [selectedDate, setSelectedDate] = useState(filters.date || currentDate);
    const [selectedSportId, setSelectedSportId] = useState(filters.sport_id || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceData, setAttendanceData] = useState<AttendanceState[]>([]);
    const [processing, setProcessing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // QR Scanning State
    const [isScanning, setIsScanning] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [activeScanTab, setActiveScanTab] = useState<'qr' | 'nfc' | 'rfid'>('qr');
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; member?: any } | null>(null);

    // Initialize state from props
    useEffect(() => {
        if (members && members.length > 0) {
            const initialData = members.map(m => ({
                id: m.id,
                present: !!m.attendance,
                check_in: m.attendance?.check_in_time || '08:00', // Default time
                check_out: m.attendance?.check_out_time || '',
            }));
            setAttendanceData(initialData);
        } else {
            setAttendanceData([]);
        }
        setIsDirty(false);
    }, [members]);

    // Handle Filters Change
    const applyFilters = (date: string, sportId: string) => {
        router.get('/admin/attendance', { date, sport_id: sportId }, { preserveState: true, preserveScroll: true }
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

    const updateCheckOutTime = (memberId: string, time: string) => {
        setAttendanceData(prev => prev.map(item =>
            item.id === memberId ? { ...item, check_out: time } : item
        ));
        setIsDirty(true);
    };

    const handleSave = () => {
        if (!selectedSportId) return;

        setProcessing(true);
        router.post('/admin/attendance/bulk', {
            date: selectedDate,
            sport_id: selectedSportId,
            attendances: attendanceData.map(a => ({
                member_id: a.id,
                present: a.present,
                check_in: a.check_in,
                check_out: a.check_out
            }))
        }, {
            onSuccess: () => {
                setProcessing(false);
                setIsDirty(false);
            },
            onError: () => setProcessing(false) // Keep dirty state on error
        });
    };

    // Generic Scan Handler
    const handleScan = (data: string, method: 'qr' | 'nfc' | 'rfid') => {
        if (!selectedSportId) return;

        // For QR, avoid duplicate scans of same code immediately
        if (method === 'qr' && data === lastScanned) return;
        if (method === 'qr') setLastScanned(data);

        // Handle JSON data parsing if needed (for QR/NFC that returns JSON)
        let memberIdentifier = data;
        try {
            const parsed = JSON.parse(data);
            if (parsed.member_number) memberIdentifier = parsed.member_number;
        } catch (e) {
            // Raw string (RFID or simple QR)
        }

        apiPost('/admin/attendance/scan', {
            date: selectedDate,
            sport_id: selectedSportId,
            member_number: memberIdentifier,
            method: method === 'qr' ? 'qr_code' : method
        }).then(data => {
            if (data.success) {
                setScanResult({ success: true, message: data.message, member: data.member });

                if (data.member) {
                    setAttendanceData(prev => prev.map(item => {
                        if (item.id !== data.member.id) return item;

                        const timeString = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit" });

                        if (data.status === 'checked_out') {
                            return { ...item, present: true, check_out: timeString };
                        }
                        return { ...item, present: true, check_in: timeString };
                    }));
                    // Silently refresh
                    router.reload({ only: ['members'] });
                }
            } else {
                setScanResult({ success: false, message: data.message });
            }
            setTimeout(() => setScanResult(null), 3000);
            if (method === 'qr') setTimeout(() => setLastScanned(null), 4000);
        }).catch(err => {
            console.error(err);
            setScanResult({ success: false, message: "Scan failed or member not found." });
            setLastScanned(null);
        });
    };

    // Derived states
    const filteredMembers = (members || []).filter(m =>
        (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.member_number || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                        <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
                            <div className="flex w-full md:w-auto gap-2">
                                <div className="flex items-center gap-2 flex-1 md:flex-none">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        className="w-full md:w-40 border-0 shadow-none focus-visible:ring-0 px-0 h-9"
                                    />
                                </div>
                                <div className="hidden md:block h-6 w-px bg-border" />
                            </div>
                            <Select value={selectedSportId} onValueChange={handleSportChange}>
                                <SelectTrigger className="w-full md:w-[200px] border-0 shadow-none focus:ring-0 h-9">
                                    <SelectValue placeholder="Select Sport" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sports.map(sport => (
                                        <SelectItem key={sport.id} value={sport.id}>{sport.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="hidden md:block h-6 w-px bg-border" />

                            <Button
                                variant="secondary"
                                className="w-full md:w-auto bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                                onClick={() => setIsScanning(true)}
                                disabled={!selectedSportId}
                            >
                                <QrCode className="mr-2 h-4 w-4" />
                                Scan Member
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4">
                            <div>
                                <CardTitle>Mark Attendance</CardTitle>
                                <CardDescription>
                                    {selectedSportId
                                        ? `${members.length} active members found. ${presentCount} marked present.`
                                        : "Select a sport to load members list."}
                                </CardDescription>
                            </div>
                            {selectedSportId && (
                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search members..."
                                            className="pl-9 w-full md:w-[250px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    {/* Save button moved below CardContent */}
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
                                <div className="relative overflow-x-auto rounded-md border text-left">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                                            <tr>
                                                <th className="p-4 w-[50px]">
                                                    {/* Explicit "Presence" column */}
                                                </th>
                                                <th className="p-4">Member Info</th>
                                                <th className="p-4">Check-in Time</th>
                                                <th className="p-4">Check-out Time</th>
                                                <th className="p-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredMembers.map((member) => {
                                                const state = attendanceData.find(a => a.id === member.id) || { present: false, check_in: '08:00', check_out: '', id: member.id };

                                                return (
                                                    <tr key={member.id} className={state.present ? "bg-green-50/50 hover:bg-green-50" : "hover:bg-muted/50"}>
                                                        <td className="p-4">
                                                            <Checkbox
                                                                checked={state.present}
                                                                onCheckedChange={(checked) => togglePresent(member.id, checked as boolean)}
                                                                id={`check-${member.id}`}
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <Label htmlFor={`check-${member.id}`} className="cursor-pointer">
                                                                <div className="font-medium text-gray-900">{member.full_name}</div>
                                                                <div className="text-muted-foreground text-xs">{member.member_number}</div>
                                                            </Label>
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
                                                        <td className="p-4">
                                                            <Input
                                                                type="time"
                                                                value={state.check_out}
                                                                onChange={(e) => updateCheckOutTime(member.id, e.target.value)}
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
                            {selectedSportId && members.length > 0 && (
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={handleSave} disabled={processing || !isDirty || members.length === 0}>
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Scanning Modal */}
            <Dialog open={isScanning} onOpenChange={setIsScanning}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Scan Member</DialogTitle>
                        <DialogDescription>
                            Use one of the methods below to mark attendance.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="qr" value={activeScanTab} onValueChange={(v) => setActiveScanTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="qr" className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" /> QR Code
                            </TabsTrigger>
                            <TabsTrigger value="nfc" className="flex items-center gap-2">
                                <Nfc className="h-4 w-4" /> NFC
                            </TabsTrigger>
                            <TabsTrigger value="rfid" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> RFID
                            </TabsTrigger>
                        </TabsList>

                        <div className="py-4 space-y-4">
                            <TabsContent value="qr" className="mt-0">
                                {isScanning && activeScanTab === 'qr' && (
                                    <QrScanner
                                        fps={10}
                                        qrbox={250}
                                        disableFlip={false}
                                        qrCodeSuccessCallback={(text) => handleScan(text, 'qr')}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="nfc" className="mt-0">
                                {isScanning && activeScanTab === 'nfc' && (
                                    <NFCReader
                                        onRead={(data) => handleScan(data, 'nfc')}
                                        autoVerify={false}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="rfid" className="mt-0">
                                {isScanning && activeScanTab === 'rfid' && (
                                    <RFIDReader
                                        onRead={(data) => handleScan(data, 'rfid')}
                                        autoVerify={false}
                                    />
                                )}
                            </TabsContent>

                            {scanResult && (
                                <div className={`p-4 rounded-md flex items-start gap-3 ${scanResult.success ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                                    {scanResult.success ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                                    <div>
                                        <h4 className="font-semibold text-sm">{scanResult.success ? 'Success' : 'Error'}</h4>
                                        <p className="text-sm opacity-90">{scanResult.message}</p>
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-center text-muted-foreground">
                                Marking attendance for: <span className="font-semibold text-gray-900">{sports.find(s => s.id == selectedSportId)?.name}</span>
                            </div>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
