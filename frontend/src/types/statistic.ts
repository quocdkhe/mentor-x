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
    isPaid: boolean;
    bankAccountNumber: string;
    bankName: string;
}
