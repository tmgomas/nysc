import { Card, CardContent } from '@/components/ui/card';
import { Activity, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import type { MemberStatsData as Stats } from './types';

interface MemberStatsProps {
    stats: Stats;
}

export function MemberStats({ stats }: MemberStatsProps) {
    const statCards = [
        {
            title: 'Total Paid',
            value: `Rs. ${Number(stats.total_paid).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Pending Dues',
            value: `Rs. ${Number(stats.total_pending).toLocaleString()}`,
            icon: CreditCard,
            color: stats.has_overdue ? 'text-red-600' : 'text-amber-600',
            bgColor: stats.has_overdue ? 'bg-red-50' : 'bg-amber-50',
        },
        {
            title: 'Monthly Fee',
            value: `Rs. ${Number(stats.total_monthly_fee).toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Attendance',
            value: `${stats.monthly_attendance_count}/${stats.total_attendance_count}`,
            icon: Activity,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            subtitle: 'This Month / Total',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {statCards.map((stat, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </p>
                                <h3 className="text-2xl font-bold mt-2">
                                    {stat.value}
                                </h3>
                                {stat.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.subtitle}
                                    </p>
                                )}
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
