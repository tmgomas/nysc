import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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

interface Props {
    coach: Coach;
}

export default function Edit({ coach }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: coach.name || '',
        email: coach.user?.email || '',
        password: '',
        password_confirmation: '',
        contact_number: coach.contact_number || '',
        specialization: coach.specialization || '',
        experience_years: coach.experience_years || 0,
        is_active: Boolean(coach.is_active),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/coaches/${coach.id}`);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Coaches', href: '/admin/coaches' },
            { title: 'Edit Coach', href: `/admin/coaches/${coach.id}/edit` }
        ]}>
            <Head title="Edit Coach" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Edit Coach</h2>
                            <p className="text-muted-foreground">
                                Update coach profile and user account details
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/admin/coaches">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Coaches
                            </Link>
                        </Button>
                    </div>

                    <form onSubmit={submit}>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Details</CardTitle>
                                    <CardDescription>
                                        Used for the coach to login to the system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password (Optional)</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Leave blank to keep current"
                                            />
                                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Details</CardTitle>
                                    <CardDescription>
                                        Information about the coach's profession
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number">Contact Number</Label>
                                            <Input
                                                id="contact_number"
                                                value={data.contact_number}
                                                onChange={(e) => setData('contact_number', e.target.value)}
                                            />
                                            {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="specialization">Specialization</Label>
                                            <Input
                                                id="specialization"
                                                value={data.specialization}
                                                onChange={(e) => setData('specialization', e.target.value)}
                                                placeholder="e.g. Cricket, Swimming"
                                            />
                                            {errors.specialization && <p className="text-sm text-red-500">{errors.specialization}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="experience_years">Years of Experience</Label>
                                            <Input
                                                id="experience_years"
                                                type="number"
                                                min="0"
                                                value={data.experience_years}
                                                onChange={(e) => setData('experience_years', parseInt(e.target.value) || 0)}
                                            />
                                            {errors.experience_years && <p className="text-sm text-red-500">{errors.experience_years}</p>}
                                        </div>
                                        <div className="flex items-center space-x-2 pt-8">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            />
                                            <Label htmlFor="is_active" className="cursor-pointer">
                                                Active Coach
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2 border-t py-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/admin/coaches">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Update Coach'}
                                        <Save className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
