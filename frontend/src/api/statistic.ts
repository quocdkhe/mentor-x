import type { PaymentStatus } from "@/types/statistic";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./api";
import type { AxiosError } from "axios";
import type { ErrorMessage } from "@/types/common";

export const useGetListPaymentStatus = (mentorId: string) => {
  return useQuery<PaymentStatus[], AxiosError<ErrorMessage>>({
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
};

export const useMarkMentorPaid = () => {
  return useMutation<void, AxiosError<ErrorMessage>, { appointmentId: string }>(
    {
      mutationFn: async ({ appointmentId }) => {
        await api.patch(`statistics/mark-mentor-paid/${appointmentId}`);
      },
    },
  );
};

export const useMarkUserPaid = () => {
  return useMutation<
    void,
    AxiosError<ErrorMessage>,
    { appointmentId: string; paymentCode?: string }
  >({
    mutationFn: async ({ appointmentId, paymentCode }) => {
      await api.patch(`statistics/mark-user-paid/${appointmentId}`, null, {
        params: { paymentCode },
      });
    },
  });
};

