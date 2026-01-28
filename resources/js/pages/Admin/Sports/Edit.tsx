import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Loader2, Save } from 'lucide-react';

interface Sport {
    id: string;
    name: string;
    description: string | null;
    admission_fee: number;
    monthly_fee: number;
    capacity: number | null;
    location: string | null;
    is_active: boolean;
}

interface Props {
    sport: Sport;
}

export default function Edit({ sport }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: sport.name || '',
        description: sport.description || '',
        admission_fee: sport.admission_fee || '',
        monthly_fee: sport.monthly_fee || '',
        capacity: sport.capacity || '',
        location: sport.location || '',
        is_active: Boolean(sport.is_active),
        update_existing_schedules: false, // Default to false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/sports/${sport.id}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sports', href: '/admin/sports' },
                { title: 'Edit Sport', href: `/admin/sports/${sport.id}/edit` },
            ]}
        >
            <Head title={`Edit ${sport.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/sports">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Edit Sport</h2>
                            <p className="text-muted-foreground">
                                Update fees and details for {sport.name}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Sport Details</CardTitle>
                                <CardDescription>
                                    Update the information for this sport.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Sport Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Swimming"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description of the sport..."
                                        rows={3}
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="admission_fee">Admission Fee (Rs.) <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="admission_fee"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.admission_fee}
                                            onChange={(e) => setData('admission_fee', e.target.value)}
                                            placeholder="0.00"
                                            className={errors.admission_fee ? 'border-red-500' : ''}
                                        />
                                        {errors.admission_fee && <p className="text-sm text-red-500">{errors.admission_fee}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="monthly_fee">Monthly Fee (Rs.) <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="monthly_fee"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.monthly_fee}
                                            onChange={(e) => setData('monthly_fee', e.target.value)}
                                            placeholder="0.00"
                                            className={errors.monthly_fee ? 'border-red-500' : ''}
                                        />
                                        {errors.monthly_fee && <p className="text-sm text-red-500">{errors.monthly_fee}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacity (Optional)</Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            min="1"
                                            value={data.capacity}
                                            onChange={(e) => setData('capacity', e.target.value)}
                                            placeholder="Max members"
                                            className={errors.capacity ? 'border-red-500' : ''}
                                        />
                                        <p className="text-xs text-muted-foreground">Leave blank for unlimited.</p>
                                        {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location / Venues</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder="e.g. Main Hall, Pool Complex"
                                            className={errors.location ? 'border-red-500' : ''}
                                        />
                                        {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                                    </div>
                                </div>


                                <div className="flex flex-col gap-4 border rounded-md p-4 bg-muted/20">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor="is_active"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Active Status
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                If unchecked, this sport will be hidden from new registrations.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Only show this option if monthly fee has changed */}
                                    {Number(data.monthly_fee) !== Number(sport.monthly_fee) && (
                                        <div className="flex items-start space-x-2 pt-2 border-t border-dashed border-gray-300">
                                            <Checkbox
                                                id="update_existing_schedules"
                                                checked={data.update_existing_schedules}
                                                onCheckedChange={(checked) => setData('update_existing_schedules', !!checked)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor="update_existing_schedules"
                                                    className="text-sm font-medium leading-none text-amber-600"
                                                >
                                                    Update Future Payments for Existing Members?
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Check this to apply the new fee (Rs. {data.monthly_fee}) to all pending future bills. If unchecked, only new members will get this price.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Update Sport
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
