import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Pencil } from 'lucide-react';
import type { Member } from './types';

interface SportsEnrollmentCardProps {
    member: Member;
    onManageClick: () => void;
}

export function SportsEnrollmentCard({ member, onManageClick }: SportsEnrollmentCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Sports Enrollment
                </CardTitle>
                <Button variant="outline" size="sm" onClick={onManageClick}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Manage
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {member.sports.length > 0 ? (
                        member.sports.map((sport) => (
                            <div key={sport.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-muted/50 transition-colors">
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
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No sports enrolled</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
