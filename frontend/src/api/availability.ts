import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./api";

import type { Availability } from "@/types/availability";
import type { AxiosError } from "axios";
import type { Message } from "@/types/common";

export function useGetAvailability(mentorId: string) {
  return useQuery<Availability[], AxiosError<Message>>({
    queryKey: ["availability", mentorId],
    queryFn: async (): Promise<Availability[]> => {
      const res = await api.get<Availability[]>(
        `/mentors/${mentorId}/availabilities`
      );
      return res.data;
    },
    staleTime: 0,
  });
}

export function useUpdateAvailability() {
  return useMutation<Message, AxiosError<Message>, Availability[]>({
    mutationFn: async (availability: Availability[]): Promise<Message> => {
      const res = await api.patch<Message>(
        `/mentors/me/availabilities`,
        availability
      );
      return res.data;
    },
  });
}
