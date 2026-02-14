import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    sports_count: number;
    special_bookings_count: number;
}

interface Props {
    locations: Location[];
}

export default function LocationsIndex({ locations }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [form, setForm] = useState({ name: '', description: '' });

    const openAddDialog = () => {
        setEditingLocation(null);
        setForm({ name: '', description: '' });
        setDialogOpen(true);
    };

    const openEditDialog = (loc: Location) => {
        setEditingLocation(loc);
        setForm({ name: loc.name, description: loc.description || '' });
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (editingLocation) {
            router.put(`/admin/locations/${editingLocation.id}`, form, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    toast.success('Location updated');
                },
            });
        } else {
            router.post('/admin/locations', form, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    toast.success('Location created');
                },
            });
        }
    };

    const handleDelete = (loc: Location) => {
        if (loc.sports_count > 0) {
            toast.error('Cannot delete location with assigned sports');
            return;
        }
        if (!window.confirm(`Delete "${loc.name}"?`)) return;

        router.delete(`/admin/locations/${loc.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Location deleted'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Locations', href: '/admin/locations' }]}>
            <Head title="Locations" />

            <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
                        <p className="text-muted-foreground">
                            Manage venues and locations for sports activities.
                        </p>
                    </div>
                    <Button onClick={openAddDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Location
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {locations.length > 0 ? (
                        locations.map((loc) => (
                            <Card key={loc.id} className={!loc.is_active ? 'opacity-60' : ''}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <CardTitle className="text-lg">{loc.name}</CardTitle>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(loc)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(loc)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {loc.description && (
                                        <CardDescription>{loc.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-3 text-sm text-muted-foreground">
                                        <Badge variant="secondary">
                                            {loc.sports_count} sport{loc.sports_count !== 1 ? 's' : ''}
                                        </Badge>
                                        {loc.special_bookings_count > 0 && (
                                            <Badge variant="outline">
                                                {loc.special_bookings_count} booking{loc.special_bookings_count !== 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {!loc.is_active && (
                                            <Badge variant="destructive">Inactive</Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="sm:col-span-2">
                            <CardContent className="p-8 text-center">
                                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                <p className="font-medium">No locations yet</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Add locations like "Swimming Pool", "Main Ground", etc.
                                </p>
                                <Button size="sm" className="mt-4" onClick={openAddDialog}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Location
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{editingLocation ? 'Edit Location' : 'Add Location'}</DialogTitle>
                        <DialogDescription>
                            {editingLocation ? 'Update the location details.' : 'Create a new venue or location.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Swimming Pool, Main Ground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description of the venue"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                            {editingLocation ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
