import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Phone,
    Mail,
    Edit,
    Trash
} from 'lucide-react';

interface Coach {
    id: string;
    name: string;
    contact_number: string;
    specialization: string;
    experience_years: number;
    is_active: boolean;
    user?: {
        name: string;
        email: string;
    };
}

interface PaginatedCoaches {
    data: Coach[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    coaches: PaginatedCoaches;
    filters: {
        search?: string;
    };
}

export default function Index({ coaches, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleFilter = () => {
        router.get('/admin/coaches', { search }, { preserveState: true });
    };

    const handleDelete = (coachId: string) => {
        if (confirm('Are you sure you want to delete this coach?')) {
            router.delete(`/admin/coaches/${coachId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Coaches', href: '/admin/coaches' }]}>
            <Head title="Coaches" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Coaches</h2>
                                <p className="text-muted-foreground">
                                    Manage club coaches and their details
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button asChild>
                                    <Link href="/admin/coaches/create">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add Coach
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Filters Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filter Coaches
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-2 lg:col-span-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                                placeholder="Search by name, email, specialization, or phone..."
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-end lg:col-span-1">
                                        <Button onClick={handleFilter} className="w-full">
                                            Search Coaches
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Coaches List - Mobile Card View */}
                        <div className="block lg:hidden space-y-4">
                            {coaches.data.map((coach) => (
                                <Card key={coach.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    {coach.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    {coach.specialization || 'No specialization'}
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
                                                        <Link href={`/admin/coaches/${coach.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(coach.id)} className="text-red-500">
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            {coach.user?.email || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            {coach.contact_number || 'N/A'}
                                        </div>
                                        <div className="pt-2">
                                            <Badge variant={coach.is_active ? 'default' : 'secondary'}>
                                                {coach.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Coaches Table - Desktop View */}
                        <Card className="hidden lg:block">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Contact
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Specialization
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Exp. Years
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coaches.data.map((coach) => (
                                            <tr key={coach.id} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium">
                                                            {coach.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {coach.contact_number || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {coach.user?.email || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {coach.specialization || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {coach.experience_years}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={coach.is_active ? 'default' : 'secondary'}>
                                                        {coach.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/coaches/${coach.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(coach.id)}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="border-t px-6 py-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium">{coaches.data.length}</span> of{' '}
                                        <span className="font-medium">{coaches.total}</span> coaches
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: coaches.last_page }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === coaches.current_page ? 'default' : 'outline'}
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/coaches?page=${page}&search=${search}`}
                                                >
                                                    {page}
                                                </Link>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Empty State */}
                        {coaches.data.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <UserPlus className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No coaches found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Get started by adding your first coach
                                    </p>
                                    <Button asChild>
                                        <Link href="/admin/coaches/create">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add Coach
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
