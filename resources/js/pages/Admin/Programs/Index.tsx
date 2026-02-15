import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Activity,
    Users,
    DollarSign,
    MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface ProgramClassItem {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    label: string | null;
}

interface Program {
    id: string;
    name: string;
    short_code: string;
    description: string;
    admission_fee: number;
    monthly_fee: number;
    capacity: number | null;
    location: string;
    schedule_type: string;
    weekly_limit: number | null;
    schedule: Record<string, { start: string; end: string }> | null;
    is_active: boolean;
    members_count: number;
    classes_count: number;
    classes: ProgramClassItem[];
}

interface PaginatedPrograms {
    data: Program[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    programs: PaginatedPrograms;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function Index({ programs, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || '');
    const { confirm, ConfirmDialog } = useConfirm();

    const handleFilter = () => {
        router.get('/admin/programs', { search, status }, { preserveState: true });
    };

    const handleDelete = async (program: Program) => {
        const confirmed = await confirm({
            title: 'Delete Program',
            description: `Are you sure you want to delete "${program.name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'destructive',
        });

        if (confirmed) {
            toast.promise(
                new Promise((resolve, reject) => {
                    router.delete(`/admin/programs/${program.id}`, {
                        onSuccess: () => resolve(program.name),
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Deleting program...',
                    success: (name) => `${name} has been deleted successfully!`,
                    error: 'Failed to delete sport',
                }
            );
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Programs', href: '/admin/programs' }]}>
            <Head title="Programs Management" />
            <ConfirmDialog />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Programs Management</h2>
                                <p className="text-muted-foreground">
                                    Manage programs, fees, and capacities
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/admin/programs/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Program
                                </Link>
                            </Button>
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </CardTitle>
                                <CardDescription>
                                    Search and filter programs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="search">Search</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Program name, location..."
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end sm:col-span-2 lg:col-span-1">
                                        <Button onClick={handleFilter} className="w-full">
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Programs List - Desktop & Mobile */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {programs.data.map((program) => (
                                <Card key={program.id} className="overflow-hidden">
                                    <CardHeader className="pb-3 bg-muted/30">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl flex items-center gap-2">
                                                    {program.name}
                                                    <Badge variant={program.is_active ? 'default' : 'secondary'}>
                                                        {program.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {program.location || 'No location set'}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/programs/${program.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(program)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" /> Admission
                                                </span>
                                                <p className="font-medium">Rs. {Number(program.admission_fee).toLocaleString()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" /> Monthly
                                                </span>
                                                <p className="font-medium">Rs. {Number(program.monthly_fee).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Activity className="h-3 w-3" /> Capacity
                                                </span>
                                                <p className="font-medium">{program.capacity ? program.capacity : 'Unlimited'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> Members
                                                </span>
                                                <p className="font-medium">{program.members_count}</p>
                                            </div>
                                        </div>

                                        {program.description && (
                                            <div className="text-sm text-muted-foreground pt-2 border-t line-clamp-2">
                                                {program.description}
                                            </div>
                                        )}

                                        {/* Schedule Summary */}
                                        <div className="pt-2 border-t space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="text-xs">
                                                    {program.schedule_type === 'class_based' ? '📚 Class-Based' : '🏃 Practice Days'}
                                                </Badge>
                                                {program.weekly_limit && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Max {program.weekly_limit}x/week
                                                    </Badge>
                                                )}
                                            </div>
                                            {program.schedule_type === 'practice_days' && program.schedule && Object.keys(program.schedule).length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.keys(program.schedule).map((day) => (
                                                        <Badge key={day} variant="secondary" className="text-xs font-normal">
                                                            {day.substring(0, 3)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {program.schedule_type === 'class_based' && (
                                                <p className="text-xs text-muted-foreground">
                                                    {program.classes_count || 0} class slot{(program.classes_count || 0) !== 1 ? 's' : ''} configured
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Empty State */}
                        {programs.data.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <Activity className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No programs found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Get started by adding your first sport
                                    </p>
                                    <Button asChild>
                                        <Link href="/admin/programs/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Program
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pagination */}
                        {programs.last_page > 1 && (
                            <div className="flex justify-center mt-6 gap-2">
                                {programs.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
