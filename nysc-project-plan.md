# NYSC Sports Club Management System - Project Plan

## 📋 Project Overview

**System Name:** NYSC Sports Club Management System  
**Organization:** National Youth Centre Sports Club  
**Website:** https://www.nysc.lk/page/view/national-youth-centre-sports-club  
**Technology Stack:** Laravel 12 + React + Spatie Laravel Permission Package  
**Start Date:** January 2026

---

## 🎯 Project Objectives

### Primary Goals
1. Streamline member registration and onboarding process
2. Automate payment tracking (Admission + Monthly recurring)
3. Implement efficient attendance management system
4. Build scalable architecture for future growth
5. Enable multi-role access (Admin, Staff, Coach, Member)

### Success Metrics
- Reduce registration time from manual to < 5 minutes
- 100% payment tracking accuracy
- Real-time attendance monitoring
- Support 500+ members initially, scalable to 5000+

---

## 🏗️ System Architecture

### Tech Stack Details

**Backend:**
- Laravel 12 (PHP 8.3+)
- MySQL Database
- Laravel Breeze (Authentication)
- Spatie Laravel Permission (Role & Permission Management)

**Frontend:**
- React 18+
- Inertia.js (Laravel + React bridge)
- Tailwind CSS
- Headless UI Components

**Additional Packages:**
- Laravel Excel (Reports export)
- Laravel Queue (Background jobs)
- Laravel Notifications (Email/SMS)
- Intervention Image (Photo processing)

---

## 👥 User Roles & Permissions

### Role Hierarchy

#### 1. Super Admin
**Full System Access**
- ✅ All permissions
- ✅ Manage system settings
- ✅ Manage users and roles
- ✅ View audit logs

#### 2. Admin
**Club Management**
- ✅ View/Create/Edit/Delete members
- ✅ Approve registrations
- ✅ View/Create/Edit/Delete payments
- ✅ Approve payments
- ✅ Mark attendance
- ✅ View all reports
- ✅ Export reports
- ✅ Manage sports/activities
- ✅ Assign coaches
- ❌ Manage system settings
- ❌ Manage roles

#### 3. Staff
**Operational Tasks**
- ✅ View members
- ✅ Create/Edit members (limited)
- ✅ Mark attendance
- ✅ Record payments
- ✅ View basic reports
- ❌ Delete members
- ❌ Approve payments
- ❌ Manage sports
- ❌ Export reports

#### 4. Coach/Trainer
**Sport-Specific Access**
- ✅ View assigned sports members only
- ✅ Mark attendance (own sports only)
- ✅ View attendance reports (own sports)
- ✅ View member profiles (assigned sports)
- ❌ View payments
- ❌ Edit member details
- ❌ Access other sports data

#### 5. Member
**Self-Service Portal**
- ✅ View own profile
- ✅ View own attendance history
- ✅ View own payment history
- ✅ Make payments
- ✅ Download membership card
- ✅ View sports schedule
- ❌ View other members
- ❌ Access admin features

### Permission Matrix

| Module | Super Admin | Admin | Staff | Coach | Member |
|--------|-------------|-------|-------|-------|--------|
| **Members** |
| View All Members | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Members | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Members | ✅ | ✅ | ⚠️ Limited | ❌ | ❌ |
| Delete Members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve Registration | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Payments** |
| View All Payments | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Payments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Record Payments | ✅ | ✅ | ✅ | ❌ | ✅ (Own) |
| Approve Payments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Payments | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Attendance** |
| View All Attendance | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Attendance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mark Attendance | ✅ | ✅ | ✅ | ⚠️ Own Sports | ❌ |
| Edit Attendance | ✅ | ✅ | ⚠️ Limited | ❌ | ❌ |
| **Reports** |
| View Reports | ✅ | ✅ | ⚠️ Basic | ⚠️ Own Sports | ❌ |
| Export Reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Sports Management** |
| Manage Sports | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Coaches | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Assigned Sports | ✅ | ✅ | ✅ | ✅ | ✅ |
| **System** |
| Manage Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Registration & Onboarding Flow

### Member Registration Process

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

Step 1: Public Registration Form
├─ Personal Information
│  ├─ Full Name
│  ├─ NIC/Passport Number
│  ├─ Date of Birth
│  ├─ Gender
│  ├─ Contact Number
│  ├─ Email Address
│  ├─ Residential Address
│  ├─ Emergency Contact Name
│  ├─ Emergency Contact Number
│  └─ Profile Photo (Optional)
│
└─ Sports/Activities Selection
   ├─ Multi-select Available Sports
   ├─ Cricket
   ├─ Football
   ├─ Basketball
   ├─ Volleyball
   ├─ Badminton
   ├─ Table Tennis
   ├─ Swimming
   ├─ Athletics
   ├─ Gym/Fitness
   ├─ Yoga
   └─ Martial Arts

        ↓

Step 2: Initial Payment
├─ Payment Breakdown
│  ├─ Admission Fee (One-time): Rs. [X]
│  ├─ First Month Fee: Rs. [Y]
│  └─ Total Due: Rs. [X + Y]
│
├─ Payment Methods
│  ├─ Bank Transfer (Upload slip)
│  ├─ Cash (At office)
│  └─ Online Payment (Future)
│
└─ Upload Payment Receipt

        ↓

Step 3: Admin Review & Approval
├─ Admin Dashboard - Pending Registrations
│  ├─ View member details
│  ├─ Verify selected sports
│  ├─ Check sports capacity
│  ├─ Verify payment receipt
│  └─ Check duplicate NIC/Email
│
└─ Admin Actions
   ├─ ✅ Approve (Proceed to activation)
   ├─ ✏️ Edit Sports (Modify before approval)
   └─ ❌ Reject (With reason - email sent)

        ↓

Step 4: Auto Account Creation ✓
├─ System automatically creates
│  ├─ User account (Role: Member)
│  ├─ Unique Member ID (#M0001)
│  ├─ Random temporary password
│  └─ Payment schedule (Monthly)
│
├─ Email sent with
│  ├─ Welcome message
│  ├─ Login credentials
│  ├─ Temporary password
│  ├─ Membership card link
│  ├─ Selected sports list
│  └─ Payment schedule
│
└─ Member receives
   ├─ Digital membership card (QR code)
   ├─ Access to member portal
   └─ Payment due reminders enabled
```

### Admin Direct Registration

```
Admin creates member directly:
├─ Fill all member details
├─ Select sports
├─ Record admission + first month payment
├─ Auto-activate immediately
└─ Send welcome email with credentials
```

---

## 💰 Payment System

### Payment Structure

#### Sport-Based Pricing System

Each sport has its own admission and monthly fees set by admin:

```
EXAMPLE SPORTS PRICING:

┌──────────────┬──────────────┬──────────────┬──────────┐
│ Sport        │ Admission    │ Monthly      │ Capacity │
├──────────────┼──────────────┼──────────────┼──────────┤
│ Cricket      │ Rs. 500      │ Rs. 2,500    │ 30       │
│ Football     │ Rs. 500      │ Rs. 2,500    │ 40       │
│ Basketball   │ Rs. 300      │ Rs. 2,000    │ 20       │
│ Swimming     │ Rs. 1,000    │ Rs. 3,500    │ 25       │
│ Gym/Fitness  │ Rs. 1,500    │ Rs. 4,000    │ 50       │
│ Yoga         │ Rs. 200      │ Rs. 1,500    │ 30       │
│ Badminton    │ Rs. 300      │ Rs. 1,800    │ 25       │
└──────────────┴──────────────┴──────────────┴──────────┘
```

#### Payment Calculation for Multiple Sports

When a member selects multiple sports, the system calculates:

**Option A: Sum of All Sports (Default)**
```
Member selects: Cricket + Swimming + Gym

ADMISSION FEES:
Cricket      : Rs. 500
Swimming     : Rs. 1,000
Gym          : Rs. 1,500
─────────────────────────
Total Admission: Rs. 3,000

MONTHLY FEES:
Cricket      : Rs. 2,500
Swimming     : Rs. 3,500
Gym          : Rs. 4,000
─────────────────────────
Total Monthly: Rs. 10,000

INITIAL PAYMENT (Registration):
Admission    : Rs. 3,000
First Month  : Rs. 10,000
─────────────────────────
Total Due    : Rs. 13,000

RECURRING MONTHLY:
From Month 2 onwards: Rs. 10,000/month
```

**Option B: Discounted Multi-Sport Package (Optional)**
```
Discount Rules (configurable by admin):
- 2 Sports: 5% discount on total
- 3 Sports: 10% discount on total
- 4+ Sports: 15% discount on total

Example with 3 sports (10% discount):
Total Monthly: Rs. 10,000
Discount (10%): -Rs. 1,000
─────────────────────────
Discounted Monthly: Rs. 9,000
```

### Payment Types

#### 1. Admission Fee (Sport-Specific)
- **Type:** One-time per sport
- **Amount:** Varies by sport (set by admin)
- **Purpose:** Sport-specific registration & equipment
- **Required:** Yes (when selecting that sport)
- **Calculation:** Sum of all selected sports' admission fees

#### 2. Monthly Fee (Sport-Specific)
- **Type:** Recurring payment per sport
- **Amount:** Varies by sport (set by admin)
- **Frequency:** Monthly
- **Due Date:** 1st of every month
- **Calculation:** Sum of all selected sports' monthly fees
- **Discount:** Optional multi-sport discount (configurable)

#### 3. Bulk Payment (Advance Payment)
Members can pay multiple months in advance with optional discounts:

```
Example: Monthly total = Rs. 10,000 (Cricket + Swimming + Gym)

Pay 3 months   : Rs. 10,000 × 3 = Rs. 30,000  (Discount: 0%)
Pay 6 months   : Rs. 10,000 × 6 = Rs. 60,000  (Discount: 5% = Rs. 57,000)
Pay 12 months  : Rs. 10,000 × 12 = Rs. 120,000 (Discount: 10% = Rs. 108,000)
```

### Payment Methods

1. **Bank Transfer**
   - Upload bank slip
   - Admin verification required
   
2. **Cash Payment**
   - Pay at office
   - Staff issues receipt
   
3. **Online Payment** (Future - Phase 2)
   - Payment gateway integration
   - Instant verification

### Payment Tracking

#### Member Payment Schedule

```
┌────────────────────────────────────────────────────────────┐
│  Member: John Doe (#M001)                                  │
│  Registration Date: 2026-01-15                             │
│  Active Sports: Cricket (Rs. 2,500), Swimming (Rs. 3,500)  │
│  Monthly Total: Rs. 6,000                                  │
└────────────────────────────────────────────────────────────┘

PAYMENT SUMMARY:
├─ Cricket Admission: Rs. 500 ✅ Paid (2026-01-15)
├─ Swimming Admission: Rs. 1,000 ✅ Paid (2026-01-15)
├─ Total Paid (6 months): Rs. 36,000 (Jan-Jun 2026)
├─ Months Remaining: July 2026 onwards
└─ Payment Status: 🟢 Up to Date

PAYMENT HISTORY:
┌──────────┬────────────┬─────────────┬─────────┬────────────┬────────┬─────────┐
│ Month    │ Due Date   │ Amount      │ Status  │ Paid Date  │ Method │ Receipt │
├──────────┼────────────┼─────────────┼─────────┼────────────┼────────┼─────────┤
│ Jan 2026 │ 2026-01-15 │ Rs. 6,000   │ ✅ Paid │ 2026-01-15 │ Bank   │ #001    │
│ Feb 2026 │ 2026-02-01 │ Rs. 6,000   │ ✅ Paid │ 2026-02-03 │ Cash   │ #002    │
│ Mar 2026 │ 2026-03-01 │ Rs. 6,000   │ ✅ Paid │ 2026-03-01 │ Bank   │ #003    │
│ Apr 2026 │ 2026-04-01 │ Rs. 6,000   │ ✅ Paid │ 2026-03-28 │ Bulk   │ #004    │
│ May 2026 │ 2026-05-01 │ Rs. 6,000   │ ✅ Paid │ 2026-03-28 │ Bulk   │ #004    │
│ Jun 2026 │ 2026-06-01 │ Rs. 6,000   │ ✅ Paid │ 2026-03-28 │ Bulk   │ #004    │
│ Jul 2026 │ 2026-07-01 │ Rs. 6,000   │ ⏳ Due  │ -          │ -      │ -       │
└──────────┴────────────┴─────────────┴─────────┴────────────┴────────┴─────────┘

OUTSTANDING PAYMENTS:
⚠️ July 2026 - Due in 5 days (Rs. 6,000)

QUICK ACTIONS:
[Pay Now] [Pay Bulk] [Download Receipt] [Payment History]
```

#### Payment Status Indicators

| Status | Color | Description | Action Required |
|--------|-------|-------------|-----------------|
| ✅ Paid | 🟢 Green | Payment completed | None |
| ⏳ Due | 🟡 Yellow | Payment due within 7 days | Send reminder |
| ❌ Overdue | 🔴 Red | Payment missed | Send warning |
| ⚫ Suspended | ⚫ Black | Overdue > 30 days | Suspend attendance access |

### Admin Payment Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│               PAYMENT OVERVIEW DASHBOARD                     │
└─────────────────────────────────────────────────────────────┘

Total Members: 150
├─ 🟢 Up to Date    : 120 members (80%)
├─ 🟡 Due Soon      : 20 members (13%)
├─ 🔴 Overdue       : 8 members (5%)
└─ ⚫ Suspended     : 2 members (2%)

MONTHLY REVENUE:
├─ Expected (Current Month): Rs. [Y × 150]
├─ Collected: Rs. [Y × 128]
├─ Pending: Rs. [Y × 22]
└─ Collection Rate: 85%

RECENT PAYMENTS (Last 7 Days):
┌────────┬──────────────┬─────────┬────────────┬────────┐
│ Date   │ Member       │ Amount  │ Method     │ Status │
├────────┼──────────────┼─────────┼────────────┼────────┤
│ Jan 25 │ John Doe     │ Rs. 3Y  │ Bank       │ ✅ Verified │
│ Jan 25 │ Jane Smith   │ Rs. Y   │ Cash       │ ✅ Verified │
│ Jan 24 │ Bob Wilson   │ Rs. 6Y  │ Bank       │ ⏳ Pending  │
│ Jan 24 │ Alice Brown  │ Rs. Y   │ Online     │ ✅ Verified │
└────────┴──────────────┴─────────┴────────────┴────────┘

PENDING VERIFICATIONS: 3 payments
[View All] [Export Report] [Send Reminders]
```

### Payment Notifications

#### Auto Email Reminders

1. **Due Soon (7 days before)**
   ```
   Subject: Payment Reminder - NYSC Membership
   
   Dear [Name],
   
   Your monthly membership payment is due on [Date].
   
   Amount Due: Rs. [Y]
   Member ID: #M001
   
   [Pay Now] [View Details]
   ```

2. **Overdue Notice (3 days after)**
   ```
   Subject: Overdue Payment - NYSC Membership
   
   Dear [Name],
   
   Your payment for [Month] is overdue.
   
   Please make payment to avoid service suspension.
   
   [Pay Now] [Contact Admin]
   ```

3. **Suspension Warning (20 days after)**
   ```
   Subject: Urgent - Membership Suspension Warning
   
   Dear [Name],
   
   Your membership will be suspended in 10 days if payment is not received.
   
   [Pay Now] [Request Extension]
   ```

---

## 📊 Attendance System

### Attendance Tracking Methods

#### 1. QR Code Check-in (Primary)
```
Member arrives → Shows QR code → Staff/Coach scans → Auto-recorded
```

#### 2. Manual Check-in (Backup)
```
Staff/Coach → Search member → Select sport → Mark present
```

#### 3. Bulk Attendance
```
Coach → View class roster → Multi-select present members → Submit
```

### Attendance Dashboard

#### Admin View
```
TODAY'S ATTENDANCE - January 26, 2026

Total Check-ins: 45 members

BY SPORT:
├─ Cricket       : 12 members
├─ Football      : 15 members
├─ Basketball    : 8 members
├─ Swimming      : 6 members
└─ Gym/Fitness   : 4 members

RECENT CHECK-INS:
┌──────────┬──────────────┬────────────┬──────────┐
│ Time     │ Member       │ Sport      │ Location │
├──────────┼──────────────┼────────────┼──────────┤
│ 04:45 PM │ John Doe     │ Cricket    │ Ground A │
│ 04:40 PM │ Jane Smith   │ Football   │ Ground B │
│ 04:35 PM │ Bob Wilson   │ Basketball │ Court 1  │
└──────────┴──────────────┴────────────┴──────────┘
```

#### Member View
```
MY ATTENDANCE HISTORY

This Month: 12 days (Jan 2026)
Last Month: 15 days (Dec 2025)

RECENT ATTENDANCE:
┌────────────┬──────────┬──────────┬──────────┐
│ Date       │ Sport    │ Time     │ Duration │
├────────────┼──────────┼──────────┼──────────┤
│ Jan 25     │ Cricket  │ 04:30 PM │ 2 hours  │
│ Jan 24     │ Football │ 05:00 PM │ 1.5 hours│
│ Jan 23     │ Cricket  │ 04:30 PM │ 2 hours  │
└────────────┴──────────┴──────────┴──────────┘

[View Full History] [Download Report]
```

---

## 🗄️ Database Structure

### Core Tables

#### 1. users
```sql
id                  : bigint (PK)
name                : string
email               : string (unique)
email_verified_at   : timestamp
password            : string
remember_token      : string
created_at          : timestamp
updated_at          : timestamp
```

#### 2. members
```sql
id                  : bigint (PK)
user_id             : bigint (FK → users.id)
member_number       : string (unique) e.g., M0001
nic_passport        : string (unique)
date_of_birth       : date
gender              : enum (male, female, other)
contact_number      : string
address             : text
emergency_contact   : string
emergency_number    : string
photo_url           : string (nullable)
registration_date   : date
status              : enum (pending, active, suspended, inactive)
approved_by         : bigint (FK → users.id, nullable)
approved_at         : timestamp (nullable)
created_at          : timestamp
updated_at          : timestamp
deleted_at          : timestamp (soft delete)
```

#### 3. sports
```sql
id                  : bigint (PK)
name                : string
description         : text
admission_fee       : decimal(10,2) (Sport-specific admission fee)
monthly_fee         : decimal(10,2) (Sport-specific monthly fee)
capacity            : integer (nullable)
location            : string
schedule            : json (nullable)
is_active           : boolean
created_at          : timestamp
updated_at          : timestamp
```

#### 4. member_sports
```sql
id                  : bigint (PK)
member_id           : bigint (FK → members.id)
sport_id            : bigint (FK → sports.id)
enrolled_at         : timestamp
status              : enum (active, inactive)
created_at          : timestamp
updated_at          : timestamp

UNIQUE(member_id, sport_id)
```

#### 5. payments
```sql
id                  : bigint (PK)
member_id           : bigint (FK → members.id)
type                : enum (admission, monthly, bulk)
amount              : decimal(10,2)
month_year          : string (nullable) e.g., "2026-01"
months_count        : integer (for bulk, default 1)
status              : enum (pending, paid, verified, rejected)
due_date            : date
paid_date           : date (nullable)
payment_method      : enum (cash, bank_transfer, online)
receipt_url         : string (nullable)
reference_number    : string (nullable)
notes               : text (nullable)
verified_by         : bigint (FK → users.id, nullable)
verified_at         : timestamp (nullable)
created_at          : timestamp
updated_at          : timestamp
```

#### 6. member_payment_schedule
```sql
id                  : bigint (PK)
member_id           : bigint (FK → members.id)
month_year          : string e.g., "2026-01"
amount              : decimal(10,2)
status              : enum (pending, paid, overdue, waived)
due_date            : date
payment_id          : bigint (FK → payments.id, nullable)
created_at          : timestamp
updated_at          : timestamp

UNIQUE(member_id, month_year)
```

#### 7. attendances
```sql
id                  : bigint (PK)
member_id           : bigint (FK → members.id)
sport_id            : bigint (FK → sports.id)
check_in_time       : timestamp
check_out_time      : timestamp (nullable)
duration_minutes    : integer (nullable)
marked_by           : bigint (FK → users.id)
method              : enum (qr_code, manual, bulk)
notes               : text (nullable)
created_at          : timestamp
updated_at          : timestamp
```

#### 8. coaches
```sql
id                  : bigint (PK)
user_id             : bigint (FK → users.id)
name                : string
contact_number      : string
specialization      : string
experience_years    : integer
is_active           : boolean
created_at          : timestamp
updated_at          : timestamp
```

#### 9. coach_sports
```sql
id                  : bigint (PK)
coach_id            : bigint (FK → coaches.id)
sport_id            : bigint (FK → sports.id)
assigned_at         : timestamp
created_at          : timestamp
updated_at          : timestamp

UNIQUE(coach_id, sport_id)
```

#### 10. activity_logs (Audit Trail)
```sql
id                  : bigint (PK)
user_id             : bigint (FK → users.id)
action              : string e.g., "created_member"
model_type          : string e.g., "App\Models\Member"
model_id            : bigint
description         : text
ip_address          : string
user_agent          : string
changes             : json (nullable)
created_at          : timestamp
```

### Spatie Permission Tables (Auto-created)

#### roles
```sql
id          : bigint (PK)
name        : string
guard_name  : string
created_at  : timestamp
updated_at  : timestamp
```

#### permissions
```sql
id          : bigint (PK)
name        : string
guard_name  : string
created_at  : timestamp
updated_at  : timestamp
```

#### model_has_roles
```sql
role_id     : bigint (FK → roles.id)
model_type  : string
model_id    : bigint

PRIMARY KEY (role_id, model_id, model_type)
```

#### model_has_permissions
```sql
permission_id : bigint (FK → permissions.id)
model_type    : string
model_id      : bigint

PRIMARY KEY (permission_id, model_id, model_type)
```

#### role_has_permissions
```sql
permission_id : bigint (FK → permissions.id)
role_id       : bigint (FK → roles.id)

PRIMARY KEY (permission_id, role_id)
```

---

## 🚀 Development Phases

### Phase 1: MVP (4-6 Weeks)

#### Week 1-2: Foundation Setup
- ✅ Laravel 12 project setup
- ✅ Database design & migrations
- ✅ Spatie Permission package integration
- ✅ Laravel Breeze + React installation
- ✅ User authentication (Login/Register)
- ✅ Role seeding (Super Admin, Admin, Staff, Coach, Member)
- ✅ Permission seeding

#### Week 3-4: Core Features
**Member Management**
- ✅ Public registration form
- ✅ Admin approval system
- ✅ Member CRUD operations
- ✅ Sport selection during registration
- ✅ Profile photo upload
- ✅ Auto account creation after approval

**Payment System**
- ✅ Admission + Monthly payment structure
- ✅ Payment recording (Bank/Cash)
- ✅ Payment verification by admin
- ✅ Payment schedule auto-generation
- ✅ Payment history view
- ✅ Bulk payment option

#### Week 5-6: Attendance & Dashboard
**Attendance System**
- ✅ QR code generation for members
- ✅ QR code scanning (mobile-friendly)
- ✅ Manual attendance marking
- ✅ Attendance history

**Dashboards**
- ✅ Admin dashboard (overview stats)
- ✅ Member dashboard (own data)
- ✅ Payment dashboard
- ✅ Attendance dashboard

### Phase 2: Enhancement (4-6 Weeks)

#### Features
- ✅ Coach management & assignment
- ✅ Sport capacity management
- ✅ Advanced reports (PDF/Excel export)
- ✅ Payment reminders (Email)
- ✅ Overdue payment tracking
- ✅ Member suspension automation
- ✅ Bulk attendance marking
- ✅ Search & filter improvements
- ✅ Activity audit logs

### Phase 3: Scale & Optimization (3-4 Weeks)

#### Features
- ✅ SMS notifications integration
- ✅ Online payment gateway
- ✅ Mobile app (React Native - Optional)
- ✅ Performance optimization
- ✅ Advanced analytics
- ✅ Multi-branch support (if needed)
- ✅ API for third-party integrations

---

## 📱 Key User Interfaces

### 1. Public Registration Page
```
┌─────────────────────────────────────────────────────┐
│          NYSC Sports Club - Register                │
│                                                      │
│  Personal Information:                               │
│  ├─ Full Name          : [____________]             │
│  ├─ NIC/Passport       : [____________]             │
│  ├─ Date of Birth      : [dd/mm/yyyy]               │
│  ├─ Gender             : (•) Male () Female         │
│  ├─ Contact Number     : [____________]             │
│  ├─ Email              : [____________]             │
│  ├─ Address            : [____________]             │
│  ├─ Emergency Contact  : [____________]             │
│  ├─ Emergency Number   : [____________]             │
│  └─ Photo              : [Choose File]              │
│                                                      │
│  Select Sports/Activities:                           │
│  ☑ Cricket         ☑ Football       ☐ Basketball    │
│  ☐ Volleyball      ☐ Badminton      ☐ Table Tennis  │
│  ☐ Swimming        ☐ Athletics      ☐ Gym/Fitness   │
│  ☐ Yoga            ☐ Martial Arts                   │
│                                                      │
│  Payment Summary:                                    │
│  Selected Sports:                                    │
│  ├─ Cricket      : Rs. 500 + Rs. 2,500/mo          │
│  └─ Football     : Rs. 500 + Rs. 2,500/mo          │
│                                                      │
│  Payment Breakdown:                                  │
│  ├─ Total Admission  : Rs. 1,000 (one-time)        │
│  ├─ Total Monthly    : Rs. 5,000/month              │
│  ├─ First Month      : Rs. 5,000                    │
│  └─ Total Due Now    : Rs. 6,000                    │
│                                                      │
│  Payment Method:                                     │
│  (•) Bank Transfer  () Cash at Office               │
│                                                      │
│  Upload Receipt: [Choose File]                       │
│                                                      │
│             [Submit Registration]                    │
└─────────────────────────────────────────────────────┘
```

### 2. Admin Dashboard
```
┌─────────────────────────────────────────────────────┐
│  NYSC Admin Dashboard                    👤 Admin   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📊 Quick Stats                                      │
│  ┌──────────┬──────────┬──────────┬──────────┐     │
│  │ Members  │ Pending  │ Revenue  │ Attendance│     │
│  │   150    │    12    │ Rs.300K  │    45     │     │
│  └──────────┴──────────┴──────────┴──────────┘     │
│                                                      │
│  ⚠️ Pending Actions                                  │
│  ├─ 12 Registration approvals needed                │
│  ├─ 5 Payment verifications pending                 │
│  └─ 8 Members with overdue payments                 │
│                                                      │
│  📈 This Month (January 2026)                        │
│  ├─ New Members: 15                                 │
│  ├─ Revenue: Rs. 300,000                            │
│  ├─ Avg Attendance: 42 members/day                  │
│  └─ Collection Rate: 85%                            │
│                                                      │
│  🔔 Recent Activity                                  │
│  ├─ John Doe registered (5 mins ago)                │
│  ├─ Jane Smith paid Rs. 2000 (15 mins ago)          │
│  └─ Bob Wilson checked in - Cricket (20 mins ago)   │
│                                                      │