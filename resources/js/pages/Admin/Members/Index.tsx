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
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    Phone,
    Mail,
    Calendar,
    Hash
} from 'lucide-react';

interface Member {
    id: string;
    member_number: string;
    nic_passport: string;
    contact_number: string;
    status: string;
    registration_date: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    user?: {
        name: string;
        email: string;
    };
    sports: Array<{
        id: string;
        name: string;
    }>;
}

interface PaginatedMembers {
    data: Member[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    members: PaginatedMembers;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function Index({ members, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || '');

    const handleFilter = () => {
        router.get('/admin/members', { search, status }, { preserveState: true });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'default',
            pending: 'secondary',
            suspended: 'destructive',
            inactive: 'outline',
        };
        return variants[status as keyof typeof variants] || 'outline';
    };

    const handleApprove = (memberId: string) => {
        router.post(`/admin/members/${memberId}/approve`);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Members', href: '/admin/members' }]}>
            <Head title="Members" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Members</h2>
                                <p className="text-muted-foreground">
                                    Manage and view all club members
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/admin/members/create">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Member
                                </Link>
                            </Button>
                        </div>

                        {/* Filters Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </CardTitle>
                                <CardDescription>
                                    Search and filter members by various criteria
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
                                                placeholder="Member number, NIC, or name..."
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
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
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

                        {/* Members List - Mobile Card View */}
                        <div className="block lg:hidden space-y-4">
                            {members.data.map((member) => (
                                <Card key={member.id}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    {member.first_name ? `${member.first_name} ${member.last_name}` : (member.user?.name || 'N/A')}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    {member.member_number}
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
                                                        <Link href={`/admin/members/${member.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {member.status === 'pending' && (
                                                        <DropdownMenuItem onClick={() => handleApprove(member.id)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            {member.email || member.user?.email || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            {member.contact_number}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            NIC: {member.nic_passport}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {member.sports.map((sport) => (
                                                <Badge key={sport.id} variant="secondary">
                                                    {sport.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="pt-2">
                                            <Badge variant={getStatusBadge(member.status) as any}>
                                                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Members Table - Desktop View */}
                        <Card className="hidden lg:block">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Member #
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Contact
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                                                Sports
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
                                        {members.data.map((member) => (
                                            <tr key={member.id} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    {member.member_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium">
                                                            {member.first_name ? `${member.first_name} ${member.last_name}` : (member.user?.name || 'N/A')}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {member.nic_passport}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {member.contact_number}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {member.email || member.user?.email || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.sports.map((sport) => (
                                                            <Badge key={sport.id} variant="secondary">
                                                                {sport.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={getStatusBadge(member.status) as any}>
                                                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/members/${member.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </Button>
                                                        {member.status === 'pending' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleApprove(member.id)}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Approve
                                                            </Button>
                                                        )}
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
                                        Showing <span className="font-medium">{members.data.length}</span> of{' '}
                                        <span className="font-medium">{members.total}</span> members
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: members.last_page }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === members.current_page ? 'default' : 'outline'}
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/members?page=${page}&search=${search}&status=${status}`}
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
                        {members.data.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <UserPlus className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No members found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Get started by adding your first member
                                    </p>
                                    <Button asChild>
                                        <Link href="/admin/members/create">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add Member
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
