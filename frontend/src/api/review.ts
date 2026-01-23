import type { CreateReviewRequest } from "@/types/review";
import type { Message } from "@/types/common";
import type { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import api from "./api";

export function useCreateReview() {
    return useMutation<Message, AxiosError<Message>, CreateReviewRequest>({
        mutationFn: async (reviewRequest: CreateReviewRequest): Promise<Message> => {
            const res = await api.post<Message>(`/reviews`, reviewRequest);
            return res.data;
        },
    });
}
