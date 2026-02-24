import type { PaymentStatus } from "@/types/statistic";
import { useQuery } from "@tanstack/react-query";
import api from "./api";
import type { AxiosError } from "axios";
import type { Message } from "@/types/common";

export const useGetListPaymentStatus = (mentorId: string) => {
	return useQuery<PaymentStatus[], AxiosError<Message>>({
		queryKey: ["payment-status", mentorId],
		queryFn: async () => {
			const res = await api.get<PaymentStatus[]>("statistics/payment-status", {
				params: {
					mentorId,
				},
			});
			return res.data;
		},
	});
}