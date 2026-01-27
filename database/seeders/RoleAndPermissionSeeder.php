<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            // Member permissions
            'view_members',
            'create_members',
            'edit_members',
            'delete_members',
            'approve_members',
            'suspend_members',
            
            // Payment permissions
            'view_payments',
            'create_payments',
            'edit_payments',
            'delete_payments',
            'verify_payments',
            'approve_payments',
            
            // Attendance permissions
            'view_attendance',
            'mark_attendance',
            'edit_attendance',
            'delete_attendance',
            
            // Sport permissions
            'view_sports',
            'create_sports',
            'edit_sports',
            'delete_sports',
            
            // Coach permissions
            'view_coaches',
            'create_coaches',
            'edit_coaches',
            'delete_coaches',
            'assign_coaches',
            
            // Report permissions
            'view_reports',
            'export_reports',
            
            // System permissions
            'manage_settings',
            'manage_roles',
            'view_audit_logs',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create Roles and assign permissions

        // 1. Super Admin - All permissions
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // 2. Admin - Club management (no system settings/roles)
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view_members', 'create_members', 'edit_members', 'delete_members', 'approve_members', 'suspend_members',
            'view_payments', 'create_payments', 'edit_payments', 'delete_payments', 'verify_payments', 'approve_payments',
            'view_attendance', 'mark_attendance', 'edit_attendance',
            'view_sports', 'create_sports', 'edit_sports', 'delete_sports',
            'view_coaches', 'create_coaches', 'edit_coaches', 'delete_coaches', 'assign_coaches',
            'view_reports', 'export_reports',
            'view_audit_logs',
        ]);

        // 3. Staff - Operational tasks (limited)
        $staff = Role::create(['name' => 'staff']);
        $staff->givePermissionTo([
            'view_members', 'create_members', 'edit_members',
            'view_payments', 'create_payments',
            'view_attendance', 'mark_attendance',
            'view_sports',
            'view_reports',
        ]);

        // 4. Coach - Sport-specific access
        $coach = Role::create(['name' => 'coach']);
        $coach->givePermissionTo([
            'view_members',
            'view_attendance', 'mark_attendance',
            'view_sports',
        ]);

        // 5. Member - Self-service portal
        $member = Role::create(['name' => 'member']);
        $member->givePermissionTo([
            'view_members', // Own profile only
            'view_payments', // Own payments only
            'view_attendance', // Own attendance only
        ]);

        $this->command->info('Roles and permissions created successfully!');
    }
}
