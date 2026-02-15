import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    XCircle,
    User,
    CreditCard,
    Dumbbell,
    Activity,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Shield,
    Star,
    TrendingUp,
    DollarSign,
    Heart,
    Bookmark,
    QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useInput } from '@/components/ui/input-dialog';


// Import member components
import { PersonalInfoCard } from '@/components/members/PersonalInfoCard';
import { ContactInfoCard } from '@/components/members/ContactInfoCard';
import { MedicalInfoCard } from '@/components/members/MedicalInfoCard';
import { ProgramsEnrollmentCard } from '@/components/members/ProgramsEnrollmentCard';
import { PaymentsCard } from '@/components/members/PaymentsCard';
import MemberQRCode from '@/components/QRCode/MemberQRCode';
import MemberNFCCard from '@/components/NFC/MemberNFCCard';
import MemberRFIDCard from '@/components/RFID/MemberRFIDCard';

// Import dialogs
import { ApproveDialog } from '@/components/members/dialogs/ApproveDialog';
import { ManageProgramsDialog } from '@/components/members/dialogs/ManageProgramsDialog';
import { PaymentDialog } from '@/components/members/dialogs/PaymentDialog';

// Import types
import type { Member, MemberStatsData as Stats, AvailableProgram } from '@/components/members/types';

interface Props {
    member: Member;
    stats: Stats;
    availablePrograms: AvailableProgram[];
}

export default function Show({ member, stats, availablePrograms }: Props) {
    // Dialog states
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isEditProgramsOpen, setIsEditProgramsOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    // Form states
    const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
    const [selectedAmount, setSelectedAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const { confirm, ConfirmDialog } = useConfirm();
    const { prompt, InputDialog } = useInput();



    // Initialize selected programs when dialog opens
    React.useEffect(() => {
        if (isEditProgramsOpen) {
            setSelectedPrograms(member.programs.map(s => s.id));
        }
    }, [isEditProgramsOpen, member]);

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
            setSelectedAmount(stats.total_monthly_fee);
        }
    }, [selectedScheduleId, member.payment_schedules]);

    // Handlers
    const handleApprove = () => {
        setIsApproveOpen(false);
        toast.promise(
            new Promise((resolve, reject) => {
                router.post(route('admin.members.approve', member.id), {}, {
                    onSuccess: () => resolve(member.full_name),
                    onError: () => reject()
                });
            }),
            {
                loading: 'Approving member...',
                success: (name) => `${name} has been approved successfully!`,
                error: 'Failed to approve member',
            }
        );
    };

    const handleSuspend = async () => {
        const reason = await prompt({
            title: 'Suspend Member',
            description: 'Please provide a reason for suspending this member.',
            label: 'Reason',
            placeholder: 'Enter reason for suspension...',
            type: 'textarea',
            confirmText: 'Suspend',
        });

        if (reason) {
            toast.promise(
                new Promise((resolve, reject) => {
                    router.post(route('admin.members.suspend', member.id), {
                        reason: reason
                    }, {
                        onSuccess: () => resolve(member.full_name),
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Suspending member...',
                    success: (name) => `${name} has been suspended`,
                    error: 'Failed to suspend member',
                }
            );
        }
    };

    const handleReactivate = async () => {
        const confirmed = await confirm({
            title: 'Reactivate Member',
            description: `Are you sure you want to reactivate ${member.full_name}? This will restore their active status.`,
            confirmText: 'Reactivate',
            cancelText: 'Cancel',
        });

        if (confirmed) {
            toast.promise(
                new Promise((resolve, reject) => {
                    router.post(route('admin.members.reactivate', member.id), {}, {
                        onSuccess: () => resolve(member.full_name),
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Reactivating member...',
                    success: (name) => `${name} has been reactivated successfully!`,
                    error: 'Failed to reactivate member',
                }
            );
        }
    };

    const handleUpdatePrograms = async () => {
        setIsEditProgramsOpen(false);

        const confirmed = await confirm({
            title: 'Update Programs',
            description: "This will update the member's enrolled programs and generate new payment schedules if needed.",
            confirmText: 'Update',
            cancelText: 'Cancel',
        });

        if (confirmed) {
            toast.promise(
                new Promise((resolve, reject) => {
                    router.put(route('admin.members.update-programs', member.id), {
                        program_ids: selectedPrograms
                    }, {
                        onSuccess: () => resolve(member.full_name),
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Updating programs...',
                    success: 'Programs updated successfully!',
                    error: 'Failed to update programs',
                }
            );
        } else {
            setIsEditProgramsOpen(true);
        }
    };

    const handlePayment = async () => {
        // Check if bulk mode or single mode
        const isBulkMode = selectedScheduleIds && selectedScheduleIds.length > 0;

        if (!isBulkMode && !selectedScheduleId) return;

        setIsPaymentOpen(false);

        const confirmMessage = isBulkMode
            ? `Do you want to record payment for ${selectedScheduleIds.length} selected schedule${selectedScheduleIds.length > 1 ? 's' : ''}?`
            : 'Do you want to record this payment?';

        const confirmed = await confirm({
            title: 'Record Payment',
            description: confirmMessage,
            confirmText: 'Record Payment',
            cancelText: 'Cancel',
        });

        if (!confirmed) {
            setIsPaymentOpen(true);
            return;
        }

        if (isBulkMode) {
            // Bulk payment mode - process multiple schedules
            toast.promise(
                new Promise((resolve, reject) => {
                    router.post(`/admin/payments/bulk`, {
                        member_id: member.id,
                        schedule_ids: selectedScheduleIds,
                        payment_method: paymentMethod,
                    }, {
                        onSuccess: () => {
                            setSelectedScheduleIds([]);
                            setSelectedScheduleId('');
                            resolve(selectedScheduleIds.length);
                        },
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Recording bulk payment...',
                    success: (count) => `${count} payment(s) recorded successfully!`,
                    error: 'Failed to record payments',
                }
            );
        } else if (selectedScheduleId.startsWith('ALL:')) {
            const [_, monthYear] = selectedScheduleId.split(':');
            toast.promise(
                new Promise((resolve, reject) => {
                    router.post(`/admin/payments`, {
                        member_id: member.id,
                        type: 'monthly',
                        payment_method: paymentMethod,
                        month_year: monthYear,
                        program_id: null,
                    }, {
                        onSuccess: () => {
                            setSelectedScheduleId('');
                            resolve(monthYear);
                        },
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Recording payment...',
                    success: (month) => `Payment for ${month} recorded successfully!`,
                    error: 'Failed to record payment',
                }
            );
        } else if (selectedScheduleId.startsWith('PAYMENT:')) {
            const paymentId = selectedScheduleId.split(':')[1];
            toast.promise(
                new Promise((resolve, reject) => {
                    router.put(route('admin.payments.mark-as-paid', paymentId), {
                        payment_method: paymentMethod
                    }, {
                        onSuccess: () => {
                            setSelectedScheduleId('');
                            resolve(true);
                        },
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Marking payment as paid...',
                    success: 'Payment marked as paid successfully!',
                    error: 'Failed to mark payment as paid',
                }
            );
        } else {
            const schedule = member.payment_schedules.find(s => s.id === selectedScheduleId);
            if (!schedule) return;

            toast.promise(
                new Promise((resolve, reject) => {
                    router.post(`/admin/payments`, {
                        member_id: member.id,
                        type: 'monthly',
                        payment_method: paymentMethod,
                        month_year: schedule.month_year,
                        program_id: schedule.program_id,
                    }, {
                        onSuccess: () => {
                            setSelectedScheduleId('');
                            resolve(schedule.month_year);
                        },
                        onError: () => reject()
                    });
                }),
                {
                    loading: 'Recording payment...',
                    success: (month) => `Payment for ${month} recorded successfully!`,
                    error: 'Failed to record payment',
                }
            );
        }
    };

    const toggleProgram = (sportId: string) => {
        setSelectedPrograms(current =>
            current.includes(sportId)
                ? current.filter(id => id !== sportId)
                : [...current, sportId]
        );
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
            <ConfirmDialog />
            <InputDialog />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Profile Photo Placeholder */}
                                <div className="flex-shrink-0">
                                    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        <User className="w-16 h-16 text-primary/40" />
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight">{member.full_name}</h1>
                                            <p className="text-muted-foreground mt-1">
                                                {member.membership_type.charAt(0).toUpperCase() + member.membership_type.slice(1)} Member
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Badge variant="outline" className="font-mono">
                                                    #{member.member_number}
                                                </Badge>
                                                <Badge variant={getStatusBadge(member.status) as any}>
                                                    {member.status.toUpperCase()}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <Star className="h-4 w-4 fill-current" />
                                                    <span className="text-sm font-semibold">
                                                        {stats.monthly_attendance_count > 0 ? '4.5' : 'New'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Bookmark className="h-4 w-4 mr-2" />
                                                Bookmark
                                            </Button>
                                            {member.status === 'pending' && (
                                                <Button size="sm" onClick={() => setIsApproveOpen(true)}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve
                                                </Button>
                                            )}
                                            {member.status === 'active' && (
                                                <Button variant="destructive" size="sm" onClick={handleSuspend}>
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Suspend
                                                </Button>
                                            )}
                                            {member.status === 'suspended' && (
                                                <Button variant="default" size="sm" onClick={handleReactivate}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Reactivate
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                                <DollarSign className="h-3 w-3" />
                                                <span>Total Paid</span>
                                            </div>
                                            <div className="text-lg font-bold">Rs. {Number(stats.total_paid).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                                <CreditCard className="h-3 w-3" />
                                                <span>Pending</span>
                                            </div>
                                            <div className="text-lg font-bold text-amber-600">Rs. {Number(stats.total_pending).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                                <Activity className="h-3 w-3" />
                                                <span>Attendance</span>
                                            </div>
                                            <div className="text-lg font-bold">{stats.monthly_attendance_count}/{stats.total_attendance_count}</div>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                                <Dumbbell className="h-3 w-3" />
                                                <span>Programs</span>
                                            </div>
                                            <div className="text-lg font-bold">{stats.active_programs_count}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content with Sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Contact Info Sidebar */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">CONTACT INFORMATION</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <div className="text-sm text-muted-foreground">Phone:</div>
                                            <div className="font-medium text-sm">{member.contact_number}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <div className="text-sm text-muted-foreground">E-mail:</div>
                                            <div className="font-medium text-sm break-all">{member.email || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <div className="text-sm text-muted-foreground">Address:</div>
                                            <div className="font-medium text-sm">{member.address}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Programs Enrollment Sidebar */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">PROGRAMS</CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        {member.programs.filter(s => s.pivot.status === 'active').length}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {member.programs.map((program) => (
                                        <div key={program.id} className="p-3 rounded-md bg-muted/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{program.name}</span>
                                                <Badge variant={program.pivot.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                    {program.pivot.status}
                                                </Badge>
                                            </div>
                                            {program.pivot.program_reference && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <span className="font-mono bg-background px-2 py-0.5 rounded border">
                                                        {program.pivot.program_reference}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() => setIsEditProgramsOpen(true)}
                                    >
                                        Manage Programs
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Additional Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">BASIC INFORMATION</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Birthday:</div>
                                        <div className="font-medium">{member.date_of_birth}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Gender:</div>
                                        <div className="font-medium capitalize">{member.gender}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Blood Group:</div>
                                        <div className="font-medium">{member.blood_group || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Fitness Level:</div>
                                        <div className="font-medium capitalize">{member.fitness_level}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* QR Code Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <QrCode className="h-4 w-4" />
                                        MEMBER QR CODE
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MemberQRCode
                                        memberId={member.id}
                                        registrationNumber={member.member_number}
                                        callingName={member.calling_name}
                                        showDownload={true}
                                        size="md"
                                    />
                                </CardContent>
                            </Card>

                            {/* NFC Tag Card */}
                            <MemberNFCCard
                                memberId={member.id}
                                nfcTagId={member.nfc_tag_id ?? null}
                                memberName={member.calling_name}
                                onUpdate={() => router.reload()}
                            />

                            {/* RFID Card */}
                            <MemberRFIDCard
                                memberId={member.id}
                                rfidCardId={member.rfid_card_id ?? null}
                                memberName={member.calling_name}
                                onUpdate={() => router.reload()}
                            />
                        </div>

                        {/* Right Content Area with Tabs */}
                        <div className="lg:col-span-3">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                                    <TabsTrigger
                                        value="overview"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        <Activity className="h-4 w-4 mr-2" />
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="details"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Details
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="payments"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Payments
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="programs"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                                    >
                                        <Dumbbell className="h-4 w-4 mr-2" />
                                        Programs
                                    </TabsTrigger>
                                </TabsList>

                                {/* Overview Tab */}
                                <TabsContent value="overview" className="mt-6 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5" />
                                                Performance Overview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="text-sm text-green-600 mb-1">Total Paid</div>
                                                    <div className="text-2xl font-bold text-green-700">Rs. {Number(stats.total_paid).toLocaleString()}</div>
                                                </div>
                                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                                    <div className="text-sm text-amber-600 mb-1">Pending Dues</div>
                                                    <div className="text-2xl font-bold text-amber-700">Rs. {Number(stats.total_pending).toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div>
                                                <h4 className="font-semibold mb-3">Membership Timeline</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                                        <div className="flex-1">
                                                            <div className="font-medium">Registered</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {new Date(member.registration_date).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {stats.last_payment && (
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                                                            <div className="flex-1">
                                                                <div className="font-medium">Last Payment</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {new Date(stats.last_payment).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {stats.last_attendance && (
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                                            <div className="flex-1">
                                                                <div className="font-medium">Last Attendance</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {new Date(stats.last_attendance).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Quick Actions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Quick Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-3">
                                            <Button variant="outline" onClick={() => setIsPaymentOpen(true)}>
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                Record Payment
                                            </Button>
                                            <Button variant="outline" onClick={() => setIsEditProgramsOpen(true)}>
                                                <Dumbbell className="h-4 w-4 mr-2" />
                                                Manage Programs
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Details Tab */}
                                <TabsContent value="details" className="mt-6 space-y-6">
                                    <PersonalInfoCard member={member} />
                                    <ContactInfoCard member={member} />
                                    <MedicalInfoCard member={member} />
                                </TabsContent>

                                {/* Payments Tab */}
                                <TabsContent value="payments" className="mt-6">
                                    <PaymentsCard
                                        member={member}
                                        onRecordPayment={(selectedIds) => {
                                            if (selectedIds && selectedIds.length > 0) {
                                                // Bulk payment mode
                                                setSelectedScheduleIds(selectedIds);
                                                // Calculate total amount for selected schedules
                                                const total = member.payment_schedules
                                                    .filter(s => selectedIds.includes(s.id))
                                                    .reduce((sum, s) => sum + Number(s.amount), 0);
                                                setSelectedAmount(total);
                                                setSelectedScheduleId(''); // Clear single selection
                                            } else {
                                                // Normal payment mode
                                                setSelectedScheduleIds([]);
                                                setSelectedScheduleId('');
                                                setSelectedAmount(stats.total_monthly_fee);
                                            }
                                            setIsPaymentOpen(true);
                                        }}
                                    />
                                </TabsContent>

                                {/* Programs Tab */}
                                <TabsContent value="programs" className="mt-6">
                                    <ProgramsEnrollmentCard
                                        member={member}
                                        onManageClick={() => setIsEditProgramsOpen(true)}
                                    />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Dialogs */}
                    <ApproveDialog
                        open={isApproveOpen}
                        onOpenChange={setIsApproveOpen}
                        member={member}
                        onApprove={handleApprove}
                    />

                    <ManageProgramsDialog
                        open={isEditProgramsOpen}
                        onOpenChange={setIsEditProgramsOpen}
                        availablePrograms={availablePrograms}
                        selectedPrograms={selectedPrograms}
                        onToggleProgram={toggleProgram}
                        onUpdate={handleUpdatePrograms}
                    />

                    <PaymentDialog
                        open={isPaymentOpen}
                        onOpenChange={setIsPaymentOpen}
                        member={member}
                        selectedScheduleId={selectedScheduleId}
                        setSelectedScheduleId={setSelectedScheduleId}
                        selectedScheduleIds={selectedScheduleIds}
                        setSelectedScheduleIds={setSelectedScheduleIds}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        selectedAmount={selectedAmount}
                        onSubmit={handlePayment}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
