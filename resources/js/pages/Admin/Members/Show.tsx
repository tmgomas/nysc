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
    Loader2,
    Pencil
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
import { Checkbox } from "@/components/ui/checkbox"
import { showConfirm, showInput, showLoading, closeLoading } from '@/utils/sweetalert'

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
    due_date: string | number | Date;
    notes: string;
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
    availableSports: {
        id: string;
        name: string;
        monthly_fee: number;
    }[];
}

export default function Show({ member, stats, availableSports }: Props) {
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isSuspendOpen, setIsSuspendOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [selectedAmount, setSelectedAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // Sports Management
    const [isEditSportsOpen, setIsEditSportsOpen] = useState(false);
    const [selectedSports, setSelectedSports] = useState<string[]>([]); // Will be populated on open

    React.useEffect(() => {
        if (isEditSportsOpen) {
            setSelectedSports(member.sports.map(s => s.id));
        }
    }, [isEditSportsOpen, member]);

    const handleUpdateSports = async () => {
        // Close modal first to avoid z-index issues with Sweet Alert
        setIsEditSportsOpen(false);

        // Small delay to ensure modal is fully closed
        await new Promise(resolve => setTimeout(resolve, 100));

        const result = await showConfirm(
            'Update Sports?',
            'This will update the member\'s enrolled sports and generate new payment schedules if needed.'
        );

        if (result.isConfirmed) {
            showLoading('Updating sports...', 'Please wait');
            router.put(route('admin.members.update-sports', member.id), {
                sport_ids: selectedSports
            }, {
                onSuccess: () => {
                    closeLoading();
                },
                onFinish: () => closeLoading()
            });
        } else {
            // If cancelled, reopen the modal
            setIsEditSportsOpen(true);
        }
    };

    const toggleSport = (sportId: string) => {
        setSelectedSports(current =>
            current.includes(sportId)
                ? current.filter(id => id !== sportId)
                : [...current, sportId]
        );
    };

    const handlePayment = async () => {
        if (!selectedScheduleId) return;

        // Close modal first to avoid z-index issues
        setIsPaymentOpen(false);

        // Small delay to ensure modal is fully closed
        await new Promise(resolve => setTimeout(resolve, 100));

        const confirmed = await showConfirm(
            'Record Payment?',
            'Do you want to record this payment?'
        );

        if (!confirmed.isConfirmed) {
            // If cancelled, reopen the modal
            setIsPaymentOpen(true);
            return;
        }

        // Check if "ALL" option selected
        if (selectedScheduleId.startsWith('ALL:')) {
            const [_, monthYear] = selectedScheduleId.split(':');
            showLoading('Recording payment...', 'Please wait');
            router.post(`/admin/payments`, {
                member_id: member.id,
                type: 'monthly',
                payment_method: paymentMethod,
                month_year: monthYear,
                sport_id: null, // Indicates pay for all
            }, {
                onSuccess: () => {
                    setSelectedScheduleId('');
                },
                onFinish: () => closeLoading()
            });
            return;
        }

        if (selectedScheduleId.startsWith('PAYMENT:')) {
            const paymentId = selectedScheduleId.split(':')[1];
            showLoading('Recording payment...', 'Please wait');
            router.put(route('admin.payments.mark-as-paid', paymentId), {
                payment_method: paymentMethod
            }, {
                onSuccess: () => {
                    setSelectedScheduleId('');
                },
                onFinish: () => closeLoading()
            });
            return;
        }

        const schedule = member.payment_schedules.find(s => s.id === selectedScheduleId);
        if (!schedule) return;

        showLoading('Recording payment...', 'Please wait');
        router.post(`/admin/payments`, {
            member_id: member.id,
            type: 'monthly',
            payment_method: paymentMethod,
            month_year: schedule.month_year,
            sport_id: schedule.sport_id,
        }, {
            onSuccess: () => {
                setSelectedScheduleId('');
            },
            onFinish: () => closeLoading()
        });
    };

    // Update selected amount when schedule changes
    React.useEffect(() => {
        if (selectedScheduleId) {
            if (selectedScheduleId.startsWith('ALL:')) {
                const [_, monthYear] = selectedScheduleId.split(':');
                const total = member.payment_schedules
                    .filter(s => s.status === 'pending' && s.month_year === monthYear)
                    .reduce((sum, s) => sum + Number(s.amount), 0);
                setSelectedAmount(total);
            } else if (selectedScheduleId.startsWith('PAYMENT:')) {
                const paymentId = selectedScheduleId.split(':')[1];
                const payment = member.payments.find(p => p.id === paymentId);
                if (payment) {
                    setSelectedAmount(payment.amount);
                }
            } else {
                const schedule = member.payment_schedules.find(s => s.id === selectedScheduleId);
                if (schedule) {
                    setSelectedAmount(schedule.amount);
                }
            }
        } else {
            setSelectedAmount(stats.total_monthly_fee); // Default or explicit 0?
        }
    }, [selectedScheduleId, member.payment_schedules]);

    const handleApprove = async () => {
        const result = await showConfirm(
            'Approve Member?',
            `Do you want to approve ${member.full_name}? This will create their user account.`
        );

        if (result.isConfirmed) {
            showLoading('Approving member...', 'Please wait');
            router.post(route('admin.members.approve', member.id), {}, {
                onFinish: () => closeLoading()
            });
        }
    };

    const handleSuspend = async () => {
        const result = await showInput(
            'Suspend Member',
            'textarea',
            'Enter reason for suspension...'
        );

        if (result.isConfirmed && result.value) {
            showLoading('Suspending member...', 'Please wait');
            router.post(route('admin.members.suspend', member.id), {
                reason: result.value
            }, {
                onSuccess: () => {
                    setIsSuspendOpen(false);
                    closeLoading();
                },
                onFinish: () => closeLoading()
            });
        }
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

                                            {/* Pending One-off Payments (Admission etc) */}
                                            {member.payments
                                                .filter(p => p.status === 'pending')
                                                .map(payment => (
                                                    <SelectItem key={payment.id} value={`PAYMENT:${payment.id}`}>
                                                        {payment.type === 'admission' ? 'Admission Fee' : payment.type} - {payment.notes || 'Pending'} (Rs. {Number(payment.amount).toFixed(2)})
                                                    </SelectItem>
                                                ))}

                                            {member.payments.filter(p => p.status === 'pending').length > 0 &&
                                                member.payment_schedules.filter(s => s.status === 'pending').length > 0 && (
                                                    <SelectItem value="DIVIDER_1" disabled className="text-muted-foreground text-xs font-semibold bg-muted/30 pl-2">
                                                        --- Monthly Schedules ---
                                                    </SelectItem>
                                                )}

                                            {/* Render "Pay All" options for months with multiple pending payments */}
                                            {Array.from(new Set(member.payment_schedules.filter(s => s.status === 'pending').map(s => s.month_year)))
                                                .map(month => {
                                                    const schedules = member.payment_schedules.filter(s => s.status === 'pending' && s.month_year === month);
                                                    if (schedules.length > 1) {
                                                        const total = schedules.reduce((sum, s) => sum + Number(s.amount), 0);
                                                        return (
                                                            <SelectItem key={`ALL:${month}`} value={`ALL:${month}`} className="font-semibold text-primary">
                                                                {month} - All Sports (Total Rs. {total.toFixed(2)})
                                                            </SelectItem>
                                                        );
                                                    }
                                                    return null;
                                                })}

                                            {/* Divider if needed? No, Select handles it fine */}

                                            {member.payment_schedules
                                                .filter(s => s.status === 'pending')
                                                .map(schedule => (
                                                    <SelectItem key={schedule.id} value={schedule.id}>
                                                        {schedule.month_year} - {schedule.sport?.name || 'General'} (Rs. {Number(schedule.amount).toFixed(2)})
                                                    </SelectItem>
                                                ))}

                                            {(member.payment_schedules.filter(s => s.status === 'pending').length === 0 &&
                                                member.payments.filter(p => p.status === 'pending').length === 0) && (
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



                    {/* Manage Sports Dialog */}
                    <Dialog open={isEditSportsOpen} onOpenChange={setIsEditSportsOpen}>
                        <DialogContent className="max-h-[90vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Manage Sports Enrollment</DialogTitle>
                                <DialogDescription>
                                    Select the sports this member should be enrolled in. Unselecting a sport will remove them from future schedules.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 gap-3">
                                    {availableSports.map((sport) => (
                                        <div key={sport.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id={`sport-${sport.id}`}
                                                checked={selectedSports.includes(sport.id)}
                                                onCheckedChange={() => toggleSport(sport.id)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor={`sport-${sport.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {sport.name}
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Monthly Fee: Rs. {Number(sport.monthly_fee).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-800 border-amber-200 border rounded-md text-xs">
                                    <h4 className="font-semibold mb-1">Important Note</h4>
                                    Updating enrollments will recalculate future payment schedules. Past payments remain unaffected.
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditSportsOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateSports} disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Enrollments
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
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Dumbbell className="h-5 w-5" />
                                        Sports Enrollment
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditSportsOpen(true)}>
                                        <Pencil className="h-3.5 w-3.5 mr-2" />
                                        Manage
                                    </Button>
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
                                        {(member.payment_schedules && member.payment_schedules.filter(s => s.status === 'pending').length > 0) || (member.payments && member.payments.filter(p => p.status === 'pending').length > 0) ? (
                                            <div className="border rounded-lg overflow-hidden">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                                                        <tr>
                                                            <th className="p-3 font-medium">Description</th>
                                                            <th className="p-3 font-medium">Sport</th>
                                                            <th className="p-3 font-medium text-right">Amount</th>
                                                            <th className="p-3 font-medium">Due Date</th>
                                                            <th className="p-3 font-medium text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {member.payments.filter(p => p.status === 'pending').map(payment => (
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
                                                                <td className="p-3 text-right">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs"
                                                                        onClick={() => {
                                                                            setSelectedScheduleId(`PAYMENT:${payment.id}`);
                                                                            setIsPaymentOpen(true);
                                                                        }}
                                                                    >
                                                                        Pay Now
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {member.payment_schedules.filter(s => s.status === 'pending').slice(0, 5).map(schedule => (
                                                            <tr key={schedule.id} className="hover:bg-muted/50 transition-colors">
                                                                <td className="p-3 font-medium">{schedule.month_year} - Monthly Fee</td>
                                                                <td className="p-3">
                                                                    <Badge variant="outline" className="font-normal">
                                                                        {schedule.sport?.name || 'General'}
                                                                    </Badge>
                                                                </td>
                                                                <td className="p-3 text-right font-mono">Rs. {Number(schedule.amount).toFixed(2)}</td>
                                                                <td className="p-3 text-muted-foreground">{new Date(schedule.due_date).toLocaleDateString()}</td>
                                                                <td className="p-3 text-right">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs"
                                                                        onClick={() => {
                                                                            setSelectedScheduleId(schedule.id);
                                                                            setIsPaymentOpen(true);
                                                                        }}
                                                                    >
                                                                        Pay Now
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
                                                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                                                        <tr>
                                                            <th className="p-3 font-medium">Paid Date</th>
                                                            <th className="p-3 font-medium">Description</th>
                                                            <th className="p-3 font-medium">Sport</th>
                                                            <th className="p-3 font-medium text-right">Amount</th>
                                                            <th className="p-3 font-medium text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {member.payments.slice(0, 10).map(payment => (
                                                            <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                                                                <td className="p-3 text-muted-foreground">
                                                                    {new Date(payment.paid_date).toLocaleDateString()}
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className="capitalize font-medium block text-foreground">
                                                                        {payment.type}
                                                                    </span>
                                                                    {payment.month_year && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            For {payment.month_year}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="p-3">
                                                                    <Badge variant="secondary" className="font-normal text-xs">
                                                                        {payment.sport?.name || 'General'}
                                                                    </Badge>
                                                                </td>
                                                                <td className="p-3 text-right font-mono">Rs. {Number(payment.amount).toFixed(2)}</td>
                                                                <td className="p-3 text-right">
                                                                    <Badge variant="outline" className={`text-xs ${payment.status === 'verified' ? 'border-green-500 text-green-600 bg-green-50' :
                                                                        payment.status === 'paid' ? 'border-blue-500 text-blue-600 bg-blue-50' : ''
                                                                        }`}>
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
        </AppLayout >
    );
}
