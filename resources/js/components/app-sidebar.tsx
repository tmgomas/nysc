import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import type { NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    GalleryVerticalEnd,
    LayoutDashboard,
    Users,
    CreditCard,
    ClipboardCheck,
    Trophy,
    FileText,
    UserCircle,
    Calendar
} from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<SharedData>().props;
    const userRoles = auth?.roles || [];

    // Helper function to check if user has any of the specified roles
    const hasRole = (roles: string[]) => {
        return roles.some(role => userRoles.includes(role));
    };

    // Admin Navigation
    const adminNavigation: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Members',
            href: '/admin/members',
            icon: Users,
        },
        {
            title: 'Payments',
            href: '/admin/payments',
            icon: CreditCard,
        },
        {
            title: 'Attendance',
            href: '/admin/attendance',
            icon: ClipboardCheck,
        },
        {
            title: 'Sports',
            href: '/admin/sports',
            icon: Trophy,
        },
        {
            title: 'Reports',
            href: '/admin/reports/members',
            icon: FileText,
        },
    ];

    // Member Navigation
    const memberNavigation: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Profile',
            href: '/member/profile',
            icon: UserCircle,
        },
        {
            title: 'Payments',
            href: '/member/payments',
            icon: CreditCard,
        },
        {
            title: 'Attendance',
            href: '/member/attendance',
            icon: Calendar,
        },
    ];

    // Coach Navigation
    const coachNavigation: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/coach/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Attendance',
            href: '/coach/attendance',
            icon: ClipboardCheck,
        },
    ];

    // Determine which navigation to show based on user role
    let navigationItems: NavItem[] = [];

    if (hasRole(['super_admin', 'admin'])) {
        navigationItems = adminNavigation;
    } else if (hasRole(['member'])) {
        navigationItems = memberNavigation;
    } else if (hasRole(['coach'])) {
        navigationItems = coachNavigation;
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        NYCSC
                                    </span>
                                    <span className="truncate text-xs">
                                        Sports Club
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navigationItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
