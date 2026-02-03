import React from 'react';
import { Download, QrCode, RefreshCw } from 'lucide-react';
import { router } from '@inertiajs/react';

interface MemberQRCodeProps {
    memberId: string | number;
    registrationNumber: string;
    callingName: string;
    showDownload?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function MemberQRCode({
    memberId,
    registrationNumber,
    callingName,
    showDownload = true,
    size = 'md',
}: MemberQRCodeProps) {
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const sizeClasses = {
        sm: 'w-32 h-32',
        md: 'w-48 h-48',
        lg: 'w-64 h-64',
    };

    React.useEffect(() => {
        fetchQRCode();
    }, [memberId]);

    const fetchQRCode = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/admin/qr-codes/members/${memberId}`);
            const data = await response.json();

            if (data.success) {
                setQrCodeUrl(data.qr_code_url);
            } else {
                setError(data.message || 'Failed to load QR code');
            }
        } catch (err) {
            setError('Failed to load QR code');
            console.error('QR Code fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        window.open(`/admin/qr-codes/members/${memberId}/download`, '_blank');
    };

    const handleRegenerate = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/admin/qr-codes/members/${memberId}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setQrCodeUrl(data.qr_code_url);
            } else {
                setError(data.message || 'Failed to regenerate QR code');
            }
        } catch (err) {
            setError('Failed to regenerate QR code');
            console.error('QR Code regenerate error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className={`relative ${sizeClasses[size]} bg-white p-4 rounded-lg shadow-md border-2 border-gray-200`}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
                        <div className="text-center p-4">
                            <QrCode className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <p className="text-sm text-red-600">{error}</p>
                            <button
                                onClick={fetchQRCode}
                                className="mt-2 text-xs text-blue-600 hover:underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {qrCodeUrl && !loading && !error && (
                    <img
                        src={qrCodeUrl}
                        alt={`QR Code for ${callingName}`}
                        className="w-full h-full object-contain"
                    />
                )}
            </div>

            <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{callingName}</p>
                <p className="text-xs text-gray-500">{registrationNumber}</p>
            </div>

            {showDownload && qrCodeUrl && (
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </button>
                    <button
                        onClick={handleRegenerate}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>
                </div>
            )}
        </div>
    );
}
