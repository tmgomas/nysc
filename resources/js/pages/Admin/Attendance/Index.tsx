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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NFCReader from '@/components/NFC/NFCReader';
import RFIDReader from '@/components/RFID/RFIDReader';
import {
    Loader2,
    Save,
    Calendar as CalendarIcon,
    Filter,
    Search,
    QrCode,
    XCircle,
    CheckCircle,
    Nfc,
    CreditCard,
    User,
    Clock,
    ScanLine
} from 'lucide-react';
import { debounce } from 'lodash';
import QrScanner from '@/components/RefactoredQrScanner';
import axios from 'axios';
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';

interface Program {
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
    programs: Program[];
    filters: {
        date?: string;
        program_id?: string;
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

export default function Index({ programs, filters, members, currentDate }: Props) {
    const [selectedDate, setSelectedDate] = useState(filters.date || currentDate);
    const [selectedProgramId, setSelectedProgramId] = useState(filters.program_id || '');
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
        router.get('/admin/attendance', { date, program_id: sportId }, { preserveState: true, preserveScroll: true });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (selectedProgramId) {
            applyFilters(date, selectedProgramId);
        }
    };

    const handleProgramChange = (sportId: string) => {
        setSelectedProgramId(sportId);
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
        if (!selectedProgramId) return;

        setProcessing(true);
        router.post('/admin/attendance/bulk', {
            date: selectedDate,
            program_id: selectedProgramId,
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
            onError: () => setProcessing(false)
        });
    };

    // Generic Scan Handler
    const handleScan = (data: string, method: 'qr' | 'nfc' | 'rfid') => {
        if (!selectedProgramId) return;

        if (method === 'qr' && data === lastScanned) return;
        if (method === 'qr') setLastScanned(data);

        let memberIdentifier = data;
        try {
            const parsed = JSON.parse(data);
            if (parsed.member_number) memberIdentifier = parsed.member_number;
        } catch (e) { }

        apiPost('/admin/attendance/scan', {
            date: selectedDate,
            program_id: selectedProgramId,
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

    const filteredMembers = (members || []).filter(m =>
        (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.member_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const presentCount = attendanceData.filter(a => a.present).length;

    return (
        <AppLayout breadcrumbs={[{ title: 'Attendance', href: '/admin/attendance' }]}>
            <Head title="Attendance" />

            {/* Mobile-Optimized Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
                            {selectedProgramId && (
                                <div className="flex items-center gap-2">
                                    <div className="hidden sm:block text-sm text-muted-foreground mr-2">
                                        <span className="font-medium text-foreground">{presentCount}</span> / {members.length} Present
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={processing || !isDirty}
                                        className={cn(
                                            "transition-all shadow-sm",
                                            isDirty ? "animate-pulse ring-2 ring-primary/20" : ""
                                        )}
                                    >
                                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Controls Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center pt-2">
                            <div className="flex flex-1 gap-3 items-center overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                                <div className="flex-shrink-0 w-36 sm:w-44">
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        className="h-9 text-sm bg-white/50 border-gray-200"
                                    />
                                </div>
                                <div className="flex-shrink-0 w-40 sm:w-56">
                                    <Select value={selectedProgramId} onValueChange={handleProgramChange}>
                                        <SelectTrigger className="h-9 bg-white/50 border-gray-200">
                                            <SelectValue placeholder="Select Program" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {programs.map(sport => (
                                                <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <span className="flex-1"></span>

                                {selectedProgramId && (
                                    <div className="relative w-full sm:w-64 hidden sm:block">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search members..."
                                            className="pl-9 h-9 w-full bg-white/50 border-gray-200"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-shrink-0 gap-2 h-9 bg-white/80 hover:bg-white shadow-sm border-gray-200 text-gray-700"
                                    onClick={() => setIsScanning(true)}
                                    disabled={!selectedProgramId}
                                >
                                    <ScanLine className="h-4 w-4 text-primary" />
                                    <span className="hidden sm:inline">Quick Scan</span>
                                    <span className="sm:hidden">Scan</span>
                                </Button>
                            </div>

                            {/* Mobile Search - Only visible on small screens */}
                            {selectedProgramId && (
                                <div className="relative w-full sm:hidden">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search members..."
                                        className="pl-9 h-9 w-full bg-white/50"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


                {/* Content Area */}
                {!selectedProgramId ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-white rounded-xl border border-dashed p-8">
                        <div className="rounded-full bg-gray-100 p-4 mb-4">
                            <Filter className="h-8 w-8 opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Program Selected</h3>
                        <p className="mt-1 text-sm">Select a sport from the toolbar to load members.</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-white rounded-xl border border-dashed p-8">
                        <p>No members found.</p>
                    </div>
                ) : (

                    <div className="space-y-4">
                        {/* Stats Banner for Mobile (hidden on desktop as it's in header) */}
                        <div className="flex sm:hidden justify-between items-center px-1 text-sm text-muted-foreground">
                            <span>Total Members: {members.length}</span>
                            <span>Present: <span className="font-bold text-green-600">{presentCount}</span></span>
                        </div>

                        {/* Member Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredMembers.map((member) => {
                                const state = attendanceData.find(a => a.id === member.id) || { present: false, check_in: '08:00', check_out: '', id: member.id };

                                return (
                                    <div
                                        key={member.id}
                                        className={cn(
                                            "group relative flex flex-col gap-3 rounded-xl border p-4 bg-white transition-all duration-200",
                                            "hover:shadow-md hover:border-gray-300",
                                            state.present
                                                ? "border-green-200 bg-green-50/40 shadow-sm ring-1 ring-green-500/10"
                                                : "border-gray-200 shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={cn(
                                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors shadow-sm",
                                                    state.present
                                                        ? "bg-gradient-to-br from-green-100 to-green-200 text-green-700 ring-2 ring-white"
                                                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 ring-2 ring-white"
                                                )}>
                                                    {(member.full_name || '?').charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-900 leading-tight truncate text-sm sm:text-base" title={member.full_name}>
                                                        {member.full_name || 'Unknown Member'}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground truncate">{member.member_number}</p>
                                                </div>
                                            </div>

                                            <Switch
                                                checked={state.present}
                                                onCheckedChange={(checked: boolean) => togglePresent(member.id, checked)}
                                                className={cn(
                                                    "data-[state=checked]:bg-green-600",
                                                    "shrink-0"
                                                )}
                                            />
                                        </div>

                                        {/* Expanded Time Controls */}
                                        {state.present && (
                                            <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-black/5 animate-in slide-in-from-top-2 fade-in duration-200">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> Check In
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={state.check_in}
                                                        onChange={(e) => updateCheckInTime(member.id, e.target.value)}
                                                        className="h-8 text-xs font-medium bg-white/80 border-gray-200 focus:border-green-500 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> Check Out
                                                    </Label>
                                                    <Input
                                                        type="time"
                                                        value={state.check_out}
                                                        onChange={(e) => updateCheckOutTime(member.id, e.target.value)}
                                                        className="h-8 text-xs font-medium bg-white/80 border-gray-200 focus:border-green-500 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Scan Modal */}
            <Dialog open={isScanning} onOpenChange={setIsScanning}>
                <DialogContent className="sm:max-w-md w-full bottom-0 sm:bottom-auto mb-0 sm:mb-auto rounded-b-none sm:rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Quick Scan</DialogTitle>
                        <DialogDescription>
                            Mark attendance via scan.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="qr" value={activeScanTab} onValueChange={(v) => setActiveScanTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="qr" className="flex items-center gap-2">
                                <QrCode className="h-4 w-4" /> QR
                            </TabsTrigger>
                            <TabsTrigger value="rfid" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> RFID
                            </TabsTrigger>
                            {/* Assuming NFC is less common on desktop/web but kept for consistency */}
                            <TabsTrigger value="nfc" className="flex items-center gap-2">
                                <Nfc className="h-4 w-4" /> NFC
                            </TabsTrigger>
                        </TabsList>

                        <div className="py-4 min-h-[300px] flex flex-col justify-center">
                            <TabsContent value="qr" className="mt-0">
                                {isScanning && activeScanTab === 'qr' && (
                                    <div className="rounded-xl overflow-hidden shadow-sm border bg-black">
                                        <QrScanner
                                            fps={10}
                                            qrbox={window.innerWidth < 640 ? 200 : 250}
                                            disableFlip={false}
                                            qrCodeSuccessCallback={(text) => handleScan(text, 'qr')}
                                        />
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="rfid" className="mt-0">
                                {isScanning && activeScanTab === 'rfid' && (
                                    <RFIDReader onRead={(data) => handleScan(data, 'rfid')} autoVerify={false} />
                                )}
                            </TabsContent>

                            <TabsContent value="nfc" className="mt-0">
                                {isScanning && activeScanTab === 'nfc' && (
                                    <NFCReader onRead={(data) => handleScan(data, 'nfc')} autoVerify={false} />
                                )}
                            </TabsContent>

                            {/* Scan Result Feedback */}
                            {scanResult && (
                                <div className={cn(
                                    "mt-4 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in",
                                    scanResult.success ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
                                )}>
                                    {scanResult.success ? <CheckCircle className="h-6 w-6 text-green-700" /> : <XCircle className="h-6 w-6 text-red-700" />}
                                    <div>
                                        <h4 className="font-semibold text-sm">{scanResult.success ? 'Confirmed' : 'Error'}</h4>
                                        <p className="text-xs opacity-90">{scanResult.message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
