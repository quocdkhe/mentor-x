import type { CreateReviewRequest, MentorReviewResponse } from "@/types/review";
import type { Message } from "@/types/common";
import type { PaginationDto } from "@/types/pagination";
import type { AxiosError } from "axios";
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
} from "@tanstack/react-query";
import api from "./api";

export function useCreateReview() {
  return useMutation<Message, AxiosError<Message>, CreateReviewRequest>({
    mutationFn: async (
      reviewRequest: CreateReviewRequest,
    ): Promise<Message> => {
      const res = await api.post<Message>(`/reviews`, reviewRequest);
      return res.data;
    },
  });
}

export function useGetMentorReviews(
  mentorId: string,
  page: number = 1,
  pageSize: number = 5,
) {
  return useQuery<PaginationDto<MentorReviewResponse>, AxiosError<Message>>({
    queryKey: ["mentor-reviews", mentorId, page, pageSize],
    queryFn: async () => {
      const res = await api.get<PaginationDto<MentorReviewResponse>>(
        `/mentors/${mentorId}/reviews`,
        {
          params: { page, pageSize },
        },
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useToggleUpvote<TContext = unknown>(
  options?: UseMutationOptions<Message, AxiosError<Message>, string, TContext>,
) {
  return useMutation<Message, AxiosError<Message>, string, TContext>({
    mutationFn: async (reviewId: string): Promise<Message> => {
      const res = await api.post<Message>(`/reviews/${reviewId}/upvote`);
      return res.data;
    },
    ...options,
  });
}
