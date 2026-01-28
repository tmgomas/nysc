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

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        admission_fee: '',
        monthly_fee: '',
        capacity: '',
        location: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/sports');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sports', href: '/admin/sports' },
                { title: 'Add New', href: '/admin/sports/create' },
            ]}
        >
            <Head title="Add Sport" />

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
                            <h2 className="text-2xl font-bold tracking-tight">Add New Sport</h2>
                            <p className="text-muted-foreground">
                                Create a new sport with fees and capacity rules
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Sport Details</CardTitle>
                                <CardDescription>
                                    Enter the basic information for the sport.
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

                                <div className="flex items-start space-x-2 rounded-md border p-4">
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
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Create Sport
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
