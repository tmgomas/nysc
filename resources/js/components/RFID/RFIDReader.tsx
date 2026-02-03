import React from 'react';
import { CreditCard, AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface RFIDReaderProps {
    onRead: (data: string) => void;
    onError?: (error: string) => void;
    autoVerify?: boolean;
}

interface RFIDReadResult {
    success: boolean;
    data?: any;
    message: string;
    timestamp: string;
}

export default function RFIDReader({ onRead, onError, autoVerify = true }: RFIDReaderProps) {
    const [isListening, setIsListening] = React.useState(false);
    const [readResult, setReadResult] = React.useState<RFIDReadResult | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [buffer, setBuffer] = React.useState<string>('');
    const bufferTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (isListening) {
            // Add keyboard event listener for RFID reader input
            const handleKeyPress = (event: KeyboardEvent) => {
                // RFID readers typically send data followed by Enter key
                if (event.key === 'Enter') {
                    if (buffer.trim().length > 0) {
                        handleRFIDRead(buffer.trim());
                        setBuffer('');
                    }
                } else if (event.key.length === 1) {
                    // Accumulate characters
                    setBuffer(prev => prev + event.key);

                    // Reset buffer after 100ms of inactivity (RFID readers are fast)
                    if (bufferTimeoutRef.current) {
                        clearTimeout(bufferTimeoutRef.current);
                    }
                    bufferTimeoutRef.current = setTimeout(() => {
                        setBuffer('');
                    }, 100);
                }
            };

            window.addEventListener('keypress', handleKeyPress);

            return () => {
                window.removeEventListener('keypress', handleKeyPress);
                if (bufferTimeoutRef.current) {
                    clearTimeout(bufferTimeoutRef.current);
                }
            };
        }
    }, [isListening, buffer]);

    const handleRFIDRead = async (rfidData: string) => {
        console.log('RFID tag read:', rfidData);

        // Call the onRead callback
        onRead(rfidData);

        // Auto-verify if enabled
        if (autoVerify) {
            await verifyRFIDData(rfidData);
        } else {
            setReadResult({
                success: true,
                data: { rfid: rfidData },
                message: 'RFID tag read successfully',
                timestamp: new Date().toISOString()
            });
        }

        // Clear result after 3 seconds
        setTimeout(() => {
            setReadResult(null);
        }, 3000);
    };

    const verifyRFIDData = async (data: string) => {
        try {
            const response = await fetch('/admin/rfid/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ rfid_data: data }),
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
                message: 'Failed to verify RFID data',
                timestamp: new Date().toISOString()
            });
        }
    };

    const startListening = () => {
        setIsListening(true);
        setError(null);
        setReadResult(null);
        setBuffer('');
    };

    const stopListening = () => {
        setIsListening(false);
        setBuffer('');
    };

    return (
        <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">RFID Reader Instructions</h3>
                        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                            <li>Connect your USB RFID reader to the computer</li>
                            <li>Click "Start Listening" below</li>
                            <li>Scan an RFID card/tag with your reader</li>
                            <li>The system will automatically detect and verify the tag</li>
                        </ul>
                    </div>
                </div>
            </div>

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

            {/* Listening Status */}
            {isListening && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex flex-col items-center justify-center">
                        <CreditCard className="w-16 h-16 text-green-600 animate-pulse mb-4" />
                        <p className="text-lg font-medium text-green-900">Listening for RFID Tags</p>
                        <p className="text-sm text-green-700 mt-2">Scan your RFID card now</p>
                        {buffer && (
                            <div className="mt-3 px-3 py-1 bg-white rounded border border-green-300">
                                <p className="text-xs font-mono text-gray-600">Reading: {buffer}</p>
                            </div>
                        )}
                        <button
                            onClick={stopListening}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Stop Listening
                        </button>
                    </div>
                </div>
            )}

            {/* Read Result */}
            {readResult && (
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
                                    {readResult.data.member ? (
                                        <div className="bg-white p-3 rounded border">
                                            <p className="font-medium">{readResult.data.member.calling_name}</p>
                                            <p className="text-xs text-gray-600">{readResult.data.member.member_number}</p>
                                        </div>
                                    ) : (
                                        <pre className="bg-white p-2 rounded border overflow-auto max-h-40">
                                            {JSON.stringify(readResult.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                {new Date(readResult.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Start/Stop Button */}
            {!isListening ? (
                <button
                    onClick={startListening}
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Start Listening for RFID
                </button>
            ) : null}
        </div>
    );
}
