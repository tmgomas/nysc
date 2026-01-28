import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail } from 'lucide-react';
import type { Member } from './types';

interface ContactInfoCardProps {
    member: Member;
}

export function ContactInfoCard({ member }: ContactInfoCardProps) {
    return (
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
    );
}
