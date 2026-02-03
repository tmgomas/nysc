import React from 'react';
import { Nfc, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface NFCReaderProps {
    onRead: (data: string) => void;
    onError?: (error: string) => void;
    autoVerify?: boolean;
}

interface NFCReadResult {
    success: boolean;
    data?: any;
    message: string;
    timestamp: string;
}

export default function NFCReader({ onRead, onError, autoVerify = true }: NFCReaderProps) {
    const [isScanning, setIsScanning] = React.useState(false);
    const [isSupported, setIsSupported] = React.useState(false);
    const [readResult, setReadResult] = React.useState<NFCReadResult | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Check if Web NFC is supported
        if ('NDEFReader' in window) {
            setIsSupported(true);
        } else {
            setIsSupported(false);
            setError('NFC is not supported on this device/browser. Please use Chrome on Android.');
        }
    }, []);

    const startScanning = async () => {
        if (!isSupported) {
            const errorMsg = 'NFC is not supported on this device';
            setError(errorMsg);
            onError?.(errorMsg);
            return;
        }

        try {
            setIsScanning(true);
            setError(null);
            setReadResult(null);

            // @ts-ignore - NDEFReader is not in TypeScript types yet
            const ndef = new NDEFReader();

            // Request permission and start scanning
            await ndef.scan();

            console.log('NFC scan started');

            // @ts-ignore
            ndef.addEventListener('reading', ({ message, serialNumber }) => {
                console.log('NFC tag detected:', serialNumber);

                let tagData: {
                    serialNumber: string;
                    records: any[];
                } = {
                    serialNumber,
                    records: []
                };

                for (const record of message.records) {
                    console.log('Record type:', record.recordType);
                    console.log('MIME type:', record.mediaType);

                    let recordData: any = {
                        recordType: record.recordType,
                        mediaType: record.mediaType
                    };

                    // Parse different record types
                    if (record.recordType === 'text') {
                        const textDecoder = new TextDecoder(record.encoding);
                        recordData.text = textDecoder.decode(record.data);
                    } else if (record.recordType === 'url') {
                        const textDecoder = new TextDecoder();
                        recordData.url = textDecoder.decode(record.data);
                    } else {
                        // For other types, try to decode as text
                        try {
                            const textDecoder = new TextDecoder();
                            recordData.data = textDecoder.decode(record.data);
                        } catch (e) {
                            recordData.data = record.data;
                        }
                    }

                    tagData.records.push(recordData);
                }

                const dataString = JSON.stringify(tagData);

                // Call the onRead callback
                onRead(dataString);

                // Auto-verify if enabled
                if (autoVerify) {
                    verifyNFCData(dataString);
                } else {
                    setReadResult({
                        success: true,
                        data: tagData,
                        message: 'NFC tag read successfully',
                        timestamp: new Date().toISOString()
                    });
                }

                // Stop scanning after successful read
                setTimeout(() => {
                    setIsScanning(false);
                }, 1000);
            });

            // @ts-ignore
            ndef.addEventListener('readingerror', () => {
                const errorMsg = 'Failed to read NFC tag';
                console.error(errorMsg);
                setError(errorMsg);
                onError?.(errorMsg);
                setIsScanning(false);
            });

        } catch (err: any) {
            const errorMsg = err.message || 'Failed to start NFC scanning';
            console.error('NFC Error:', err);
            setError(errorMsg);
            onError?.(errorMsg);
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        setIsScanning(false);
        setReadResult(null);
    };

    const verifyNFCData = async (data: string) => {
        try {
            const response = await fetch('/admin/nfc/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ nfc_data: data }),
            });

            const result = await response.json();

            setReadResult({
                success: result.valid,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (err) {
            console.error('Verification error:', err);
            setReadResult({
                success: false,
                message: 'Failed to verify NFC data',
                timestamp: new Date().toISOString()
            });
        }
    };

    return (
        <div className="space-y-4">
            {/* NFC Support Status */}
            {!isSupported && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">NFC Not Supported</h3>
                            <p className="mt-1 text-sm text-yellow-700">
                                Web NFC is only supported on Chrome for Android. Please use a compatible device.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanning Status */}
            {isScanning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex flex-col items-center justify-center">
                        <Nfc className="w-16 h-16 text-blue-600 animate-pulse mb-4" />
                        <p className="text-lg font-medium text-blue-900">Ready to Scan</p>
                        <p className="text-sm text-blue-700 mt-2">Hold your NFC tag near the device</p>
                        <button
                            onClick={stopScanning}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Stop Scanning
                        </button>
                    </div>
                </div>
            )}

            {/* Read Result */}
            {readResult && !isScanning && (
                <div className={`border rounded-lg p-4 ${readResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-start">
                        {readResult.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        )}
                        <div className="flex-1">
                            <h3 className={`text-sm font-medium ${readResult.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {readResult.message}
                            </h3>
                            {readResult.data && (
                                <div className="mt-2 text-sm">
                                    <pre className="bg-white p-2 rounded border overflow-auto max-h-40">
                                        {JSON.stringify(readResult.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                {new Date(readResult.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Start Scan Button */}
            {!isScanning && isSupported && (
                <button
                    onClick={startScanning}
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Nfc className="w-5 h-5 mr-2" />
                    Start NFC Scan
                </button>
            )}
        </div>
    );
}
