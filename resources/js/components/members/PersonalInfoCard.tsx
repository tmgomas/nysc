import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import type { Member } from './types';

interface PersonalInfoCardProps {
    member: Member;
}

export function PersonalInfoCard({ member }: PersonalInfoCardProps) {
    return (
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
                    <Label className="text-muted-foreground">Calling Name</Label>
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
                <div>
                    <Label className="text-muted-foreground">Membership Type</Label>
                    <p className="capitalize font-medium">{member.membership_type}</p>
                </div>
                <div className="sm:col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="font-medium">{member.address}</p>
                </div>
            </CardContent>
        </Card>
    );
}
