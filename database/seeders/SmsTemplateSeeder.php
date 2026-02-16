<?php

namespace Database\Seeders;

use App\Models\SmsTemplate;
use Illuminate\Database\Seeder;

class SmsTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'key' => 'member.welcome',
                'description' => 'Registration received (Pending)',
                'content' => 'Welcome to NYCSC! Your membership is pending approval. We will notify you once approved.',
            ],
            [
                'key' => 'member.credentials',
                'description' => 'New account credentials',
                'content' => 'Welcome to NYCSC! Your login: {email} Password: {password} Please change it after first login.',
            ],
            [
                'key' => 'member.approved',
                'description' => 'Membership approval notification',
                'content' => 'Congratulations! Your membership request has been approved. Your Member ID is {member_number}. Please login to view your profile.',
            ],
            [
                'key' => 'payment.received',
                'description' => 'Payment receipt confirmation',
                'content' => 'Thank you! We have received your payment of Rs. {amount} for {description}. Receipt: {receipt_number}.',
            ],
            [
                'key' => 'payment.reminder',
                'description' => 'Payment due reminder',
                'content' => 'Reminder: Your payment of Rs. {amount} for {description} is due on {due_date}. Please pay to avoid late fees.',
            ],
            [
                'key' => 'attendance.checkin',
                'description' => 'Attendance check-in notification',
                'content' => 'Hi {name}, you have checked in at {time}. Enjoy your session!',
            ],
        ];

        foreach ($templates as $template) {
            SmsTemplate::updateOrCreate(
                ['key' => $template['key']],
                $template
            );
        }
    }
}
