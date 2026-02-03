import React from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose?: () => void;
    autoVerify?: boolean;
}

interface ScanResult {
    valid: boolean;
    success?: boolean;
    type?: string;
    member?: any;
    message: string;
    data?: any;
}

export default function QRScanner({ onScan, onClose, autoVerify = true }: QRScannerProps) {
    const [isScanning, setIsScanning] = React.useState(false);
    const [scanner, setScanner] = React.useState<Html5Qrcode | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [scanResult, setScanResult] = React.useState<ScanResult | null>(null);
    const [verifying, setVerifying] = React.useState(false);

    const scannerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        return () => {
            stopScanning();
        };
    }, []);

    const startScanning = async () => {
        try {
            setError(null);
            const html5QrCode = new Html5Qrcode('qr-reader');
            setScanner(html5QrCode);

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                handleScanSuccess,
                handleScanError
            );

            setIsScanning(true);
        } catch (err: any) {
            setError(err.message || 'Failed to start camera');
            console.error('Scanner start error:', err);
        }
    };

    const stopScanning = async () => {
        if (scanner && isScanning) {
            try {
                await scanner.stop();
                scanner.clear();
            } catch (err) {
                console.error('Scanner stop error:', err);
            }
        }
        setIsScanning(false);
        setScanner(null);
    };

    const handleScanSuccess = async (decodedText: string) => {
        console.log('QR Code scanned:', decodedText);

        // Stop scanning temporarily
        await stopScanning();

        // Call parent callback
        onScan(decodedText);

        // Auto-verify if enabled
        if (autoVerify) {
            await verifyQRCode(decodedText);
        }
    };

    const handleScanError = (errorMessage: string) => {
        // Ignore common scanning errors
        if (!errorMessage.includes('NotFoundException')) {
            console.warn('Scan error:', errorMessage);
        }
    };

    const verifyQRCode = async (qrData: string) => {
        setVerifying(true);
        setScanResult(null);

        try {
            const response = await fetch('/admin/qr-codes/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ qr_data: qrData }),
            });

            const data = await response.json();
            setScanResult(data);

            // Auto-restart scanning after 3 seconds if successful
            if (data.valid) {
                setTimeout(() => {
                    setScanResult(null);
                    startScanning();
                }, 3000);
            }
        } catch (err) {
            setScanResult({
                valid: false,
                success: false,
                message: 'Failed to verify QR code',
            });
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">QR Code Scanner</h3>
                    </div>
                    {onClose && (
                        <button
                            onClick={() => {
                                stopScanning();
                                onClose();
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Scanner Area */}
                <div className="p-6">
                    {!isScanning && !scanResult && (
                        <div className="text-center py-12">
                            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Click the button below to start scanning</p>
                            <button
                                onClick={startScanning}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Start Scanning
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* QR Reader Container */}
                    <div id="qr-reader" className={`${isScanning ? 'block' : 'hidden'} w-full`}></div>

                    {/* Verification Result */}
                    {verifying && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Verifying QR code...</p>
                        </div>
                    )}

                    {scanResult && !verifying && (
                        <div className={`rounded-lg p-6 ${scanResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex items-start">
                                {scanResult.valid ? (
                                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h4 className={`text-lg font-semibold mb-2 ${scanResult.valid ? 'text-green-900' : 'text-red-900'}`}>
                                        {scanResult.valid ? 'Valid QR Code' : 'Invalid QR Code'}
                                    </h4>
                                    <p className={`text-sm mb-4 ${scanResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                                        {scanResult.message}
                                    </p>

                                    {scanResult.valid && scanResult.type === 'member' && scanResult.member && (
                                        <div className="bg-white rounded-lg p-4 space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Name:</span>
                                                    <p className="font-medium text-gray-900">{scanResult.member.calling_name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Reg No:</span>
                                                    <p className="font-medium text-gray-900">{scanResult.member.registration_number}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Batch:</span>
                                                    <p className="font-medium text-gray-900">{scanResult.member.batch?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Status:</span>
                                                    <p className="font-medium text-gray-900 capitalize">{scanResult.member.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setScanResult(null);
                                                startScanning();
                                            }}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Scan Another
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isScanning && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={stopScanning}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Stop Scanning
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
