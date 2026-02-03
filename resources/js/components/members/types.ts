export interface Sport {
    id: string;
    name: string;
    admission_fee: number;
    monthly_fee: number;
    pivot: {
        status: string;
        enrolled_at: string;
        sport_reference?: string;
    };
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
    sport_id: string | null;
    type: 'admission' | 'monthly';
    amount: number;
    month_year: string | null;
    description: string | null;
    sport?: {
        name: string;
        short_code?: string;
    };
}

export interface Payment {
    due_date: string | number | Date;
    notes: string;
    id: string;
    amount: number;
    type: string;
    status: string;
    month_year: string | null;
    created_at: string;
    paid_date: string;
    receipt_number?: string;
    reference_number?: string;
    sport?: {
        name: string;
    };
    items?: PaymentItem[];
}

export interface PaymentSchedule {
    id: string;
    month_year: string;
    amount: number;
    status: string;
    due_date: string;
    sport_id?: string;
    sport?: {
        name: string;
    };
}

export interface Member {
    id: string;
    member_number: string;
    full_name: string;
    calling_name: string;
    nic_passport: string;
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
    sports: Sport[];

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
    active_sports_count: number;
    total_monthly_fee: number;
    last_payment: string | null;
    next_due_payment: string | null;
    last_attendance: string | null;
}

export interface AvailableSport {
    id: string;
    name: string;
    monthly_fee: number;
}
