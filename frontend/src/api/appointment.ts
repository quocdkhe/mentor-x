import type {
  BookingRequest,
  MenteeAppointmentDto,
  MentorAppointmentDto,
  MentorScheduleDto,
} from "@/types/appointment";
import type { Message } from "@/types/common";
import type { AxiosError } from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./api";

export function useBooking() {
  return useMutation<Message, AxiosError<Message>, BookingRequest>({
    mutationFn: async (bookingRequest: BookingRequest): Promise<Message> => {
      const res = await api.post<Message>(`/appointments`, bookingRequest);
      return res.data;
    },
  });
}

export function useMentorGetAppointments(dateISOString: string) {
  return useQuery<MentorAppointmentDto[], AxiosError<Message>>({
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

export function useMenteeGetAppointments(dateISOString: string) {
  return useQuery<MenteeAppointmentDto[], AxiosError<Message>>({
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
  return useQuery<MentorScheduleDto, AxiosError<Message>>({
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
  return useMutation<Message, AxiosError<Message>, string>({
    mutationFn: async (appointmentId: string): Promise<Message> => {
      const res = await api.post<Message>(
        `/appointments/${appointmentId}/accept`,
        {},
      );
      return res.data;
    },
  });
}

export function useCancelAppointment() {
  return useMutation<Message, AxiosError<Message>, string>({
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
  return useMutation<Message, AxiosError<Message>, string>({
    mutationFn: async (appointmentId: string): Promise<Message> => {
      const res = await api.post<Message>(
        `/appointments/${appointmentId}/complete`,
        {},
      );
      return res.data;
    },
  });
}
