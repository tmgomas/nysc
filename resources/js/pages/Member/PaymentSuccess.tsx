import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle2, Receipt, ArrowRight } from 'lucide-react';

interface Props {
    orderId?: string;
}

export default function PaymentSuccess({ orderId }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Payment Success', href: '/member/payments/success' }]}>
            <Head title="Payment Successful" />

            <div className="py-16 sm:py-24">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8 ring-8 ring-green-50">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-4">
                        Payment Successful!
                    </h1>
                    
                    <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                        Your payment is being processed and your account will be updated shortly. A receipt will be sent to your email.
                    </p>

                    {orderId && (
                        <div className="bg-gray-50 rounded-xl p-4 inline-flex items-center gap-3 border border-gray-200 mb-10 shadow-sm">
                            <Receipt className="w-5 h-5 text-gray-400" />
                            <div className="text-left">
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Order ID</div>
                                <div className="text-gray-900 font-mono font-medium">{orderId}</div>
                            </div>
                        </div>
                    )}

                    <div>
                        <Link
                            href="/member/payments"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all"
                        >
                            Back to Payments
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
