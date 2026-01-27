import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Sport {
    id: string;
    name: string;
    description: string | null;
    admission_fee: number;
    monthly_fee: number;
    capacity: number | null;
    is_active: boolean;
    members_count?: number;
}

interface Props {
    sports: Sport[];
}

export default function Index({ sports }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Sports', href: '/admin/sports' }]}>
            <Head title="Sports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Sports Management
                        </h2>
                        <Link
                            href="/admin/sports/create"
                            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                        >
                            Add New Sport
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sports.map((sport) => (
                            <div
                                key={sport.id}
                                className="overflow-hidden bg-white shadow-sm sm:rounded-lg hover:shadow-md transition"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">{sport.name}</h3>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${sport.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {sport.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {sport.description && (
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                            {sport.description}
                                        </p>
                                    )}

                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Admission Fee:</span>
                                            <span className="font-semibold text-gray-900">
                                                Rs. {sport.admission_fee.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Monthly Fee:</span>
                                            <span className="font-semibold text-gray-900">
                                                Rs. {sport.monthly_fee.toLocaleString()}
                                            </span>
                                        </div>
                                        {sport.capacity && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Capacity:</span>
                                                <span className="font-semibold text-gray-900">
                                                    {sport.members_count || 0} / {sport.capacity}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex gap-2">
                                        <Link
                                            href={`/admin/sports/${sport.id}/edit`}
                                            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            href={`/admin/sports/${sport.id}`}
                                            className="flex-1 rounded-md bg-orange-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-orange-700"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
