import React from 'react';
import { Nfc, Trash2, Plus, RefreshCw } from 'lucide-react';
import NFCReader from '@/components/NFC/NFCReader';

interface MemberNFCCardProps {
    memberId: string;
    nfcTagId: string | null;
    memberName: string;
    onUpdate?: () => void;
}

export default function MemberNFCCard({ memberId, nfcTagId, memberName, onUpdate }: MemberNFCCardProps) {
    const [showScanner, setShowScanner] = React.useState(false);
    const [isAssociating, setIsAssociating] = React.useState(false);
    const [isRemoving, setIsRemoving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const handleNFCScan = async (nfcData: string) => {
        try {
            const parsedData = JSON.parse(nfcData);
            const tagId = parsedData.serialNumber;

            if (tagId) {
                await associateNFC(tagId);
                setShowScanner(false);
            }
        } catch (err) {
            console.error('Failed to parse NFC data:', err);
            setError('Failed to read NFC tag');
        }
    };

    const associateNFC = async (tagId: string) => {
        setIsAssociating(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/admin/nfc/associate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    member_id: memberId,
                    nfc_tag_id: tagId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                onUpdate?.();
            } else {
                setError(data.message || 'Failed to associate NFC tag');
            }
        } catch (err) {
            setError('Failed to associate NFC tag');
            console.error('Association error:', err);
        } finally {
            setIsAssociating(false);
        }
    };

    const removeNFC = async () => {
        if (!confirm(`Remove NFC tag from ${memberName}?`)) {
            return;
        }

        setIsRemoving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/admin/nfc/disassociate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    member_id: memberId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                onUpdate?.();
            } else {
                setError(data.message || 'Failed to remove NFC tag');
            }
        } catch (err) {
            setError('Failed to remove NFC tag');
            console.error('Removal error:', err);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Nfc className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">NFC Tag</h3>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Current NFC Tag */}
            {nfcTagId ? (
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Tag ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{nfcTagId}</p>
                    </div>

                    <button
                        onClick={removeNFC}
                        disabled={isRemoving}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRemoving ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        {isRemoving ? 'Removing...' : 'Remove NFC Tag'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {!showScanner ? (
                        <>
                            <p className="text-sm text-gray-600">No NFC tag associated with this member.</p>
                            <button
                                onClick={() => setShowScanner(true)}
                                disabled={isAssociating}
                                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Scan & Associate NFC Tag
                            </button>
                        </>
                    ) : (
                        <div>
                            <NFCReader
                                onRead={handleNFCScan}
                                autoVerify={false}
                            />
                            <button
                                onClick={() => setShowScanner(false)}
                                className="mt-3 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
