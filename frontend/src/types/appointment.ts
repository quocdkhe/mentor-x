export interface BookingRequest {
  mentorId: string;
  startAt: string;
  endAt: string;
}

// ===== Booking DTOs (mentor side) =====

export type AppointmentStatusEnum =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

export interface MenteeInfoDto {
  name: string;
  email: string;
  avatar?: string | null;
}

export interface MentorAppointmentDto {
  mentorId: string; // Guid
  mentee: MenteeInfoDto;
  startAt: string; // ISO-8601 UTC string
  endAt: string; // ISO-8601 UTC string
  status: AppointmentStatusEnum;
  meetingLink?: string | null;
}

export interface MentorInfoDto {
  name: string;
  email: string;
  avatar?: string | null;
  company?: string | null;
  position?: string | null;
}

export interface MenteeAppointmentDto {
  mentorId: string; // Guid → string
  mentor: MentorInfoDto;
  startAt: string; // DateTime → ISO-8601 UTC string
  endAt: string;
  status: AppointmentStatusEnum;
  meetingLink?: string | null;
}
