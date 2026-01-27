import React from 'react';
import { Head } from '@inertiajs/react';

interface GuestLayoutProps {
    children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Head>
                <title>NYSC Sports Club</title>
            </Head>

            <nav className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <a href="/" className="text-xl font-bold text-blue-600">
                                    NYSC Sports Club
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href={'/register'}
                                className="text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                                Register
                            </a>
                            <a
                                href={'/login'}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>

            <footer className="border-t border-gray-200 bg-white mt-12">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} NYSC Sports Club. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
