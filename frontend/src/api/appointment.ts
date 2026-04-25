import type {
  AcceptAppointmentDto,
  BookingCreatedResponse,
  BookingRequest,
  MenteeAppointmentDto,
  MentorAppointmentDto,
  MentorScheduleDto,
} from "@/types/appointment";
import type { ErrorMessage, Message } from "@/types/common";
import type { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./api";

export function useBooking() {
  return useMutation<BookingCreatedResponse, AxiosError<ErrorMessage>, BookingRequest>({
    mutationFn: async (bookingRequest: BookingRequest): Promise<BookingCreatedResponse> => {
      const res = await api.post<BookingCreatedResponse>(`/appointments`, bookingRequest);
      return res.data;
    },
  });
}

export function useVerifyAppointmentPayment() {
  return useMutation<Message, AxiosError<ErrorMessage>, string>({
    mutationFn: async (appointmentId: string): Promise<Message> => {
      const res = await api.post<Message>(`/appointments/${appointmentId}/verify-payment`, {});
      return res.data;
    },
  });
}

export function useMentorGetAppointments(dateISOString?: string) {
  return useQuery<MentorAppointmentDto[], AxiosError<ErrorMessage>>({
    queryKey: ["mentor-appointments", dateISOString],
    queryFn: async () => {
      const res = await api.get<MentorAppointmentDto[]>(
        `/mentors/me/appointments`,
        {
          params: {
            date: dateISOString,
          },
        },
      );
      return res.data;
    },
  });
}

export function useMenteeGetAppointments(dateISOString?: string) {
  return useQuery<MenteeAppointmentDto[], AxiosError<ErrorMessage>>({
    queryKey: ["mentee-appointments", dateISOString],
    queryFn: async () => {
      const res = await api.get<MenteeAppointmentDto[]>(
        `/mentees/me/appointments`,
        {
          params: {
            date: dateISOString,
          },
        },
      );
      return res.data;
    },
  });
}

export function useGetMentorSchedules(dateISOString: string, mentorId: string) {
  return useQuery<MentorScheduleDto, AxiosError<ErrorMessage>>({
    queryKey: ["mentor-schedules", dateISOString, mentorId],
    queryFn: async () => {
      const res = await api.get<MentorScheduleDto>(
        `/mentors/${mentorId}/schedules`,
        {
          params: {
            date: dateISOString,
          },
        },
      );
      return res.data;
    },
  });
}

export function useAcceptAppointments() {
  return useMutation<
    Message,
    AxiosError<ErrorMessage>,
    { appointmentId: string; acceptAppointmentDto: AcceptAppointmentDto }
  >({
    mutationFn: async ({
      appointmentId,
      acceptAppointmentDto,
    }): Promise<Message> => {
      const res = await api.post<Message>(
        `/appointments/${appointmentId}/accept`,
        acceptAppointmentDto,
      );
      return res.data;
    },
  });
}

export function useCancelAppointment() {
  return useMutation<Message, AxiosError<ErrorMessage>, string>({
    mutationFn: async (appointmentId: string): Promise<Message> => {
      const res = await api.post<Message>(
        `/appointments/${appointmentId}/cancel`,
        {},
      );
      return res.data;
    },
  });
}

export function useCompleteAppointment() {
  return useMutation<Message, AxiosError<ErrorMessage>, string>({
    mutationFn: async (appointmentId: string): Promise<Message> => {
      const res = await api.post<Message>(
        `/appointments/${appointmentId}/complete`,
        {},
      );
      return res.data;
    },
  });
}

export function useDeleteAppointment() {
  return useMutation<Message, AxiosError<ErrorMessage>, string>({
    mutationFn: async (appointmentId: string): Promise<Message> => {
      const res = await api.delete<Message>(`/appointments/${appointmentId}`);
      return res.data;
    },
  });
}
