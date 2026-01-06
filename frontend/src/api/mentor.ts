import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "./api";
import type { Mentor, MentorInfo, Skill } from "@/types/mentor";
import type { Message } from "@/types/common";
interface MentorListResponse {
  mentors: MentorInfo[];
}

export function useGetSkills() {
  return useQuery<Skill[], AxiosError<Message>>({
    queryKey: ["skills"],
    queryFn: async (): Promise<Skill[]> => {
      const res = await api.get<Skill[]>("/mentors/skills");
      return res.data;
    },
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });
}

export function useGetMentorCard() {
  return useQuery<MentorInfo[], AxiosError<Message>>({
    queryKey: ["mentors"],
    queryFn: async (): Promise<MentorInfo[]> => {
      const res = await api.get<MentorListResponse>("/mentors");
      return res.data.mentors;
    },
    staleTime: 1000 * 60 * 10, // optional: cache for 10 minutes
  });
}

export function useGetMentorProfile(id: string) {
  return useQuery<Mentor, AxiosError<Message>>({
    queryKey: ["mentor", id],
    queryFn: async (): Promise<Mentor> => {
      const res = await api.get<Mentor>(`/mentors/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export interface MentorRegistrationRequest {
  biography: string;
  pricePerHour: number;
  skills: string[];
}

export function useRegisterMentor() {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<Message>, MentorRegistrationRequest>({
    mutationFn: async (data) => {
      await api.post("/mentors/register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Also maybe invalidate mentors list
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
}
