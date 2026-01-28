import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import type { Member } from './types';

interface PaymentsCardProps {
    member: Member;
    onRecordPayment: () => void;
}

export function PaymentsCard({ member, onRecordPayment }: PaymentsCardProps) {
    const pendingPayments = member.payments.filter(p => p.status === 'pending');
    const pendingSchedules = member.payment_schedules.filter(s => s.status === 'pending');
    const recentPayments = member.payments
        .filter(p => p.status === 'paid')
        .sort((a, b) => new Date(b.paid_date).getTime() - new Date(a.paid_date).getTime())
        .slice(0, 5);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payments & Schedules
                </CardTitle>
                {member.status === 'active' && (
                    <Button size="sm" onClick={onRecordPayment}>
                        Record Payment
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Upcoming Due Payments */}
                <div>
                    <h4 className="font-semibold text-sm mb-3">Upcoming Due Payments</h4>
                    {(pendingSchedules.length > 0 || pendingPayments.length > 0) ? (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="p-3 font-medium">Description</th>
                                        <th className="p-3 font-medium">Sport</th>
                                        <th className="p-3 font-medium text-right">Amount</th>
                                        <th className="p-3 font-medium">Due Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {pendingPayments.map(payment => (
                                        <tr key={payment.id} className="hover:bg-muted/50 transition-colors bg-amber-50/50">
                                            <td className="p-3 font-medium">
                                                <div className="flex flex-col">
                                                    <span className="capitalize">{payment.type}</span>
                                                    {payment.notes && <span className="text-xs text-muted-foreground">{payment.notes}</span>}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="font-normal">
                                                    {payment.sport?.name || 'General'}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right font-mono">Rs. {Number(payment.amount).toFixed(2)}</td>
                                            <td className="p-3 text-muted-foreground">{new Date(payment.due_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {pendingSchedules.map(schedule => (
                                        <tr key={schedule.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-3 font-medium">{schedule.month_year}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="font-normal">
                                                    {schedule.sport?.name || 'General'}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right font-mono">Rs. {Number(schedule.amount).toFixed(2)}</td>
                                            <td className="p-3 text-muted-foreground">{new Date(schedule.due_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg">
                            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No pending payments</p>
                        </div>
                    )}
                </div>

                {/* Recent Payment History */}
                <div>
                    <h4 className="font-semibold text-sm mb-3">Recent Payment History</h4>
                    {recentPayments.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="p-3 font-medium">Date</th>
                                        <th className="p-3 font-medium">Description</th>
                                        <th className="p-3 font-medium">Sport</th>
                                        <th className="p-3 font-medium text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentPayments.map(payment => (
                                        <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="p-3 text-muted-foreground">{new Date(payment.paid_date).toLocaleDateString()}</td>
                                            <td className="p-3 font-medium">
                                                <div className="flex flex-col">
                                                    <span className="capitalize">{payment.type}</span>
                                                    {payment.month_year && <span className="text-xs text-muted-foreground">{payment.month_year}</span>}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="font-normal">
                                                    {payment.sport?.name || 'General'}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-right font-mono text-green-600">Rs. {Number(payment.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg">
                            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No payment history</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
