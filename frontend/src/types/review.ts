export interface CreateReviewRequest {
  appointmentId: string;
  rating: number;
  comment?: string;
}

export interface MentorReviewResponse {
  id: string;
  menteeName: string;
  menteeAvatar?: string | null;
  appointmentStartAt: string; // ISO-8601 UTC string
  appointmentEndAt: string;
  rating: number; // 1-5
  comment?: string | null;
  upvoteCount: number;
  createdAt: string;
  isUpvotedByCurrentUser: boolean;
}
