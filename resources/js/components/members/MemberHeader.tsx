import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';
import type { Member } from './types';

interface MemberHeaderProps {
    member: Member;
    getStatusBadge: (status: string) => string;
    children?: React.ReactNode;
}

export function MemberHeader({ member, getStatusBadge, children }: MemberHeaderProps) {
    return (
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
                {children}
            </div>
        </div>
    );
}
