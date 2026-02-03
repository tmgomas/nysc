import React from 'react';
import { CreditCard, Trash2, Plus, RefreshCw } from 'lucide-react';
import RFIDReader from '@/components/RFID/RFIDReader';

interface MemberRFIDCardProps {
    memberId: string;
    rfidCardId: string | null;
    memberName: string;
    onUpdate?: () => void;
}

export default function MemberRFIDCard({ memberId, rfidCardId, memberName, onUpdate }: MemberRFIDCardProps) {
    const [showScanner, setShowScanner] = React.useState(false);
    const [isAssociating, setIsAssociating] = React.useState(false);
    const [isRemoving, setIsRemoving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const handleRFIDScan = async (rfidData: string) => {
        await associateRFID(rfidData.trim());
        setShowScanner(false);
    };

    const associateRFID = async (cardId: string) => {
        setIsAssociating(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/admin/rfid/associate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    member_id: memberId,
                    rfid_card_id: cardId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                onUpdate?.();
            } else {
                setError(data.message || 'Failed to associate RFID card');
            }
        } catch (err) {
            setError('Failed to associate RFID card');
            console.error('Association error:', err);
        } finally {
            setIsAssociating(false);
        }
    };

    const removeRFID = async () => {
        if (!confirm(`Remove RFID card from ${memberName}?`)) {
            return;
        }

        setIsRemoving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/admin/rfid/disassociate', {
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
                setError(data.message || 'Failed to remove RFID card');
            }
        } catch (err) {
            setError('Failed to remove RFID card');
            console.error('Removal error:', err);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">RFID Card</h3>
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

            {/* Current RFID Card */}
            {rfidCardId ? (
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 mb-1">Card ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{rfidCardId}</p>
                    </div>

                    <button
                        onClick={removeRFID}
                        disabled={isRemoving}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRemoving ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        {isRemoving ? 'Removing...' : 'Remove RFID Card'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {!showScanner ? (
                        <>
                            <p className="text-sm text-gray-600">No RFID card associated with this member.</p>
                            <button
                                onClick={() => setShowScanner(true)}
                                disabled={isAssociating}
                                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Scan & Associate RFID Card
                            </button>
                        </>
                    ) : (
                        <div>
                            <RFIDReader
                                onRead={handleRFIDScan}
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
