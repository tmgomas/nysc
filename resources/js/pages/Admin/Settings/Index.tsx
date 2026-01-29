import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';

interface SettingValue {
    [key: string]: any;
}

interface SettingsGroup {
    [group: string]: SettingValue;
}

interface Props {
    settings: SettingsGroup;
}

export default function Index({ settings: initialSettings }: Props) {
    const [settings, setSettings] = useState(initialSettings);
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        settings: [] as Array<{ key: string; value: any; type: string }>,
    });

    const handleSettingChange = (group: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert settings object to array format
        const settingsArray: Array<{ key: string; value: any; type: string }> = [];

        Object.entries(settings).forEach(([group, groupSettings]) => {
            Object.entries(groupSettings).forEach(([key, value]) => {
                settingsArray.push({
                    key,
                    value,
                    type: typeof value === 'number' ? 'number' : 'string',
                });
            });
        });

        post(route('admin.settings.update'), {
            data: { settings: settingsArray },
            preserveScroll: true,
        });
    };

    const renderSettingInput = (group: string, key: string, value: any, label: string, description?: string) => {
        const inputType = typeof value === 'number' ? 'number' : 'text';

        return (
            <div className="space-y-2" key={key}>
                <Label htmlFor={key}>{label}</Label>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                <Input
                    id={key}
                    type={inputType}
                    value={value || ''}
                    onChange={(e) => handleSettingChange(
                        group,
                        key,
                        inputType === 'number' ? parseInt(e.target.value) : e.target.value
                    )}
                    className="max-w-md"
                />
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Settings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <SettingsIcon className="h-8 w-8" />
                            System Settings
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Configure system-wide settings and preferences
                        </p>
                    </div>
                </div>

                {recentlySuccessful && (
                    <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-800">
                            Settings updated successfully!
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="member" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="member">Member Settings</TabsTrigger>
                            <TabsTrigger value="registration">Registration</TabsTrigger>
                            <TabsTrigger value="payment">Payment Settings</TabsTrigger>
                            <TabsTrigger value="receipt">Receipt Numbers</TabsTrigger>
                            <TabsTrigger value="general">General Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="member" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Member Number Configuration</CardTitle>
                                    <CardDescription>
                                        Configure how member numbers are generated
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {settings.member && (
                                        <>
                                            {renderSettingInput(
                                                'member',
                                                'member_number_prefix',
                                                settings.member.member_number_prefix,
                                                'Member Number Prefix',
                                                'Prefix for member numbers (e.g., SC, M, NYSC)'
                                            )}
                                            {renderSettingInput(
                                                'member',
                                                'member_number_digits',
                                                settings.member.member_number_digits,
                                                'Number of Digits',
                                                'Number of digits in the member number sequence (e.g., 4 for 0001)'
                                            )}
                                            {renderSettingInput(
                                                'member',
                                                'member_number_start',
                                                settings.member.member_number_start,
                                                'Starting Number',
                                                'The starting number for new members'
                                            )}
                                            <div className="pt-4 border-t">
                                                <p className="text-sm font-medium">Preview:</p>
                                                <p className="text-2xl font-bold text-primary mt-2">
                                                    {settings.member.member_number_prefix}
                                                    {String(settings.member.member_number_start || 1).padStart(
                                                        settings.member.member_number_digits || 4,
                                                        '0'
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Example member number format
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="registration" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registration Reference Configuration</CardTitle>
                                    <CardDescription>
                                        Registration references use sport short codes (assigned once when member is approved)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {settings.registration && (
                                        <>
                                            {renderSettingInput(
                                                'registration',
                                                'registration_reference_digits',
                                                settings.registration.registration_reference_digits,
                                                'Number of Digits',
                                                'Number of digits in the sequence (e.g., 4 for 0001)'
                                            )}
                                            {renderSettingInput(
                                                'registration',
                                                'registration_reference_year_format',
                                                settings.registration.registration_reference_year_format,
                                                'Year Format',
                                                'Year format: "yy" for 2-digit (26) or "yyyy" for 4-digit (2026)'
                                            )}
                                            <div className="pt-4 border-t">
                                                <p className="text-sm font-medium">Format:</p>
                                                <p className="text-lg font-mono text-muted-foreground mt-2">
                                                    {'{YEAR}'}-{'{SPORT_CODE}'}-{'{NUMBER}'}
                                                </p>
                                                <p className="text-sm font-medium mt-4">Examples:</p>
                                                <div className="space-y-2 mt-2">
                                                    <div>
                                                        <p className="text-xl font-bold text-primary">
                                                            {settings.registration.registration_reference_year_format === 'yyyy' ? '2026' : '26'}-SW-
                                                            {String(1).padStart(settings.registration.registration_reference_digits || 4, '0')}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Swimming member (uses sport short code SW)
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-bold text-primary">
                                                            {settings.registration.registration_reference_year_format === 'yyyy' ? '2026' : '26'}-CR-
                                                            {String(1).padStart(settings.registration.registration_reference_digits || 4, '0')}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Cricket member (uses sport short code CR)
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-4">
                                                    ℹ️ Prefix is automatically set from member's primary sport. Resets yearly per sport.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payment" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Reference Configuration</CardTitle>
                                    <CardDescription>
                                        Configure how payment reference numbers are generated
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {settings.payment && (
                                        <>
                                            {renderSettingInput(
                                                'payment',
                                                'payment_reference_format',
                                                settings.payment.payment_reference_format,
                                                'Reference Format',
                                                'Format template for payment references (use {year}, {sport_code}, {number})'
                                            )}
                                            {renderSettingInput(
                                                'payment',
                                                'payment_reference_digits',
                                                settings.payment.payment_reference_digits,
                                                'Number of Digits',
                                                'Number of digits in the payment sequence (e.g., 4 for 0001)'
                                            )}
                                            {renderSettingInput(
                                                'payment',
                                                'payment_reference_year_format',
                                                settings.payment.payment_reference_year_format,
                                                'Year Format',
                                                'Year format: "yy" for 2-digit (26) or "yyyy" for 4-digit (2026)'
                                            )}
                                            <div className="pt-4 border-t">
                                                <p className="text-sm font-medium">Preview:</p>
                                                <div className="space-y-2 mt-2">
                                                    <div>
                                                        <p className="text-xl font-bold text-primary">
                                                            {settings.payment.payment_reference_year_format === 'yyyy' ? '2026' : '26'}-SW-
                                                            {String(1).padStart(settings.payment.payment_reference_digits || 4, '0')}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Swimming payment reference example
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-bold text-primary">
                                                            {settings.payment.payment_reference_year_format === 'yyyy' ? '2026' : '26'}-CR-
                                                            {String(1).padStart(settings.payment.payment_reference_digits || 4, '0')}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Cricket payment reference example
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="receipt" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Receipt Number Configuration</CardTitle>
                                    <CardDescription>
                                        Configure receipt numbers for payment receipts
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {settings.receipt && (
                                        <>
                                            {renderSettingInput(
                                                'receipt',
                                                'receipt_number_prefix',
                                                settings.receipt.receipt_number_prefix,
                                                'Receipt Prefix',
                                                'Prefix for receipt numbers (e.g., RCP, RCT, INV)'
                                            )}
                                            {renderSettingInput(
                                                'receipt',
                                                'receipt_number_digits',
                                                settings.receipt.receipt_number_digits,
                                                'Number of Digits',
                                                'Number of digits in the sequence (e.g., 4 for 0001)'
                                            )}
                                            {renderSettingInput(
                                                'receipt',
                                                'receipt_number_year_format',
                                                settings.receipt.receipt_number_year_format,
                                                'Year Format',
                                                'Year format: "yy" for 2-digit (26) or "yyyy" for 4-digit (2026)'
                                            )}
                                            <div className="pt-4 border-t">
                                                <p className="text-sm font-medium">Preview:</p>
                                                <div className="space-y-2 mt-2">
                                                    <div>
                                                        <p className="text-xl font-bold text-primary">
                                                            {settings.receipt.receipt_number_prefix}-
                                                            {settings.receipt.receipt_number_year_format === 'yyyy' ? '2026' : '26'}-
                                                            {String(1).padStart(settings.receipt.receipt_number_digits || 4, '0')}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            With year (resets yearly): RCP-26-0001
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-bold text-primary">
                                                            {settings.receipt.receipt_number_prefix}-
                                                            {String(1).padStart(settings.receipt.receipt_number_digits || 4, '0')}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Without year (continuous): RCP-0001
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="general" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>General Settings</CardTitle>
                                    <CardDescription>
                                        General system configuration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {settings.general && (
                                        <>
                                            {renderSettingInput(
                                                'general',
                                                'club_name',
                                                settings.general.club_name,
                                                'Club Short Name',
                                                'Short name or abbreviation for the club'
                                            )}
                                            {renderSettingInput(
                                                'general',
                                                'club_full_name',
                                                settings.general.club_full_name,
                                                'Club Full Name',
                                                'Full official name of the club'
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.location.reload()}
                            disabled={processing}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
