import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, CheckCircle2, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ImportLog {
    id: string;
    filename: string;
    total_rows: number;
    success_count: number;
    error_count: number;
    skipped_count: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    errors: Array<{ row: number; errors: string[] }> | null;
    completed_at: string | null;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
}

interface Props {
    imports: {
        data: ImportLog[];
        links: any[];
        meta: any;
    };
}

export default function ImportHistory({ imports }: Props) {
    const getStatusBadge = (status: string) => {
        const variants = {
            pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending', className: '' },
            processing: { variant: 'default' as const, icon: Clock, label: 'Processing', className: '' },
            completed: { variant: 'default' as const, icon: CheckCircle2, label: 'Completed', className: 'bg-green-600' },
            failed: { variant: 'destructive' as const, icon: XCircle, label: 'Failed', className: '' },
        };

        const config = variants[status as keyof typeof variants];
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className={config.className || ''}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Members', href: '/admin/members' }, { title: 'Import History', href: '/admin/members/import/history' }]}>
            <Head title="Import History" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Import History</h1>
                        <p className="text-muted-foreground mt-1">
                            View all member bulk import operations
                        </p>
                    </div>
                    <Link href={route('admin.members.import.create')}>
                        <Button>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            New Import
                        </Button>
                    </Link>
                </div>

                {/* Import List */}
                <div className="space-y-4">
                    {imports.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No imports yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Start by importing your first batch of members
                                </p>
                                <Link href={route('admin.members.import.create')}>
                                    <Button>Import Members</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        imports.data.map((importLog) => (
                            <Card key={importLog.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                                                <CardTitle className="text-lg">{importLog.filename}</CardTitle>
                                                {getStatusBadge(importLog.status)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Imported by {importLog.user.name} on{' '}
                                                {format(new Date(importLog.created_at), 'PPp')}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Total Rows</div>
                                            <div className="text-2xl font-bold">{importLog.total_rows}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Success</div>
                                            <div className="text-2xl font-bold text-green-600">
                                                {importLog.success_count}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Errors</div>
                                            <div className="text-2xl font-bold text-red-600">
                                                {importLog.error_count}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Skipped</div>
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {importLog.skipped_count}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">Completed</div>
                                            <div className="text-sm font-medium">
                                                {importLog.completed_at
                                                    ? format(new Date(importLog.completed_at), 'PPp')
                                                    : 'In progress...'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Errors */}
                                    {importLog.errors && importLog.errors.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                Import Errors ({importLog.errors.length})
                                            </div>
                                            <div className="max-h-48 overflow-y-auto space-y-2 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                                                {importLog.errors.slice(0, 5).map((error, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        <strong>Row {error.row}:</strong>
                                                        <ul className="list-disc list-inside ml-4">
                                                            {error.errors.map((err, i) => (
                                                                <li key={i}>{err}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                                {importLog.errors.length > 5 && (
                                                    <div className="text-sm text-muted-foreground">
                                                        ... and {importLog.errors.length - 5} more errors
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {imports.links && imports.links.length > 3 && (
                    <div className="flex justify-center gap-2">
                        {imports.links.map((link: any, idx: number) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded ${link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
