# NYSC Sports Club - Laravel Project Structure

## 📁 Complete Folder Structure

```
nysc-sports-club/
│
├── app/
│   ├── Actions/
│   │   ├── Members/
│   │   │   ├── CreateMemberAccountAction.php
│   │   │   ├── GenerateMemberNumberAction.php
│   │   │   ├── ApproveMemberRegistrationAction.php
│   │   │   └── SuspendMemberAction.php
│   │   │
│   │   ├── Payments/
│   │   │   ├── CalculateMembershipFeeAction.php
│   │   │   ├── ProcessPaymentAction.php
│   │   │   ├── GeneratePaymentScheduleAction.php
│   │   │   ├── ApplyBulkDiscountAction.php
│   │   │   └── VerifyPaymentAction.php
│   │   │
│   │   └── Attendance/
│   │       ├── MarkAttendanceAction.php
│   │       └── GenerateQRCodeAction.php
│   │
│   ├── Console/
│   │   └── Commands/
│   │       ├── SendPaymentRemindersCommand.php
│   │       ├── SuspendOverdueMembersCommand.php
│   │       └── GenerateMonthlyReportsCommand.php
│   │
│   ├── DTOs/
│   │   ├── MemberRegistrationData.php
│   │   ├── PaymentData.php
│   │   ├── AttendanceData.php
│   │   └── SportData.php
│   │
│   ├── Enums/
│   │   ├── MemberStatus.php
│   │   ├── PaymentStatus.php
│   │   ├── PaymentMethod.php
│   │   ├── PaymentType.php
│   │   ├── AttendanceMethod.php
│   │   └── UserRole.php
│   │
│   ├── Events/
│   │   ├── Members/
│   │   │   ├── MemberRegistered.php
│   │   │   ├── MemberApproved.php
│   │   │   ├── MemberRejected.php
│   │   │   ├── MemberSuspended.php
│   │   │   └── MemberReactivated.php
│   │   │
│   │   ├── Payments/
│   │   │   ├── PaymentReceived.php
│   │   │   ├── PaymentVerified.php
│   │   │   ├── PaymentRejected.php
│   │   │   ├── PaymentOverdue.php
│   │   │   └── BulkPaymentProcessed.php
│   │   │
│   │   └── Attendance/
│   │       ├── AttendanceMarked.php
│   │       └── AttendanceUpdated.php
│   │
│   ├── Exceptions/
│   │   ├── MemberNotFoundException.php
│   │   ├── InsufficientPaymentException.php
│   │   ├── SportCapacityExceededException.php
│   │   └── DuplicateMemberException.php
│   │
│   ├── Helpers/
│   │   └── helpers.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── MemberController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   ├── AttendanceController.php
│   │   │   │   ├── SportController.php
│   │   │   │   ├── CoachController.php
│   │   │   │   ├── ReportController.php
│   │   │   │   └── SettingsController.php
│   │   │   │
│   │   │   ├── Member/
│   │   │   │   ├── ProfileController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   ├── AttendanceController.php
│   │   │   │   └── MembershipCardController.php
│   │   │   │
│   │   │   ├── Coach/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── AttendanceController.php
│   │   │   │   └── MemberController.php
│   │   │   │
│   │   │   ├── Auth/
│   │   │   │   ├── RegisterController.php
│   │   │   │   └── LoginController.php
│   │   │   │
│   │   │   └── PublicRegistrationController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── EnsureUserHasRole.php
│   │   │   ├── EnsureUserHasPermission.php
│   │   │   ├── CheckMembershipStatus.php
│   │   │   └── LogActivity.php
│   │   │
│   │   ├── Requests/
│   │   │   ├── Members/
│   │   │   │   ├── StoreMemberRequest.php
│   │   │   │   ├── UpdateMemberRequest.php
│   │   │   │   ├── ApproveMemberRequest.php
│   │   │   │   └── PublicRegistrationRequest.php
│   │   │   │
│   │   │   ├── Payments/
│   │   │   │   ├── StorePaymentRequest.php
│   │   │   │   ├── VerifyPaymentRequest.php
│   │   │   │   └── BulkPaymentRequest.php
│   │   │   │
│   │   │   ├── Attendance/
│   │   │   │   ├── MarkAttendanceRequest.php
│   │   │   │   └── BulkAttendanceRequest.php
│   │   │   │
│   │   │   └── Sports/
│   │   │       ├── StoreSportRequest.php
│   │   │       └── UpdateSportRequest.php
│   │   │
│   │   └── Resources/
│   │       ├── MemberResource.php
│   │       ├── PaymentResource.php
│   │       ├── AttendanceResource.php
│   │       ├── SportResource.php
│   │       ├── CoachResource.php
│   │       └── UserResource.php
│   │
│   ├── Interfaces/
│   │   ├── MemberRepositoryInterface.php
│   │   ├── PaymentRepositoryInterface.php
│   │   ├── AttendanceRepositoryInterface.php
│   │   └── SportRepositoryInterface.php
│   │
│   ├── Jobs/
│   │   ├── SendWelcomeEmailJob.php
│   │   ├── SendPaymentReminderJob.php
│   │   ├── SendOverdueNoticeJob.php
│   │   ├── GenerateMembershipCardJob.php
│   │   ├── GenerateMonthlyReportJob.php
│   │   └── ProcessBulkPaymentJob.php
│   │
│   ├── Listeners/
│   │   ├── Members/
│   │   │   ├── SendRegistrationConfirmationEmail.php
│   │   │   ├── CreateMemberAccount.php
│   │   │   ├── SendWelcomeEmail.php
│   │   │   ├── GenerateMembershipCard.php
│   │   │   ├── CreatePaymentSchedule.php
│   │   │   └── LogMemberActivity.php
│   │   │
│   │   ├── Payments/
│   │   │   ├── SendPaymentConfirmationEmail.php
│   │   │   ├── UpdatePaymentSchedule.php
│   │   │   ├── SendPaymentReceipt.php
│   │   │   ├── SendOverdueNotification.php
│   │   │   └── LogPaymentActivity.php
│   │   │
│   │   └── Attendance/
│   │       ├── UpdateAttendanceStats.php
│   │       └── LogAttendanceActivity.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Member.php
│   │   ├── Sport.php
│   │   ├── MemberSport.php
│   │   ├── Payment.php
│   │   ├── MemberPaymentSchedule.php
│   │   ├── Attendance.php
│   │   ├── Coach.php
│   │   ├── CoachSport.php
│   │   └── ActivityLog.php
│   │
│   ├── Notifications/
│   │   ├── MemberApprovedNotification.php
│   │   ├── MemberRejectedNotification.php
│   │   ├── PaymentDueNotification.php
│   │   ├── PaymentOverdueNotification.php
│   │   ├── PaymentReceivedNotification.php
│   │   ├── SuspensionWarningNotification.php
│   │   └── WelcomeNotification.php
│   │
│   ├── Observers/
│   │   ├── MemberObserver.php
│   │   ├── PaymentObserver.php
│   │   └── AttendanceObserver.php
│   │
│   ├── Policies/
│   │   ├── MemberPolicy.php
│   │   ├── PaymentPolicy.php
│   │   ├── AttendancePolicy.php
│   │   ├── SportPolicy.php
│   │   └── CoachPolicy.php
│   │
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── EventServiceProvider.php
│   │   └── RepositoryServiceProvider.php
│   │
│   ├── Repositories/
│   │   ├── MemberRepository.php
│   │   ├── PaymentRepository.php
│   │   ├── AttendanceRepository.php
│   │   ├── SportRepository.php
│   │   └── CoachRepository.php
│   │
│   ├── Rules/
│   │   ├── ValidNicNumber.php
│   │   ├── UniqueMemberEmail.php
│   │   ├── ValidPaymentAmount.php
│   │   └── ValidSportCapacity.php
│   │
│   ├── Services/
│   │   ├── MemberService.php
│   │   ├── PaymentService.php
│   │   ├── AttendanceService.php
│   │   ├── SportService.php
│   │   ├── CoachService.php
│   │   ├── ReportService.php
│   │   ├── NotificationService.php
│   │   └── QRCodeService.php
│   │
│   └── Traits/
│       ├── HasPayments.php
│       ├── HasAttendance.php
│       ├── HasSports.php
│       └── Loggable.php
│
├── bootstrap/
│   ├── app.php
│   └── cache/
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── permission.php
│   ├── mail.php
│   ├── queue.php
│   └── services.php
│
├── database/
│   ├── factories/
│   │   ├── UserFactory.php
│   │   ├── MemberFactory.php
│   │   ├── PaymentFactory.php
│   │   └── SportFactory.php
│   │
│   ├── migrations/
│   │   ├── 2024_01_01_000000_create_users_table.php
│   │   ├── 2024_01_01_000001_create_password_reset_tokens_table.php
│   │   ├── 2024_01_01_000002_create_sessions_table.php
│   │   ├── 2024_01_01_000003_create_permission_tables.php
│   │   ├── 2024_01_02_000000_create_members_table.php
│   │   ├── 2024_01_02_000001_create_sports_table.php
│   │   ├── 2024_01_02_000002_create_member_sports_table.php
│   │   ├── 2024_01_02_000003_create_payments_table.php
│   │   ├── 2024_01_02_000004_create_member_payment_schedules_table.php
│   │   ├── 2024_01_02_000005_create_attendances_table.php
│   │   ├── 2024_01_02_000006_create_coaches_table.php
│   │   ├── 2024_01_02_000007_create_coach_sports_table.php
│   │   └── 2024_01_02_000008_create_activity_logs_table.php
│   │
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RoleAndPermissionSeeder.php
│       ├── UserSeeder.php
│       ├── SportSeeder.php
│       ├── MemberSeeder.php
│       └── PaymentSeeder.php
│
├── public/
│   ├── index.php
│   ├── assets/
│   ├── uploads/
│   │   ├── members/
│   │   ├── payments/
│   │   └── receipts/
│   └── build/
│
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Members/
│   │   │   │   │   ├── MemberList.jsx
│   │   │   │   │   ├── MemberForm.jsx
│   │   │   │   │   ├── MemberDetails.jsx
│   │   │   │   │   └── PendingApprovals.jsx
│   │   │   │   ├── Payments/
│   │   │   │   │   ├── PaymentList.jsx
│   │   │   │   │   ├── PaymentForm.jsx
│   │   │   │   │   ├── PaymentVerification.jsx
│   │   │   │   │   └── PaymentDashboard.jsx
│   │   │   │   ├── Attendance/
│   │   │   │   │   ├── AttendanceList.jsx
│   │   │   │   │   ├── MarkAttendance.jsx
│   │   │   │   │   ├── QRScanner.jsx
│   │   │   │   │   └── AttendanceDashboard.jsx
│   │   │   │   ├── Sports/
│   │   │   │   │   ├── SportList.jsx
│   │   │   │   │   ├── SportForm.jsx
│   │   │   │   │   └── SportDetails.jsx
│   │   │   │   └── Reports/
│   │   │   │       ├── MemberReport.jsx
│   │   │   │       ├── PaymentReport.jsx
│   │   │   │       ├── AttendanceReport.jsx
│   │   │   │       └── RevenueReport.jsx
│   │   │   │
│   │   │   ├── Member/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── PaymentHistory.jsx
│   │   │   │   ├── MakePayment.jsx
│   │   │   │   ├── AttendanceHistory.jsx
│   │   │   │   └── MembershipCard.jsx
│   │   │   │
│   │   │   ├── Coach/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyMembers.jsx
│   │   │   │   └── MarkAttendance.jsx
│   │   │   │
│   │   │   ├── Shared/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   │
│   │   │   └── Auth/
│   │   │       ├── Login.jsx
│   │   │       ├── Register.jsx
│   │   │       └── ForgotPassword.jsx
│   │   │
│   │   ├── Pages/
│   │   │   ├── Welcome.jsx
│   │   │   ├── PublicRegistration.jsx
│   │   │   └── About.jsx
│   │   │
│   │   ├── Layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── MemberLayout.jsx
│   │   │   ├── CoachLayout.jsx
│   │   │   └── GuestLayout.jsx
│   │   │
│   │   ├── app.jsx
│   │   └── bootstrap.js
│   │
│   ├── css/
│   │   └── app.css
│   │
│   └── views/
│       └── app.blade.php
│
├── routes/
│   ├── web.php
│   ├── api.php
│   ├── console.php
│   └── channels.php
│
├── storage/
│   ├── app/
│   │   ├── public/
│   │   │   ├── members/
│   │   │   ├── payments/
│   │   │   └── qrcodes/
│   │   └── private/
│   ├── framework/
│   ├── logs/
│   └── exports/
│
├── tests/
│   ├── Feature/
│   │   ├── MemberManagementTest.php
│   │   ├── PaymentProcessingTest.php
│   │   ├── AttendanceTrackingTest.php
│   │   └── AuthorizationTest.php
│   │
│   └── Unit/
│       ├── MemberServiceTest.php
│       ├── PaymentServiceTest.php
│       ├── CalculateFeeActionTest.php
│       └── GenerateMemberNumberTest.php
│
├── .env
├── .env.example
├── artisan
├── composer.json
├── package.json
├── phpunit.xml
├── README.md
└── vite.config.js
```

---

## 🔧 Component Explanations

### **1. Actions/** 
Single-responsibility tasks that are reusable across the application.

**Purpose:** Encapsulate specific business operations.

**Examples:**
- `CreateMemberAccountAction.php` - Creates user account for approved members
- `CalculateMembershipFeeAction.php` - Calculates total fees based on selected sports
- `GenerateMemberNumberAction.php` - Auto-generates unique member numbers (M0001, M0002...)
- `ProcessPaymentAction.php` - Handles payment processing logic
- `GeneratePaymentScheduleAction.php` - Creates monthly payment schedule for members

**Usage:**
```php
use App\Actions\Members\CreateMemberAccountAction;

$action = new CreateMemberAccountAction();
$user = $action->execute($member, $password);
```

---

### **2. Console/Commands/**
Artisan commands for scheduled or manual tasks.

**Purpose:** Background jobs, cron tasks, maintenance.

**Examples:**
- `SendPaymentRemindersCommand.php` - Daily job to send payment reminders
- `SuspendOverdueMembersCommand.php` - Suspend members with 30+ days overdue
- `GenerateMonthlyReportsCommand.php` - Generate monthly reports

**Usage:**
```bash
php artisan payment:send-reminders
php artisan members:suspend-overdue
php artisan reports:generate-monthly
```

---

### **3. DTOs/** (Data Transfer Objects)
Clean data structures for passing data between layers.

**Purpose:** Type-safe, validated data containers.

**Example:**
```php
class MemberRegistrationData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $nic,
        public array $sports,
        public ?string $photo = null
    ) {}
    
    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->name,
            email: $request->email,
            nic: $request->nic,
            sports: $request->sports,
            photo: $request->photo
        );
    }
}
```

**Usage:**
```php
$data = MemberRegistrationData::fromRequest($request);
$member = $memberService->register($data);
```

---

### **4. Enums/**
Type-safe constants and status values.

**Purpose:** Define fixed values, prevent typos, better IDE support.

**Examples:**
```php
enum MemberStatus: string
{
    case PENDING_APPROVAL = 'pending_approval';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case INACTIVE = 'inactive';
    
    public function label(): string
    {
        return match($this) {
            self::PENDING_APPROVAL => 'Pending Approval',
            self::ACTIVE => 'Active',
            self::SUSPENDED => 'Suspended',
            self::INACTIVE => 'Inactive',
        };
    }
}

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case VERIFIED = 'verified';
    case OVERDUE = 'overdue';
    case REJECTED = 'rejected';
}

enum PaymentMethod: string
{
    case CASH = 'cash';
    case BANK_TRANSFER = 'bank_transfer';
    case ONLINE = 'online';
}
```

**Usage:**
```php
$member->status = MemberStatus::ACTIVE;
$payment->status = PaymentStatus::PAID;

if ($member->status === MemberStatus::SUSPENDED) {
    // Handle suspended member
}
```

---

### **5. Events/**
Something happened in the system that others might care about.

**Purpose:** Decouple code, trigger multiple actions.

**Examples:**
```php
class MemberApproved
{
    public function __construct(
        public Member $member
    ) {}
}

class PaymentReceived
{
    public function __construct(
        public Payment $payment,
        public Member $member
    ) {}
}
```

**Dispatching:**
```php
event(new MemberApproved($member));
// or
MemberApproved::dispatch($member);
```

---

### **6. Listeners/**
React to events and perform actions.

**Purpose:** Handle event consequences (emails, logging, updates).

**Examples:**
```php
class SendWelcomeEmail
{
    public function handle(MemberApproved $event): void
    {
        Mail::to($event->member->email)
            ->send(new WelcomeEmail($event->member));
    }
}

class CreatePaymentSchedule
{
    public function handle(MemberApproved $event): void
    {
        $this->paymentService
            ->generateSchedule($event->member);
    }
}
```

**Registration (EventServiceProvider):**
```php
protected $listen = [
    MemberApproved::class => [
        SendWelcomeEmail::class,
        CreateMemberAccount::class,
        GenerateMembershipCard::class,
        CreatePaymentSchedule::class,
    ],
];
```

---

### **7. Exceptions/**
Custom exception classes for better error handling.

**Purpose:** Meaningful error messages, specific handling.

**Examples:**
```php
class MemberNotFoundException extends Exception
{
    public static function withId(int $id): self
    {
        return new self("Member with ID {$id} not found.");
    }
}

class SportCapacityExceededException extends Exception
{
    public static function forSport(Sport $sport): self
    {
        return new self(
            "Sport '{$sport->name}' has reached maximum capacity of {$sport->capacity}."
        );
    }
}
```

**Usage:**
```php
throw MemberNotFoundException::withId($id);
throw SportCapacityExceededException::forSport($sport);
```

---

### **8. Helpers/helpers.php**
Global utility functions.

**Purpose:** Reusable functions available everywhere.

**Examples:**
```php
function formatCurrency($amount): string
{
    return 'Rs. ' . number_format($amount, 2);
}

function generateMemberNumber(): string
{
    $lastMember = Member::latest('id')->first();
    $nextNumber = $lastMember ? $lastMember->id + 1 : 1;
    return 'M' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
}

function calculateDateDifference($from, $to): int
{
    return Carbon::parse($from)->diffInDays(Carbon::parse($to));
}
```

**Usage:**
```php
echo formatCurrency(2500); // Rs. 2,500.00
$memberNumber = generateMemberNumber(); // M0001
```

---

### **9. Http/Controllers/**
Handle HTTP requests and return responses.

**Purpose:** Route logic, call services, return views/JSON.

**Structure:**
- **Admin/** - Admin panel controllers
- **Member/** - Member portal controllers
- **Coach/** - Coach panel controllers
- **Auth/** - Authentication controllers

**Example:**
```php
class MemberController extends Controller
{
    public function __construct(
        private MemberService $memberService
    ) {}
    
    public function index(Request $request)
    {
        $this->authorize('viewAny', Member::class);
        
        $members = $this->memberService->paginate($request);
        
        return inertia('Admin/Members/Index', [
            'members' => MemberResource::collection($members)
        ]);
    }
    
    public function store(StoreMemberRequest $request)
    {
        $data = MemberRegistrationData::fromRequest($request);
        $member = $this->memberService->create($data);
        
        return redirect()
            ->route('admin.members.show', $member)
            ->with('success', 'Member created successfully');
    }
}
```

---

### **10. Http/Middleware/**
Filter HTTP requests before they reach controllers.

**Purpose:** Authentication, authorization, logging.

**Examples:**
```php
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        if (!$request->user()->hasRole($role)) {
            abort(403, 'Unauthorized action.');
        }
        
        return $next($request);
    }
}

class CheckMembershipStatus
{
    public function handle(Request $request, Closure $next)
    {
        $member = $request->user()->member;
        
        if ($member->status === MemberStatus::SUSPENDED) {
            return redirect()
                ->route('member.suspended')
                ->with('error', 'Your membership is suspended');
        }
        
        return $next($request);
    }
}
```

**Usage in routes:**
```php
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Admin routes
});
```

---

### **11. Http/Requests/**
Form validation with authorization.

**Purpose:** Validate incoming data, check permissions.

**Example:**
```php
class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Member::class);
    }
    
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'nic' => ['required', 'string', 'unique:members,nic_passport'],
            'sports' => ['required', 'array', 'min:1'],
            'sports.*' => ['exists:sports,id'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'sports.required' => 'Please select at least one sport',
            'nic.unique' => 'This NIC is already registered',
        ];
    }
}
```

---

### **12. Http/Resources/**
Transform models into JSON responses.

**Purpose:** Consistent API responses, hide sensitive data.

**Example:**
```php
class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_number' => $this->member_number,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'sports' => SportResource::collection($this->whenLoaded('sports')),
            'total_payments' => $this->when(
                $request->user()->can('viewPayments', $this->resource),
                $this->payments->sum('amount')
            ),
            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}
```

---

### **13. Interfaces/**
Contracts for repositories and services.

**Purpose:** Dependency injection, easier testing, swappable implementations.

**Example:**
```php
interface MemberRepositoryInterface
{
    public function find(int $id): ?Member;
    public function findByNic(string $nic): ?Member;
    public function create(array $data): Member;
    public function update(Member $member, array $data): Member;
    public function delete(Member $member): bool;
    public function getActiveMembers(): Collection;
    public function getMembersWithOverduePayments(): Collection;
}
```

**Binding (RepositoryServiceProvider):**
```php
$this->app->bind(
    MemberRepositoryInterface::class,
    MemberRepository::class
);
```

---

### **14. Jobs/**
Background tasks that can be queued.

**Purpose:** Async processing, heavy tasks, scheduled jobs.

**Examples:**
```php
class SendWelcomeEmailJob implements ShouldQueue
{
    use Queueable;
    
    public function __construct(
        public Member $member
    ) {}
    
    public function handle(): void
    {
        Mail::to($this->member->email)
            ->send(new WelcomeEmail($this->member));
    }
}
```

**Dispatching:**
```php
SendWelcomeEmailJob::dispatch($member);
SendWelcomeEmailJob::dispatch($member)->delay(now()->addMinutes(5));
```

---

### **15. Models/**
Database tables as PHP objects.

**Purpose:** Represent data, relationships, scopes.

**Example:**
```php
class Member extends Model
{
    use HasFactory, SoftDeletes, HasUuids;
    
    protected $fillable = [
        'user_id', 'member_number', 'nic_passport',
        'date_of_birth', 'status', 'photo_url'
    ];
    
    protected $casts = [
        'status' => MemberStatus::class,
        'date_of_birth' => 'date',
    ];
    
    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function sports()
    {
        return $this->belongsToMany(Sport::class, 'member_sports')
            ->withTimestamps();
    }
    
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
    
    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', MemberStatus::ACTIVE);
    }
    
    public function scopeOverdue($query)
    {
        return $query->whereHas('paymentSchedule', function ($q) {
            $q->where('status', PaymentStatus::OVERDUE);
        });
    }
    
    // Accessors
    public function getTotalPaidAttribute()
    {
        return $this->payments()
            ->where('status', PaymentStatus::PAID)
            ->sum('amount');
    }
}
```

---

### **16. Notifications/**
Multi-channel notifications (email, SMS, database).

**Purpose:** Send alerts to users.

**Example:**
```php
class PaymentDueNotification extends Notification
{
    public function __construct(
        public Payment $payment
    ) {}
    
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }
    
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Payment Due Reminder')
            ->line('Your monthly payment is due.')
            ->line('Amount: ' . formatCurrency($this->payment->amount))
            ->line('Due Date: ' . $this->payment->due_date->format('Y-m-d'))
            ->action('Pay Now', url('/member/payments'))
            ->line('Thank you!');
    }
    
    public function toArray($notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'due_date' => $this->payment->due_date,
        ];
    }
}
```

**Sending:**
```php
$member->notify(new PaymentDueNotification($payment));
```

---

### **17. Observers/**
Automatically react to model events.

**Purpose:** Auto-generate values, log changes, cleanup.

**Example:**
```php
class MemberObserver
{
    public function creating(Member $member): void
    {
        // Auto-generate member number
        $member->member_number = generateMemberNumber();
    }
    
    public function created(Member $member): void
    {
        // Log creation
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'created_member',
            'model_type' => Member::class,
            'model_id' => $member->id,
            'description' => "Created member: {$member->name}",
        ]);
    }
    
    public function updating(Member $member): void
    {
        // Track changes
        $changes = $member->getDirty();
        $member->changes = json_encode($changes);
    }
    
    public function deleted(Member $member): void
    {
        // Cleanup related data
        $member->payments()->delete();
        $member->attendances()->delete();
    }
}
```

**Registration (AppServiceProvider):**
```php
Member::observe(MemberObserver::class);
```

---

### **18. Policies/**
Resource-level authorization logic.

**Purpose:** Check if user can perform action on specific resource.

**Example:**
```php
class MemberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-members');
    }
    
    public function view(User $user, Member $member): bool
    {
        // Admin can view any member
        if ($user->hasRole('admin')) {
            return true;
        }
        
        // Members can only view themselves
        if ($user->hasRole('member')) {
            return $user->id === $member->user_id;
        }
        
        // Coaches can view members in their sports
        if ($user->hasRole('coach')) {
            return $user->coach->sports
                ->pluck('id')
                ->intersect($member->sports->pluck('id'))
                ->isNotEmpty();
        }
        
        return false;
    }
    
    public function update(User $user, Member $member): bool
    {
        // Admin can edit anyone
        if ($user->hasRole('admin')) {
            return true;
        }
        
        // Staff can edit non-suspended members
        if ($user->hasRole('staff')) {
            return $member->status !== MemberStatus::SUSPENDED;
        }
        
        // Members can only edit themselves
        if ($user->hasRole('member')) {
            return $user->id === $member->user_id;
        }
        
        return false;
    }
    
    public function delete(User $user, Member $member): bool
    {
        return $user->hasRole('admin');
    }
}
```

**Usage:**
```php
// In controller
$this->authorize('update', $member);

// In blade
@can('update', $member)
    <button>Edit</button>
@endcan

// Manual check
if (Gate::allows('update', $member)) {
    // User can update
}
```

---

### **19. Repositories/**
Database query layer, separate from models.

**Purpose:** Complex queries, reusable data access.

**Example:**
```php
class MemberRepository implements MemberRepositoryInterface
{
    public function find(int $id): ?Member
    {
        return Member::with(['sports', 'payments'])->find($id);
    }
    
    public function getActiveMembers(): Collection
    {
        return Member::active()
            ->with('sports')
            ->orderBy('member_number')
            ->get();
    }
    
    public function getMembersWithOverduePayments(): Collection
    {
        return Member::whereHas('paymentSchedule', function ($query) {
            $query->where('status', PaymentStatus::OVERDUE)
                ->where('due_date', '<', now()->subDays(7));
        })
        ->with(['paymentSchedule' => function ($query) {
            $query->where('status', PaymentStatus::OVERDUE);
        }])
        ->get();
    }
    
    public function searchMembers(string $search): Collection
    {
        return Member::where('name', 'like', "%{$search}%")
            ->orWhere('member_number', 'like', "%{$search}%")
            ->orWhere('nic_passport', 'like', "%{$search}%")
            ->limit(20)
            ->get();
    }
}
```

**Usage in Service:**
```php
class MemberService
{
    public function __construct(
        private MemberRepositoryInterface $repository
    ) {}
    
    public function findOverdueMembers()
    {
        return $this->repository->getMembersWithOverduePayments();
    }
}
```

---

### **20. Rules/**
Custom validation rules.

**Purpose:** Reusable, complex validation logic.

**Example:**
```php
class ValidNicNumber implements Rule
{
    public function passes($attribute, $value): bool
    {
        // Old NIC: 9 digits + V (e.g., 123456789V)
        if (preg_match('/^\d{9}[Vv]$/', $value)) {
            return true;
        }
        
        // New NIC: 12 digits (e.g., 200012345678)
        if (preg_match('/^\d{12}$/', $value)) {
            return true;
        }
        
        return false;
    }
    
    public function message(): string
    {
        return 'The :attribute must be a valid NIC number.';
    }
}
```

**Usage:**
```php
'nic' => ['required', new ValidNicNumber],
```

---

### **21. Services/**
Business logic layer between controllers and repositories.

**Purpose:** Complex operations, calculations, orchestration.

**Example:**
```php
class PaymentService
{
    public function __construct(
        private PaymentRepository $paymentRepository,
        private CalculateMembershipFeeAction $calculateFeeAction,
        private GeneratePaymentScheduleAction $generateScheduleAction
    ) {}
    
    public function processRegistrationPayment(Member $member, array $sports): Payment
    {
        // Calculate fees
        $fees = $this->calculateFeeAction->execute($member, $sports);
        
        // Create payment
        $payment = $this->paymentRepository->create([
            'member_id' => $member->id,
            'type' => PaymentType::REGISTRATION,
            'amount' => $fees['admission'] + $fees['monthly'],
            'status' => PaymentStatus::PENDING,
            'due_date' => now(),
        ]);
        
        // Generate monthly schedule
        $this->generateScheduleAction->execute($member, $fees['monthly']);
        
        return $payment;
    }
    
    public function verifyPayment(Payment $payment, User $verifier): void
    {
        $payment->update([
            'status' => PaymentStatus::VERIFIED,
            'verified_by' => $verifier->id,
            'verified_at' => now(),
        ]);
        
        event(new PaymentVerified($payment));
    }
    
    public function calculateTotalFees(array $sports): array
    {
        $admission = 0;
        $monthly = 0;
        
        foreach ($sports as $sportId) {
            $sport = Sport::find($sportId);
            $admission += $sport->admission_fee;
            $monthly += $sport->monthly_fee;
        }
        
        return [
            'admission' => $admission,
            'monthly' => $monthly,
            'total' => $admission + $monthly,
        ];
    }
}
```

**Usage in Controller:**
```php
public function store(Request $request)
{
    $payment = $this->paymentService->processRegistrationPayment(
        $member,
        $request->sports
    );
    
    return response()->json(['payment' => $payment]);
}
```

---

### **22. Traits/**
Reusable code snippets for models.

**Purpose:** DRY (Don't Repeat Yourself), shared functionality.

**Example:**
```php
trait HasPayments
{
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
    
    public function getTotalPaidAttribute()
    {
        return $this->payments()
            ->where('status', PaymentStatus::PAID)
            ->sum('amount');
    }
    
    public function getOutstandingBalanceAttribute()
    {
        return $this->paymentSchedule()
            ->where('status', PaymentStatus::PENDING)
            ->sum('amount');
    }
    
    public function hasOverduePayments(): bool
    {
        return $this->paymentSchedule()
            ->where('status', PaymentStatus::OVERDUE)
            ->exists();
    }
}

trait Loggable
{
    protected static function bootLoggable()
    {
        static::created(function ($model) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'created',
                'model_type' => get_class($model),
                'model_id' => $model->id,
            ]);
        });
    }
}
```

**Usage:**
```php
class Member extends Model
{
    use HasPayments, Loggable;
    
    // Now member has all payment-related methods
}

$member->totalPaid;
$member->outstandingBalance;
$member->hasOverduePayments();
```

---

## 🔐 Spatie Permission vs Laravel Policies

### **When to Use What:**

#### **Spatie Permission Package**
**Purpose:** Role & Permission management system.

**Use for:**
- Defining roles (Admin, Staff, Coach, Member)
- Defining permissions (view-members, edit-members, delete-members)
- Assigning permissions to roles
- Checking "Does user have this permission?"

**Example:**
```php
// Setup (Seeder)
$admin = Role::create(['name' => 'admin']);
$permission = Permission::create(['name' => 'edit-members']);
$admin->givePermissionTo($permission);

// Assign role to user
$user->assignRole('admin');

// Check permission
if ($user->hasPermissionTo('edit-members')) {
    // User can edit members
}

// In Blade
@role('admin')
    <button>Admin Only</button>
@endrole

@can('edit-members')
    <button>Edit</button>
@endcan

// In routes
Route::middleware(['permission:edit-members'])->group(function () {
    // Protected routes
});
```

#### **Laravel Policies**
**Purpose:** Resource-level authorization.

**Use for:**
- Checking if user can access **specific resource**
- Complex logic for individual resources
- "Can THIS user edit THIS member?"

**Example:**
```php
class MemberPolicy
{
    public function update(User $user, Member $member): bool
    {
        // Use Spatie to check general permission
        if (!$user->hasPermissionTo('edit-members')) {
            return false;
        }
        
        // Then check resource-specific rules
        if ($user->hasRole('admin')) {
            return true; // Admin can edit anyone
        }
        
        if ($user->hasRole('staff')) {
            return $member->status !== MemberStatus::SUSPENDED;
        }
        
        if ($user->hasRole('member')) {
            return $user->id === $member->user_id; // Own profile only
        }
        
        return false;
    }
}
```

### **Combined Usage Flow:**

```
Request comes in
    ↓
1. Spatie Middleware - Check general permission
   → Does user have "edit-members" permission?
    ↓
2. Laravel Policy - Check resource access
   → Can user edit THIS specific member?
    ↓
Allowed or Denied
```

**Example in Controller:**
```php
// Route protected by Spatie
Route::middleware(['permission:edit-members'])->group(function () {
    Route::put('/members/{member}', [MemberController::class, 'update']);
});

// Controller method uses Policy
public function update(Request $request, Member $member)
{
    // Automatic policy check
    $this->authorize('update', $member);
    
    // If we reach here, user has both:
    // 1. edit-members permission (Spatie)
    // 2. Can edit this specific member (Policy)
    
    $member->update($request->validated());
}
```

---

## 📦 Database Seeders

### **RoleAndPermissionSeeder.php**
```php
class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        
        // Create permissions
        $permissions = [
            // Members
            'view-members',
            'create-members',
            'edit-members',
            'delete-members',
            'approve-members',
            
            // Payments
            'view-payments',
            'create-payments',
            'edit-payments',
            'delete-payments',
            'verify-payments',
            
            // Attendance
            'view-attendance',
            'mark-attendance',
            'edit-attendance',
            
            // Sports
            'manage-sports',
            'assign-coaches',
            
            // Reports
            'view-reports',
            'export-reports',
            
            // Settings
            'manage-settings',
            'manage-roles',
        ];
        
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
        
        // Create roles and assign permissions
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());
        
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view-members', 'create-members', 'edit-members', 'delete-members', 'approve-members',
            'view-payments', 'create-payments', 'verify-payments',
            'view-attendance', 'mark-attendance',
            'manage-sports', 'assign-coaches',
            'view-reports', 'export-reports',
        ]);
        
        $staff = Role::create(['name' => 'staff']);
        $staff->givePermissionTo([
            'view-members', 'create-members', 'edit-members',
            'view-payments', 'create-payments',
            'mark-attendance',
        ]);
        
        $coach = Role::create(['name' => 'coach']);
        $coach->givePermissionTo([
            'view-members',
            'view-attendance', 'mark-attendance',
        ]);
        
        $member = Role::create(['name' => 'member']);
        // Members have no admin permissions
    }
}
```

---

## 🎯 Key Takeaways

### **Clean Architecture Benefits:**

1. **Separation of Concerns**
   - Controllers handle HTTP
   - Services handle business logic
   - Repositories handle data access
   - Models represent data

2. **Reusability**
   - Actions can be used anywhere
   - Services are testable independently
   - Repositories can be swapped

3. **Maintainability**
   - Easy to find code
   - Clear responsibility
   - Simple to debug

4. **Testability**
   - Unit test services
   - Integration test controllers
   - Mock repositories

5. **Scalability**
   - Add features easily
   - Refactor safely
   - Team collaboration friendly

---

## 🚀 Getting Started

### **Installation Steps:**

```bash
# 1. Create Laravel project
composer create-project laravel/laravel nysc-sports-club

# 2. Install packages
composer require laravel/breeze --dev
composer require spatie/laravel-permission
composer require intervention/image

# 3. Install Breeze with React
php artisan breeze:install react
npm install && npm run build

# 4. Publish permission config
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# 5. Run migrations
php artisan migrate

# 6. Seed database
php artisan db:seed --class=RoleAndPermissionSeeder

# 7. Create storage link
php artisan storage:link

# 8. Start development
php artisan serve
npm run dev
```

---

**මේ structure එක follow කරලා development කරන්න පටන් ගන්නද?** 🎯