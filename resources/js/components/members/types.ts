export interface ScheduleDay {
    day: string;
    start_time: string;
    end_time: string;
}

export interface Program {
    id: string;
    name: string;
    admission_fee: number;
    monthly_fee: number;
    schedule_type?: string | null;
    schedule?: ScheduleDay[] | null;
    weekly_limit?: number | null;
    location?: {
        name: string;
    } | null;
    pivot: {
        status: string;
        enrolled_at: string;
        program_reference?: string;
    };
}

export interface ProgramClass {
    id: string;
    program_id: string;
    label: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    capacity: number | null;
    is_active: boolean;
    formatted_time?: string;
    program?: { id: string; name: string };
    coach?: { id: string; name: string } | null;
    assigned_count?: number;
    available_spots?: number;
    is_full?: boolean;
}

export interface MemberProgramClass {
    id: string;
    member_id: string;
    program_class_id: string;
    assigned_at: string;
    status: 'active' | 'dropped';
    notes?: string | null;
    program_class: ProgramClass;
}

export interface UpcomingClass {
    id: string;
    program_class_id: string;
    program_name: string;
    label: string;
    day_of_week: string;
    date: string;
    start_time: string;
    end_time: string;
    formatted_time: string;
    coach_name: string | null;
}

export interface ClassAbsence {
    id: string;
    member_id: string;
    program_class_id: string;
    absent_date: string;
    reason?: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'makeup_selected' | 'completed' | 'expired' | 'no_makeup';
    approved_by?: string | null;
    approved_at?: string | null;
    admin_notes?: string | null;
    makeup_class_id?: string | null;
    makeup_date?: string | null;
    makeup_deadline?: string | null;
    days_left?: number | null;
    program_class?: ProgramClass;
    makeup_class?: ProgramClass | null;
    member?: { id: string; full_name: string; member_number: string };
    approved_by_user?: { name: string } | null;
}

export interface User {
    id: string;
    name: string;
    email: string;
    temporary_password?: string;
}

export interface PaymentItem {
    id: string;
    payment_id: string;
    program_id: string | null;
    type: 'admission' | 'monthly';
    amount: number;
    month_year: string | null;
    description: string | null;
    program?: {
        name: string;
        short_code?: string;
    };
}

export interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    month_year: string | null;
    created_at: string;
    paid_date: string | null;
    due_date: string | null;
    notes: string | null;
    receipt_number?: string;
    reference_number?: string;
    payment_method?: 'cash' | 'online' | 'bank_transfer' | null;
    program?: {
        name: string;
    };
    items?: PaymentItem[];
    schedules?: PaymentSchedule[];
}

export interface PaymentSchedule {
    id: string;
    month_year: string;
    amount: number;
    status: string;
    due_date: string;
    program_id?: string;
    program?: {
        name: string;
    };
}

export interface Member {
    id: string;
    member_number: string;
    full_name: string;
    calling_name: string;
    nic_pasprogram: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    contact_number: string;
    address: string;
    email?: string;

    // Medical
    blood_group?: string;
    medical_history?: string;
    allergies?: string;

    // Emergency
    emergency_contact: string;
    emergency_number: string;

    // Background
    school_occupation?: string;
    membership_type: string;
    fitness_level: string;
    jersey_size?: string;
    preferred_training_days?: string[];

    // Status
    status: 'pending' | 'active' | 'suspended' | 'inactive';
    registration_date: string;

    // Identification
    nfc_tag_id?: string | null;
    rfid_card_id?: string | null;

    // Relations
    user?: User;
    programs: Program[];
    program_classes?: MemberProgramClass[];
    absences?: ClassAbsence[];

    // Meta
    created_at: string;
    updated_at: string;
    payments: Payment[];
    payment_schedules: PaymentSchedule[];
}

export interface MemberStatsData {
    total_paid: number;
    total_pending: number;
    has_overdue: boolean;
    monthly_attendance_count: number;
    total_attendance_count: number;
    active_programs_count: number;
    total_monthly_fee: number;
    last_payment: string | null;
    next_due_payment: string | null;
    last_attendance: string | null;
}

export interface AvailableProgram {
    id: string;
    name: string;
    monthly_fee: number;
}
