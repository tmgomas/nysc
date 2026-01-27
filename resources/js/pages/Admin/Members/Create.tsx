import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, ChevronLeft, Loader2, Save } from 'lucide-react';

interface Sport {
    id: string;
    name: string;
    admission_fee: number;
    monthly_fee: number;
}

interface Props {
    sports: Sport[];
}

export default function Create({ sports }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        // Personal Information
        full_name: '',
        calling_name: '',
        email: '',
        nic_passport: '',
        date_of_birth: '',
        gender: 'male',
        contact_number: '',
        address: '',

        // Medical Information
        blood_group: '',
        medical_history: '',
        allergies: '',

        // Emergency Contact
        emergency_contact: '',
        emergency_number: '',

        // Guardian Information (for minors)


        // Background & Preferences
        school_occupation: '',
        fitness_level: 'beginner',
        previous_club_experience: '',
        membership_type: 'regular',
        jersey_size: '',
        preferred_training_days: [] as string[],
        preferred_contact_method: 'email',
        referral_source: '',

        // Sports
        sport_ids: [] as string[],

        // Legal
        terms_accepted: false,
        photo_consent: false,
    });

    // Calculate age from date of birth
    const calculateAge = (dob: string): number => {
        if (!dob) return 0;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const isMinor = calculateAge(data.date_of_birth) < 18;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/members');
    };

    const toggleSport = (sportId: string) => {
        setData('sport_ids',
            data.sport_ids.includes(sportId)
                ? data.sport_ids.filter(id => id !== sportId)
                : [...data.sport_ids, sportId]
        );
    };

    const toggleTrainingDay = (day: string) => {
        setData('preferred_training_days',
            data.preferred_training_days.includes(day)
                ? data.preferred_training_days.filter(d => d !== day)
                : [...data.preferred_training_days, day]
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Members', href: '/admin/members' },
                { title: 'Add New', href: '/admin/members/create' },
            ]}
        >
            <Head title="Add Member" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admin/members">
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Add New Member</h2>
                            <p className="text-muted-foreground">
                                Register a new member to the club
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>
                                        Enter the member's personal details.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="full_name"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="Enter full name"
                                            className={errors.full_name ? 'border-red-500' : ''}
                                        />
                                        {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="calling_name">Calling Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="calling_name"
                                            value={data.calling_name}
                                            onChange={(e) => setData('calling_name', e.target.value)}
                                            placeholder="Name to print on ID"
                                            className={errors.calling_name ? 'border-red-500' : ''}
                                        />
                                        {errors.calling_name && <p className="text-sm text-red-500">{errors.calling_name}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="member@example.com"
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nic_passport">NIC/Passport Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="nic_passport"
                                            value={data.nic_passport}
                                            onChange={(e) => setData('nic_passport', e.target.value)}
                                            placeholder="e.g. 199012345678"
                                            className={errors.nic_passport ? 'border-red-500' : ''}
                                        />
                                        {errors.nic_passport && <p className="text-sm text-red-500">{errors.nic_passport}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth">Date of Birth <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className={errors.date_of_birth ? 'border-red-500' : ''}
                                        />
                                        {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={data.gender}
                                            onValueChange={(value) => setData('gender', value)}
                                        >
                                            <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_number">Contact Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="contact_number"
                                            type="tel"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            placeholder="e.g. 0771234567"
                                            className={errors.contact_number ? 'border-red-500' : ''}
                                        />
                                        {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                                        <textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            rows={3}
                                            placeholder="Enter full residential address"
                                            className={`flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.address ? 'border-red-500' : 'border-input'}`}
                                        />
                                        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Emergency Contact */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Emergency Contact</CardTitle>
                                    <CardDescription>
                                        Contact details in case of emergency.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_contact">Contact Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="emergency_contact"
                                            value={data.emergency_contact}
                                            onChange={(e) => setData('emergency_contact', e.target.value)}
                                            placeholder="Name of emergency contact"
                                            className={errors.emergency_contact ? 'border-red-500' : ''}
                                        />
                                        {errors.emergency_contact && <p className="text-sm text-red-500">{errors.emergency_contact}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="emergency_number">Contact Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="emergency_number"
                                            type="tel"
                                            value={data.emergency_number}
                                            onChange={(e) => setData('emergency_number', e.target.value)}
                                            placeholder="Emergency contact number"
                                            className={errors.emergency_number ? 'border-red-500' : ''}
                                        />
                                        {errors.emergency_number && <p className="text-sm text-red-500">{errors.emergency_number}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Medical Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Medical Information</CardTitle>
                                    <CardDescription>
                                        Health and medical details for safety purposes.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="blood_group">Blood Group</Label>
                                        <Select
                                            value={data.blood_group}
                                            onValueChange={(value) => setData('blood_group', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select blood group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A+">A+</SelectItem>
                                                <SelectItem value="A-">A-</SelectItem>
                                                <SelectItem value="B+">B+</SelectItem>
                                                <SelectItem value="B-">B-</SelectItem>
                                                <SelectItem value="O+">O+</SelectItem>
                                                <SelectItem value="O-">O-</SelectItem>
                                                <SelectItem value="AB+">AB+</SelectItem>
                                                <SelectItem value="AB-">AB-</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.blood_group && <p className="text-sm text-red-500">{errors.blood_group}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="allergies">Allergies</Label>
                                        <Input
                                            id="allergies"
                                            value={data.allergies}
                                            onChange={(e) => setData('allergies', e.target.value)}
                                            placeholder="Any known allergies"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="medical_history">Medical History / Conditions</Label>
                                        <textarea
                                            id="medical_history"
                                            value={data.medical_history}
                                            onChange={(e) => setData('medical_history', e.target.value)}
                                            rows={3}
                                            placeholder="Any medical conditions, injuries, or health concerns"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Guardian Information - Only show for minors */}


                            {/* Background & Preferences */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Background & Preferences</CardTitle>
                                    <CardDescription>
                                        Additional information and membership preferences.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="school_occupation">School / Occupation</Label>
                                        <Input
                                            id="school_occupation"
                                            value={data.school_occupation}
                                            onChange={(e) => setData('school_occupation', e.target.value)}
                                            placeholder="e.g. Royal College / Software Engineer"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="membership_type">Membership Type</Label>
                                        <Select
                                            value={data.membership_type}
                                            onValueChange={(value) => setData('membership_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="regular">Regular</SelectItem>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="senior">Senior Citizen</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fitness_level">Fitness Level</Label>
                                        <Select
                                            value={data.fitness_level}
                                            onValueChange={(value) => setData('fitness_level', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="jersey_size">Jersey / T-Shirt Size</Label>
                                        <Select
                                            value={data.jersey_size}
                                            onValueChange={(value) => setData('jersey_size', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="XS">XS</SelectItem>
                                                <SelectItem value="S">S</SelectItem>
                                                <SelectItem value="M">M</SelectItem>
                                                <SelectItem value="L">L</SelectItem>
                                                <SelectItem value="XL">XL</SelectItem>
                                                <SelectItem value="XXL">XXL</SelectItem>
                                                <SelectItem value="XXXL">XXXL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                                        <Select
                                            value={data.preferred_contact_method}
                                            onValueChange={(value) => setData('preferred_contact_method', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="sms">SMS</SelectItem>
                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="referral_source">How did you hear about us?</Label>
                                        <Input
                                            id="referral_source"
                                            value={data.referral_source}
                                            onChange={(e) => setData('referral_source', e.target.value)}
                                            placeholder="e.g. Friend, Social Media, Advertisement"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Preferred Training Days</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                <Badge
                                                    key={day}
                                                    variant={data.preferred_training_days.includes(day) ? 'default' : 'outline'}
                                                    className="cursor-pointer"
                                                    onClick={() => toggleTrainingDay(day)}
                                                >
                                                    {day}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="previous_club_experience">Previous Sports Club Experience</Label>
                                        <textarea
                                            id="previous_club_experience"
                                            value={data.previous_club_experience}
                                            onChange={(e) => setData('previous_club_experience', e.target.value)}
                                            rows={2}
                                            placeholder="Any previous experience with sports clubs or teams"
                                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sports Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sports Enrollment</CardTitle>
                                    <CardDescription>
                                        Select the sports the member wishes to join. At least one must be selected.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {sports.map((sport) => {
                                            const isSelected = data.sport_ids.includes(sport.id);
                                            return (
                                                <div
                                                    key={sport.id}
                                                    onClick={() => toggleSport(sport.id)}
                                                    className={`
                                                        relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
                                                        ${isSelected
                                                            ? 'border-primary bg-primary/5 shadow-md'
                                                            : 'border-muted hover:border-muted-foreground/50 hover:bg-muted/50'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="space-y-1">
                                                            <h4 className="font-semibold leading-none tracking-tight">
                                                                {sport.name}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2 pt-2">
                                                                <Badge variant="outline" className="bg-background">
                                                                    Adm: Rs. {sport.admission_fee}
                                                                </Badge>
                                                                <Badge variant="secondary">
                                                                    Mo: Rs. {sport.monthly_fee}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={`
                                                                flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors
                                                                ${isSelected
                                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                                    : 'border-muted-foreground/30'
                                                                }
                                                            `}
                                                        >
                                                            {isSelected && <CheckCircle2 className="h-4 w-4" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {errors.sport_ids && (
                                        <p className="mt-2 text-sm text-red-500">{errors.sport_ids}</p>
                                    )}
                                </CardContent>
                            </Card>


                            {/* Legal & Consents */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Legal & Consents</CardTitle>
                                    <CardDescription>
                                        Please review and accept the terms and conditions.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start space-x-2 rounded-md border p-4">
                                        <Checkbox
                                            id="terms"
                                            checked={data.terms_accepted}
                                            onCheckedChange={(checked) => setData('terms_accepted', !!checked)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor="terms"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Accept Terms and Conditions
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                I agree to abide by the rules and regulations of the New Young Christian Sports Club.
                                            </p>
                                        </div>
                                    </div>
                                    {errors.terms_accepted && <p className="text-sm text-red-500">{errors.terms_accepted}</p>}

                                    <div className="flex items-start space-x-2 rounded-md border p-4">
                                        <Checkbox
                                            id="photo_consent"
                                            checked={data.photo_consent}
                                            onCheckedChange={(checked) => setData('photo_consent', !!checked)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor="photo_consent"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Photo Consent
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                I grant permission for my photos to be used in club publications and social media.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.location.href = '/admin/members'}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="min-w-[150px]">
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Create Member
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div >
        </AppLayout >
    );
}
