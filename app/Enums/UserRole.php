<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case STAFF = 'staff';
    case COACH = 'coach';
    case MEMBER = 'member';

    public function label(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'Super Admin',
            self::ADMIN => 'Admin',
            self::STAFF => 'Staff',
            self::COACH => 'Coach',
            self::MEMBER => 'Member',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::SUPER_ADMIN => 'Full system access',
            self::ADMIN => 'Club management',
            self::STAFF => 'Operational tasks',
            self::COACH => 'Sport-specific access',
            self::MEMBER => 'Self-service portal',
        };
    }

    public function permissions(): array
    {
        return match($this) {
            self::SUPER_ADMIN => ['*'],
            self::ADMIN => [
                'view_members', 'create_members', 'edit_members', 'delete_members', 'approve_members', 'suspend_members',
                'view_payments', 'create_payments', 'edit_payments', 'delete_payments', 'verify_payments', 'approve_payments',
                'view_attendance', 'mark_attendance', 'edit_attendance',
                'view_sports', 'create_sports', 'edit_sports', 'delete_sports',
                'view_coaches', 'create_coaches', 'edit_coaches', 'delete_coaches', 'assign_coaches',
                'view_reports', 'export_reports', 'view_audit_logs',
            ],
            self::STAFF => [
                'view_members', 'create_members', 'edit_members',
                'view_payments', 'create_payments',
                'view_attendance', 'mark_attendance',
                'view_sports', 'view_reports',
            ],
            self::COACH => [
                'view_members', 'view_attendance', 'mark_attendance', 'view_sports',
            ],
            self::MEMBER => [
                'view_members', 'view_payments', 'view_attendance',
            ],
        };
    }
}
