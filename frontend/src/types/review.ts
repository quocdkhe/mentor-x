export interface CreateReviewRequest {
    appointmentId: string;
    rating: number;
    comment?: string;
}
