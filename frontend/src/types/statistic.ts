export interface PaymentStatus {
    appointmentId: string;
    mentorName: string;
    mentorEmail: string;
    mentorAvatar: string;
    menteeName: string;
    menteeEmail: string;
    menteeAvatar: string;
    pricePerHour: number;
    startAt: string;
    endAt: string;
    /** UTC timestamp when the mentee paid the platform. Null if not yet paid. */
    userPaidAt: string | null;
    /** UTC timestamp when the admin paid out to the mentor. Null if not yet paid. */
    mentorPaidAt: string | null;
    /** Sepay / bank transfer reference code. */
    paymentCode: string | null;
    bankAccountNumber: string;
    bankName: string;
}

