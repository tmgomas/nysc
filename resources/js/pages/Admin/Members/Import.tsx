import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import axios from '@/bootstrap';

interface Sport {
    id: string;
    name: string;
    admission_fee: number;
    monthly_fee: number;
}

interface PreviewData {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    samples: Array<{
        row: number;
        data: Record<string, string>;
        valid: boolean;
        errors: string[];
    }>;
    errors: Array<{
        row: number;
        errors: string[];
    }>;
}

export default function Import({ sports }: { sports: Sport[] }) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [skipDuplicates, setSkipDuplicates] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(null);
        }
    };

    const handlePreview = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(route('admin.members.import.preview'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setPreview(response.data.data);
            } else {
                alert(response.data.message || 'Failed to preview file');
            }
        } catch (error: any) {
            console.error('Preview error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to preview file';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = () => {
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('skip_duplicates', skipDuplicates ? '1' : '0');
        formData.append('auto_approve', autoApprove ? '1' : '0');

        router.post(route('admin.members.import'), formData, {
            onFinish: () => setImporting(false),
        });
    };

    const downloadTemplate = () => {
        window.location.href = route('admin.members.import.template');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Members', href: '/admin/members' }, { title: 'Bulk Import', href: '/admin/members/import/create' }]}>
            <Head title="Import Members" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Bulk Import Members</h1>
                        <p className="text-muted-foreground mt-1">
                            Upload a CSV file to import multiple members at once
                        </p>
                    </div>
                    <Button variant="outline" onClick={downloadTemplate}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                    </Button>
                </div>

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            How to Import
                        </CardTitle>
                        <CardDescription>Follow these steps to import members</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Download the CSV template using the button above</li>
                            <li>Fill in the member details in the template (one member per row)</li>
                            <li>For sport_ids, use comma-separated sport IDs: {sports.map(s => `${s.id} (${s.name})`).join(', ')}</li>
                            <li>Save the file and upload it below</li>
                            <li>Preview the data to check for errors</li>
                            <li>Click Import to add the members to the system</li>
                        </ol>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Important:</strong> Make sure all required fields are filled correctly.
                                Date format should be YYYY-MM-DD (e.g., 2000-01-15).
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upload CSV File</CardTitle>
                        <CardDescription>Select a CSV file to import members</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Choose File
                            </Button>
                            {file && (
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{file.name}</span>
                                    <Badge variant="secondary">{(file.size / 1024).toFixed(2)} KB</Badge>
                                </div>
                            )}
                        </div>

                        {file && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={skipDuplicates}
                                            onChange={(e) => setSkipDuplicates(e.target.checked)}
                                            className="rounded"
                                        />
                                        Skip duplicate members (by NIC/Email)
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={autoApprove}
                                            onChange={(e) => setAutoApprove(e.target.checked)}
                                            className="rounded"
                                        />
                                        Auto-approve members
                                    </label>
                                </div>

                                <Button onClick={handlePreview} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Previewing...
                                        </>
                                    ) : (
                                        'Preview Import'
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Preview Results */}
                {preview && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Preview</CardTitle>
                            <CardDescription>Review the data before importing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <div className="text-2xl font-bold">{preview.total_rows}</div>
                                        <div className="text-sm text-muted-foreground">Total Rows</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    <div>
                                        <div className="text-2xl font-bold">{preview.valid_rows}</div>
                                        <div className="text-sm text-muted-foreground">Valid Rows</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                    <div>
                                        <div className="text-2xl font-bold">{preview.invalid_rows}</div>
                                        <div className="text-sm text-muted-foreground">Invalid Rows</div>
                                    </div>
                                </div>
                            </div>

                            {/* Errors */}
                            {preview.errors.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-red-600">Errors Found</h3>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {preview.errors.map((error, idx) => (
                                            <Alert key={idx} variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>Row {error.row}:</strong>
                                                    <ul className="list-disc list-inside mt-1">
                                                        {error.errors.map((err, i) => (
                                                            <li key={i}>{err}</li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sample Data */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Sample Data (First 10 rows)</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border">
                                        <thead>
                                            <tr className="bg-muted">
                                                <th className="p-2 text-left border">Row</th>
                                                <th className="p-2 text-left border">Status</th>
                                                <th className="p-2 text-left border">Full Name</th>
                                                <th className="p-2 text-left border">Email</th>
                                                <th className="p-2 text-left border">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.samples.map((sample, idx) => (
                                                <tr key={idx} className={sample.valid ? '' : 'bg-red-50 dark:bg-red-950'}>
                                                    <td className="p-2 border">{sample.row}</td>
                                                    <td className="p-2 border">
                                                        {sample.valid ? (
                                                            <Badge variant="default" className="bg-green-600">Valid</Badge>
                                                        ) : (
                                                            <Badge variant="destructive">Invalid</Badge>
                                                        )}
                                                    </td>
                                                    <td className="p-2 border">{sample.data.full_name}</td>
                                                    <td className="p-2 border">{sample.data.email}</td>
                                                    <td className="p-2 border">{sample.data.contact_number}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Import Button */}
                            {preview.valid_rows > 0 && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleImport}
                                        disabled={importing}
                                        size="lg"
                                    >
                                        {importing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Importing {preview.valid_rows} members...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Import {preview.valid_rows} Members
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
