import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function PaymentCancelled() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Payment Cancelled', href: '/member/payments/cancelled' }]}>
            <Head title="Payment Cancelled" />

            <div className="py-16 sm:py-24">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 mb-8 ring-8 ring-amber-50">
                        <AlertTriangle className="w-12 h-12 text-amber-600" />
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-4">
                        Payment Cancelled
                    </h1>
                    
                    <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
                        Your payment process was interrupted or cancelled. No amount has been charged to your account.
                    </p>

                    <div>
                        <Link
                            href="/member/payments"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Try Again
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
