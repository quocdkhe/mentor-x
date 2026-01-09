import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "./api";
import type { MentorInfo, Skill } from "@/types/mentor";
import type { Message } from "@/types/common";
import type { PaginationDto } from "@/types/pagination";

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
  return useQuery<PaginationDto<MentorInfo>, AxiosError<Message>>({
    queryKey: ["mentors"],
    queryFn: async (): Promise<PaginationDto<MentorInfo>> => {
      const res = await api.get<PaginationDto<MentorInfo>>("/mentors");
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useInfiniteGetMentorCard(
  pageSize: number = 12,
  searchTerm?: string,
  skillId?: string
) {
  return useInfiniteQuery<PaginationDto<MentorInfo>, AxiosError<Message>>({
    queryKey: ["mentors", "infinite", searchTerm, skillId],
    queryFn: async ({ pageParam = 1 }): Promise<PaginationDto<MentorInfo>> => {
      const res = await api.get<PaginationDto<MentorInfo>>("/mentors", {
        params: {
          page: pageParam,
          pageSize,
          searchTerm,
          skillId,
        },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10,
  });
}

export function useGetMentorProfile(id: string) {
  return useQuery<MentorInfo, AxiosError<Message>>({
    queryKey: ["mentor", id],
    queryFn: async (): Promise<MentorInfo> => {
      const res = await api.get<MentorInfo>(`/mentors/${id}`);
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
