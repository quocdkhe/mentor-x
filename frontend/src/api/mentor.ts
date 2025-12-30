import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "./api";
import type { Mentor } from "@/types/mentor";
import type { Message } from "@/types/common";
import type { MentorCard } from "@/types/mentor";

interface MentorListResponse {
  mentors: MentorCard[];
}

export function useGetMentorCard() {
  return useQuery<MentorCard[], AxiosError<Message>>({
    queryKey: ["mentors"],
    queryFn: async (): Promise<MentorCard[]> => {
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