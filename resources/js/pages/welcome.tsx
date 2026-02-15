import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/GuestLayout';

export default function Welcome() {
    return (
        <GuestLayout>
            <Head title="Welcome" />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                            Welcome to NYSC Programs Club
                        </h1>
                        <p className="mx-auto mt-3 max-w-md text-base text-blue-100 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                            Join our community and pursue your passion for programs. We offer a wide range of activities for all skill levels.
                        </p>
                        <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
                            <div className="rounded-md shadow">
                                <a
                                    href="/register"
                                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50 md:py-4 md:px-10 md:text-lg"
                                >
                                    Register Now
                                </a>
                            </div>
                            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                <a
                                    href="/login"
                                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-500 px-8 py-3 text-base font-medium text-white hover:bg-blue-400 md:py-4 md:px-10 md:text-lg"
                                >
                                    Member Login
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Our Programs</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Choose from a variety of programs activities
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {['Cricket', 'Football', 'Basketball', 'Swimming', 'Gym', 'Badminton'].map((program) => (
                            <div key={program} className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
                                <h3 className="text-xl font-semibold text-gray-900">{program}</h3>
                                <p className="mt-2 text-gray-600">
                                    Professional coaching and modern facilities
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-blue-50 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Join hundreds of members who are already enjoying our facilities
                        </p>
                        <div className="mt-8">
                            <a
                                href="/register"
                                className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
                            >
                                Register Today
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
