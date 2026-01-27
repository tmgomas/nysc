import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    ChevronLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Activity,
    CreditCard,
    CheckCircle,
    XCircle,
    FileText,
    Shield,
    Clock,
    Heart,
    Dumbbell,
    AlertCircle,
    Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Sport {
    id: string;
    name: string;
    admission_fee: number;
    monthly_fee: number;
    pivot: {
        status: string;
        enrolled_at: string;
    };
}

interface User {
    id: string;
    name: string;
    email: string;
    temporary_password?: string;
}

interface Member {
    id: string;
    member_number: string;
    full_name: string;
    calling_name: string;
    nic_passport: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    contact_number: string;
    address: string;
    email?: string;

    // Medical
    blood_group?: string;
    medical_history?: string;
    allergies?: string;

    // Emergency
    emergency_contact: string;
    emergency_number: string;

    // Background
    school_occupation?: string;
    membership_type: string;
    fitness_level: string;
    jersey_size?: string;
    preferred_training_days?: string[];

    // Status
    status: 'pending' | 'active' | 'suspended' | 'inactive';
    registration_date: string;

    // Relations
    user?: User;
    sports: Sport[];

    // Meta
    created_at: string;
    updated_at: string;
    payments: Payment[];
    payment_schedules: PaymentSchedule[];
}

interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    month_year: string | null;
    created_at: string;
    paid_date: string;
    sport?: {
        name: string;
    };
}

interface PaymentSchedule {
    id: string;
    month_year: string;
    amount: number;
    status: string;
    due_date: string;
    sport_id?: string;
    sport?: {
        name: string;
    };
}

interface Props {
    member: Member;
    stats: {
        total_paid: number;
        total_pending: number;
        has_overdue: boolean;
        monthly_attendance_count: number;
        total_attendance_count: number;
        active_sports_count: number;
        total_monthly_fee: number;
        last_payment: string | null;
        next_due_payment: string | null;
        last_attendance: string | null;
    };
}

export default function Show({ member, stats }: Props) {
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isSuspendOpen, setIsSuspendOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [selectedAmount, setSelectedAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const handlePayment = () => {
        if (!selectedScheduleId) return;

        const schedule = member.payment_schedules.find(s => s.id === selectedScheduleId);
        if (!schedule) return;

        setProcessing(true);
        router.post(`/admin/payments`, {
            member_id: member.id,
            type: 'monthly',
            payment_method: paymentMethod,
            month_year: schedule.month_year,
            sport_id: schedule.sport_id,
        }, {
            onSuccess: () => {
                setIsPaymentOpen(false);
                setProcessing(false);
                setSelectedScheduleId('');
            },
            onError: () => setProcessing(false)
        });
    };

    // Update selected amount when schedule changes
    React.useEffect(() => {
        if (selectedScheduleId) {
            const schedule = member.payment_schedules.find(s => s.id === selectedScheduleId);
            if (schedule) {
                setSelectedAmount(schedule.amount);
            }
        } else {
            setSelectedAmount(stats.total_monthly_fee); // Default or explicit 0?
        }
    }, [selectedScheduleId, member.payment_schedules]);

    const handleApprove = () => {
        setProcessing(true);
        router.post(`/admin/members/${member.id}/approve`, {}, {
            onSuccess: () => {
                setIsApproveOpen(false);
                setProcessing(false);
            },
            onError: () => setProcessing(false)
        });
    };

    const handleSuspend = () => {
        if (!suspendReason) return;
        setProcessing(true);
        router.post(`/admin/members/${member.id}/suspend`, { reason: suspendReason }, {
            onSuccess: () => {
                setIsSuspendOpen(false);
                setProcessing(false);
                setSuspendReason('');
            },
            onError: () => setProcessing(false)
        });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'default',
            pending: 'secondary',
            suspended: 'destructive',
            inactive: 'outline',
        };
        return variants[status as keyof typeof variants] || 'outline';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Members', href: '/admin/members' },
                { title: member.member_number, href: `/admin/members/${member.id}` },
            ]}
        >
            <Head title={`Member - ${member.member_number}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/admin/members">
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {member.full_name}
                                </h2>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Badge variant="outline" className="font-mono">
                                        {member.member_number}
                                    </Badge>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Badge variant={getStatusBadge(member.status) as any}>
                                            {member.status.toUpperCase()}
                                        </Badge>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {member.status === 'pending' && (
                                <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Approve Registration
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Approve Member Registration</DialogTitle>
                                            <DialogDescription>
                                                This will activate the member account, generate payment schedules, and create a user login.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="py-4 space-y-4">
                                            <div className="p-4 rounded-lg bg-muted text-sm space-y-2">
                                                <div className="flex justify-between font-medium">
                                                    <span>Total Admission Fee:</span>
                                                    <span>Rs. {member.sports.reduce((sum, sport) => sum + Number(sport.admission_fee), 0).toFixed(2)}</span>
                                                </div>
                                                <p className="text-muted-foreground text-xs">
                                                    Please collect this amount before approving the member.
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="confirmPayment"
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    checked={isPaymentConfirmed}
                                                    onChange={(e) => setIsPaymentConfirmed(e.target.checked)}
                                                />
                                                <Label htmlFor="confirmPayment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    I confirm that the admission fee has been paid
                                                </Label>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleApprove} disabled={processing || !isPaymentConfirmed}>
                                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Confirm Approval
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {member.status === 'active' && (
                                <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Suspend Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Suspend Member</DialogTitle>
                                            <DialogDescription>
                                                Please provide a reason for suspending this member.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="reason">Reason for Suspension</Label>
                                            <Textarea
                                                id="reason"
                                                value={suspendReason}
                                                onChange={(e) => setSuspendReason(e.target.value)}
                                                placeholder="e.g. Non-payment of dues, violation of rules..."
                                                className="mt-2"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleSuspend}
                                                disabled={processing || !suspendReason}
                                            >
                                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Suspend Member
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {/* Payment Dialog */}
                    <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Record Monthly Payment</DialogTitle>
                                <DialogDescription>
                                    Record a manual payment for a specific month.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Payment</Label>
                                    <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select month/sport to pay" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {member.payment_schedules
                                                .filter(s => s.status === 'pending')
                                                .map(schedule => (
                                                    <SelectItem key={schedule.id} value={schedule.id}>
                                                        {schedule.month_year} - {schedule.sport?.name || 'General'} (Rs. {schedule.amount})
                                                    </SelectItem>
                                                ))}
                                            {member.payment_schedules.filter(s => s.status === 'pending').length === 0 && (
                                                <SelectItem value="" disabled>No pending schedules</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="online">Online</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="p-4 bg-muted rounded text-sm">
                                    <span className="font-semibold">Fee Amount:</span> Rs. {Number(selectedAmount) > 0 ? Number(selectedAmount).toFixed(2) : '0.00'}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                                <Button onClick={handlePayment} disabled={processing || !selectedScheduleId}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Record Payment
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Info */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6 sm:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">Full Name</Label>
                                        <p className="font-medium">{member.full_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Calling Name (ID)</Label>
                                        <p className="font-medium">{member.calling_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">NIC/Passport</Label>
                                        <p className="font-medium">{member.nic_passport}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Date of Birth</Label>
                                        <p className="font-medium">{member.date_of_birth}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Gender</Label>
                                        <p className="capitalize font-medium">{member.gender}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label className="text-muted-foreground">Address</Label>
                                        <p className="font-medium">{member.address}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        Contact Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6 sm:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">Primary Contact</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{member.contact_number}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Email Address</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="font-medium">{member.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Separator className="my-2" />
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Emergency Contact</Label>
                                        <p className="font-medium">{member.emergency_contact}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Emergency Number</Label>
                                        <p className="font-medium text-red-600">{member.emergency_number}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Medical Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Medical History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6 sm:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">Blood Group</Label>
                                        <p className="font-medium">{member.blood_group || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Allergies</Label>
                                        <p className="font-medium text-amber-600">{member.allergies || 'None'}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label className="text-muted-foreground">Medical Conditions</Label>
                                        <p className="font-medium">{member.medical_history || 'None reported'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sports Enrollment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Dumbbell className="h-5 w-5" />
                                        Sports Enrollment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {member.sports.map((sport) => (
                                            <div key={sport.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold">{sport.name}</h4>
                                                    <div className="flex gap-2 text-sm text-muted-foreground">
                                                        <span>Monthly: Rs. {sport.monthly_fee}</span>
                                                        <span>•</span>
                                                        <span>Enrolled: {new Date(sport.pivot.enrolled_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <Badge variant={sport.pivot.status === 'active' ? 'default' : 'secondary'}>
                                                    {sport.pivot.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment History & Schedules */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Payments & Schedules
                                    </CardTitle>
                                    {member.status === 'active' && (
                                        <Button size="sm" onClick={() => setIsPaymentOpen(true)}>
                                            Record Payment
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Unpaid Schedules */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3">Upcoming Due Payments</h4>
                                        {member.payment_schedules && member.payment_schedules.filter(s => s.status === 'pending').length > 0 ? (
                                            <div className="border rounded-lg overflow-hidden">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-muted/50">
                                                        <tr>
                                                            <th className="p-3 font-medium">Month</th>
                                                            <th className="p-3 font-medium">Sport</th>
                                                            <th className="p-3 font-medium">Amount</th>
                                                            <th className="p-3 font-medium">Due Date</th>
                                                            <th className="p-3 font-medium">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {member.payment_schedules.filter(s => s.status === 'pending').slice(0, 5).map(schedule => (
                                                            <tr key={schedule.id} className="border-t">
                                                                <td className="p-3">{schedule.month_year}</td>
                                                                <td className="p-3 text-muted-foreground">{schedule.sport?.name || '-'}</td>
                                                                <td className="p-3">Rs. {schedule.amount}</td>
                                                                <td className="p-3">{new Date(schedule.due_date).toLocaleDateString()}</td>
                                                                <td className="p-3">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 text-primary"
                                                                        onClick={() => {
                                                                            setSelectedScheduleId(schedule.id);
                                                                            setIsPaymentOpen(true);
                                                                        }}
                                                                    >
                                                                        Pay
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg border-dashed">
                                                No pending payments found.
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment History */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-3">Recent Payment History</h4>
                                        {member.payments && member.payments.length > 0 ? (
                                            <div className="border rounded-lg overflow-hidden">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-muted/50">
                                                        <tr>
                                                            <th className="p-3 font-medium">Date</th>
                                                            <th className="p-3 font-medium">Type</th>
                                                            <th className="p-3 font-medium">Sport</th>
                                                            <th className="p-3 font-medium">Amount</th>
                                                            <th className="p-3 font-medium">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {member.payments.slice(0, 5).map(payment => (
                                                            <tr key={payment.id} className="border-t">
                                                                <td className="p-3">{new Date(payment.paid_date).toLocaleDateString()}</td>
                                                                <td className="p-3 capitalize">{payment.type} {payment.month_year && `(${payment.month_year})`}</td>
                                                                <td className="p-3 text-muted-foreground">{payment.sport?.name || '-'}</td>
                                                                <td className="p-3">Rs. {payment.amount}</td>
                                                                <td className="p-3">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {payment.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg border-dashed">
                                                No payment history.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Status & Meta */}
                        <div className="space-y-6">
                            {/* Membership Status */}
                            <Card className={member.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : ''}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Shield className="h-5 w-5" />
                                        Membership Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Current Status</span>
                                        <Badge variant={getStatusBadge(member.status) as any}>
                                            {member.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Type</span>
                                        <span className="font-medium capitalize">{member.membership_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Since</span>
                                        <span className="font-medium">{new Date(member.registration_date).toLocaleDateString()}</span>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm">Account Statistics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <div className="text-xs text-muted-foreground">Monthly Fee</div>
                                                <div className="text-lg font-bold">Rs. {stats.total_monthly_fee}</div>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <div className="text-xs text-muted-foreground">Active Sports</div>
                                                <div className="text-lg font-bold">{stats.active_sports_count}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {member.user?.temporary_password && (
                                        <div className="rounded-md bg-yellow-100 p-3 mt-4">
                                            <p className="text-xs font-semibold text-yellow-800">Temporary Password</p>
                                            <code className="mt-1 block bg-yellow-200 px-2 py-1 rounded text-sm text-yellow-900 break-all select-all">
                                                {member.user.temporary_password}
                                            </code>
                                            <p className="text-[10px] text-yellow-700 mt-1">
                                                Please share this with the member securely. It will disappear after reload/navigation.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Additional Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Additional Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground">School / Occupation</Label>
                                        <p className="font-medium">{member.school_occupation || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Jersey Size</Label>
                                        <p className="font-medium">{member.jersey_size || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Fitness Level</Label>
                                        <p className="font-medium capitalize">{member.fitness_level}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Preferred Training Days</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {member.preferred_training_days && member.preferred_training_days.length > 0 ? (
                                                member.preferred_training_days.map(day => (
                                                    <Badge key={day} variant="secondary" className="text-xs">
                                                        {day}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">None specified</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
