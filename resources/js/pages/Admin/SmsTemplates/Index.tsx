import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Save, RotateCcw } from 'lucide-react';
import Badge from '@/components/Badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SmsTemplate {
    id: string;
    key: string;
    content: string;
    description: string;
    active: boolean;
    updated_at: string;
}

interface Props {
    templates: SmsTemplate[];
}

export default function Index({ templates }: Props) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const { data, setData, put, processing, reset, errors, recentlySuccessful } = useForm({
        content: '',
        active: true,
    });

    const handleEdit = (template: SmsTemplate) => {
        setEditingId(template.id);
        setData({
            content: template.content,
            active: template.active,
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        reset();
    };

    const handleSubmit = (id: string, e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.sms-templates.update', id), {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const getPlaceholders = (key: string) => {
        switch (key) {
            case 'member.welcome':
                return ['{name}'];
            case 'member.approved':
                return ['{name}', '{member_number}'];
            case 'payment.received':
            case 'payment.reminder':
                return ['{name}', '{amount}', '{description}', '{receipt_number}', '{due_date}'];
            case 'attendance.checkin':
                return ['{name}', '{time}'];
            default:
                return [];
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'SMS Templates', href: '/admin/sms-templates' }]}>
            <Head title="SMS Templates" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <MessageSquare className="h-8 w-8 text-primary" />
                                SMS Templates
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Manage automated SMS notifications sent by the system.
                            </p>
                        </div>
                    </div>

                    {recentlySuccessful && (
                        <Alert className="bg-green-50 border-green-200">
                            <AlertDescription className="text-green-800">
                                Template updated successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        {templates.map((template) => (
                            <Card key={template.id} className={editingId === template.id ? 'border-primary ring-1 ring-primary' : ''}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                                {template.description}
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {template.key}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                Params: {getPlaceholders(template.key).map(p => (
                                                    <span key={p} className="inline-block bg-muted px-1.5 py-0.5 rounded text-xs font-mono mr-1">
                                                        {p}
                                                    </span>
                                                ))}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editingId === template.id ? (
                                                <Badge variant={data.active ? 'success' : 'secondary'}>
                                                    {data.active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            ) : (
                                                <Badge variant={template.active ? 'success' : 'secondary'}>
                                                    {template.active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {editingId === template.id ? (
                                        <form onSubmit={(e) => handleSubmit(template.id, e)} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Message Content</Label>
                                                <Textarea
                                                    value={data.content}
                                                    onChange={e => setData('content', e.target.value)}
                                                    className="font-mono text-sm min-h-[100px]"
                                                />
                                                {errors.content && (
                                                    <p className="text-sm text-destructive">{errors.content}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    {data.content.length} characters • {Math.ceil(data.content.length / 160)} SMS segment(s)
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={data.active}
                                                    onCheckedChange={checked => setData('active', checked)}
                                                />
                                                <Label>Enable this notification</Label>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="outline" onClick={handleCancel} size="sm">
                                                    Cancel
                                                </Button>
                                                <Button type="submit" size="sm" disabled={processing}>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-muted/30 p-4 rounded-md border text-sm font-mono whitespace-pre-wrap">
                                                {template.content}
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span>Updated {new Date(template.updated_at).toLocaleDateString()}</span>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                                                    Edit Template
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
