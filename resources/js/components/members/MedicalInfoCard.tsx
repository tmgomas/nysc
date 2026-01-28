import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';
import type { Member } from './types';

interface MedicalInfoCardProps {
    member: Member;
}

export function MedicalInfoCard({ member }: MedicalInfoCardProps) {
    return (
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
    );
}
