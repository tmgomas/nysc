import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, QrCode, History, Users } from 'lucide-react';
import QRScanner from '@/components/QRCode/QRScanner';

interface ScanHistory {
    id: string;
    member_name: string;
    member_number: string;
    scanned_at: string;
    status: 'success' | 'error';
}

export default function QRScannerPage() {
    const [showScanner, setShowScanner] = useState(false);
    const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
    const [todayCount, setTodayCount] = useState(0);

    const handleScan = (data: string) => {
        console.log('Scanned data:', data);

        // Add to history
        try {
            const qrData = JSON.parse(data);
            if (qrData.type === 'member') {
                const newEntry: ScanHistory = {
                    id: Date.now().toString(),
                    member_name: qrData.calling_name,
                    member_number: qrData.registration_number,
                    scanned_at: new Date().toISOString(),
                    status: 'success',
                };
                setScanHistory(prev => [newEntry, ...prev]);
                setTodayCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Failed to parse QR data:', err);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Attendance', href: '/admin/attendance' },
                { title: 'QR Scanner', href: '/admin/attendance/qr-scanner' },
            ]}
        >
            <Head title="QR Code Scanner" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight">QR Code Scanner</h1>
                        <p className="text-muted-foreground mt-2">
                            Scan member QR codes for attendance tracking and verification
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Today's Scans</p>
                                        <p className="text-3xl font-bold mt-1">{todayCount}</p>
                                    </div>
                                    <Users className="w-12 h-12 text-blue-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total History</p>
                                        <p className="text-3xl font-bold mt-1">{scanHistory.length}</p>
                                    </div>
                                    <History className="w-12 h-12 text-green-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Success Rate</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {scanHistory.length > 0
                                                ? Math.round((scanHistory.filter(s => s.status === 'success').length / scanHistory.length) * 100)
                                                : 0}%
                                        </p>
                                    </div>
                                    <QrCode className="w-12 h-12 text-purple-600 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Scanner Control */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="w-5 h-5" />
                                    Scanner Control
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Ready to Scan</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Click the button below to open the camera and start scanning QR codes
                                    </p>
                                    <Button
                                        onClick={() => setShowScanner(true)}
                                        size="lg"
                                        className="w-full max-w-xs"
                                    >
                                        <Camera className="w-5 h-5 mr-2" />
                                        Start Scanner
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scan History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    Recent Scans
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {scanHistory.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            <p>No scans yet</p>
                                        </div>
                                    ) : (
                                        scanHistory.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">{entry.member_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {entry.member_number}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(entry.scanned_at).toLocaleTimeString()}
                                                    </p>
                                                    <div
                                                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${entry.status === 'success'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {entry.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {showScanner && (
                <QRScanner
                    onScan={handleScan}
                    onClose={() => setShowScanner(false)}
                    autoVerify={true}
                />
            )}
        </AppLayout>
    );
}
