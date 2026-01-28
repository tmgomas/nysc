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
import { showDeleteConfirm } from '@/utils/sweetalert';

interface Sport {
    id: string;
    name: string;
    description: string;
    admission_fee: number;
    monthly_fee: number;
    capacity: number | null;
    location: string;
    is_active: boolean;
    members_count: number;
}

interface PaginatedSports {
    data: Sport[];
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
    sports: PaginatedSports;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function Index({ sports, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || '');

    const handleFilter = () => {
        router.get('/admin/sports', { search, status }, { preserveState: true });
    };

    const handleDelete = async (sport: Sport) => {
        const result = await showDeleteConfirm(sport.name);

        if (result.isConfirmed) {
            router.delete(`/admin/sports/${sport.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sports', href: '/admin/sports' }]}>
            <Head title="Sports Management" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Sports Management</h2>
                                <p className="text-muted-foreground">
                                    Manage sports, fees, and capacities
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/admin/sports/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Sport
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
                                    Search and filter sports
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
                                                placeholder="Sport name, location..."
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

                        {/* Sports List - Desktop & Mobile */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {sports.data.map((sport) => (
                                <Card key={sport.id} className="overflow-hidden">
                                    <CardHeader className="pb-3 bg-muted/30">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl flex items-center gap-2">
                                                    {sport.name}
                                                    <Badge variant={sport.is_active ? 'default' : 'secondary'}>
                                                        {sport.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {sport.location || 'No location set'}
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
                                                        <Link href={`/admin/sports/${sport.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(sport.id)}
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
                                                <p className="font-medium">Rs. {Number(sport.admission_fee).toLocaleString()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" /> Monthly
                                                </span>
                                                <p className="font-medium">Rs. {Number(sport.monthly_fee).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Activity className="h-3 w-3" /> Capacity
                                                </span>
                                                <p className="font-medium">{sport.capacity ? sport.capacity : 'Unlimited'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> Members
                                                </span>
                                                <p className="font-medium">{sport.members_count}</p>
                                            </div>
                                        </div>

                                        {sport.description && (
                                            <div className="text-sm text-muted-foreground pt-2 border-t line-clamp-2">
                                                {sport.description}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Empty State */}
                        {sports.data.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <Activity className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No sports found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Get started by adding your first sport
                                    </p>
                                    <Button asChild>
                                        <Link href="/admin/sports/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Sport
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pagination */}
                        {sports.last_page > 1 && (
                            <div className="flex justify-center mt-6 gap-2">
                                {sports.links.map((link, i) => (
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
