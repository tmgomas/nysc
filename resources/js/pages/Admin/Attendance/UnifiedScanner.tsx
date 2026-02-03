import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { QrCode, Nfc, CreditCard, BarChart3 } from 'lucide-react';
import QRScanner from '@/components/QRCode/QRScanner';
import NFCReader from '@/components/NFC/NFCReader';
import RFIDReader from '@/components/RFID/RFIDReader';

interface ScanHistory {
    id: string;
    method: 'qr' | 'nfc' | 'rfid';
    member_name: string;
    member_number: string;
    scanned_at: string;
    status: 'success' | 'failed';
}

export default function UnifiedScanner() {
    const [activeTab, setActiveTab] = React.useState<'qr' | 'nfc' | 'rfid'>('qr');
    const [scanHistory, setScanHistory] = React.useState<ScanHistory[]>([]);
    const [showScanner, setShowScanner] = React.useState(false);
    const [todayCount, setTodayCount] = React.useState(0);

    const handleScan = async (data: string, method: 'qr' | 'nfc' | 'rfid') => {
        console.log(`${method.toUpperCase()} scanned:`, data);

        try {
            // First try to parse as JSON (for QR/NFC)
            // If fails, treat as raw ID (for RFID/NFC serial)
            let scanData = data;
            try {
                const parsed = JSON.parse(data);
                // If it's a member object from QR, wrap it properly for backend
                if (parsed.member_number || parsed.id) {
                    scanData = JSON.stringify(parsed);
                }
            } catch (e) {
                // Not JSON, likely raw ID. Construct JSON expectations if needed?
                // Backend quick-scan expects JSON with member_number OR raw ID?
                // Actually backend expects member_number inside JSON scan_data.
                // We should handle this logic.

                // If it's just an ID string (RFID), we might need to lookup locally or let backend handle raw ID lookup.
                // But current backend quickScan implementation expects JSON with 'member_number'.
                // AND RFID endpoint expects "rfid_data" string. 
                // Let's use specific endpoints per method to be safe, easier than unified endpoint sometimes.
            }

            let response;
            if (method === 'qr') {
                response = await fetch('/admin/attendance/quick-scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                    body: JSON.stringify({ scan_data: data, method: 'qr_code' })
                });
            } else if (method === 'nfc') {
                // Use NFC verify/mark endpoint logic
                // If we use quick-scan, we need member_number. 
                // If we scan a tag, we have tag ID. Backend NFCController->verify can verify.
                // But we want to mark attendance.

                // Let's assume we want to call the new quick-scan endpoint for all.
                // We need to ensure data format matches what quickScan expects.
                response = await fetch('/admin/attendance/quick-scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                    body: JSON.stringify({ scan_data: data, method: 'nfc' })
                });
            } else {
                // RFID
                // RFIDReader sends raw string directly.
                // But quickScan expects JSON string with member_number? 
                // Wait, RFIDController->scanCheckIn exists! Let's use that for RFID.
                // Or we update quickScan to handle RFID raw IDs.

                // Let's use the specific endpoint for RFID to be safe as it resolves ID -> Member.
                response = await fetch('/admin/rfid/scan-checkin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
                    body: JSON.stringify({ rfid_data: data })
                });
            }

            const result = await response.json();

            if (result.success) {
                const member = result.member;
                const newEntry: ScanHistory = {
                    id: Date.now().toString(),
                    method,
                    member_name: member.calling_name || member.full_name,
                    member_number: member.member_number,
                    scanned_at: new Date().toISOString(),
                    status: 'success',
                };
                setScanHistory(prev => [newEntry, ...prev]);
                setTodayCount(prev => prev + 1);

                // Play success sound or show toast
            } else {
                throw new Error(result.message);
            }

        } catch (err: any) {
            console.error('Scan failed:', err);
            const newEntry: ScanHistory = {
                id: Date.now().toString(),
                method,
                member_name: 'Unknown',
                member_number: 'Scan Failed',
                scanned_at: new Date().toISOString(),
                status: 'failed',
            };
            setScanHistory(prev => [newEntry, ...prev]);
            alert(`Scan Failed: ${err.message || 'Unknown error'}`);
        }
    };

    const successRate = scanHistory.length > 0
        ? ((scanHistory.filter(s => s.status === 'success').length / scanHistory.length) * 100).toFixed(1)
        : '0';

    const tabs = [
        { id: 'qr' as const, name: 'QR Code', icon: QrCode, color: 'blue' },
        { id: 'nfc' as const, name: 'NFC', icon: Nfc, color: 'green' },
        { id: 'rfid' as const, name: 'RFID', icon: CreditCard, color: 'purple' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Unified Scanner - QR / NFC / RFID" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Unified Scanner</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Scan members using QR codes, NFC tags, or RFID cards
                        </p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Today's Scans</p>
                                    <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                    <BarChart3 className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total History</p>
                                    <p className="text-2xl font-bold text-gray-900">{scanHistory.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                    <BarChart3 className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Scanner Section */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Scanner</h2>

                                {/* Tab Navigation */}
                                <div className="flex space-x-2 mb-6 border-b">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    setActiveTab(tab.id);
                                                    setShowScanner(false);
                                                }}
                                                className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                                    ? `border-${tab.color}-600 text-${tab.color}-600`
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4 mr-2" />
                                                {tab.name}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Scanner Content */}
                                <div className="mt-4">
                                    {activeTab === 'qr' && (
                                        <div>
                                            {!showScanner ? (
                                                <button
                                                    onClick={() => setShowScanner(true)}
                                                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    <QrCode className="w-5 h-5 mr-2" />
                                                    Start QR Scanner
                                                </button>
                                            ) : (
                                                <QRScanner
                                                    onScan={(data) => handleScan(data, 'qr')}
                                                    autoVerify={true}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'nfc' && (
                                        <NFCReader
                                            onRead={(data) => handleScan(data, 'nfc')}
                                            autoVerify={true}
                                        />
                                    )}

                                    {activeTab === 'rfid' && (
                                        <RFIDReader
                                            onRead={(data) => handleScan(data, 'rfid')}
                                            autoVerify={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Scan History */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan History</h2>

                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {scanHistory.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">No scans yet</p>
                                    ) : (
                                        scanHistory.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className={`p-4 rounded-lg border ${entry.status === 'success'
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-red-50 border-red-200'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-2 ${entry.method === 'qr' ? 'bg-blue-100 text-blue-800' :
                                                                entry.method === 'nfc' ? 'bg-green-100 text-green-800' :
                                                                    'bg-purple-100 text-purple-800'
                                                                }`}>
                                                                {entry.method.toUpperCase()}
                                                            </span>
                                                            <p className="font-medium text-gray-900">
                                                                {entry.member_name}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {entry.member_number}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(entry.scanned_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs font-medium ${entry.status === 'success'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}>
                                                        {entry.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
