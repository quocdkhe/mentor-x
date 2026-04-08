import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "./api";
import type { MentorInfo, MentorProfile, Skill } from "@/types/mentor";
import type { ErrorMessage, Message } from "@/types/common";
import type { PaginationDto } from "@/types/pagination";

export function useGetSkills() {
  return useQuery<Skill[], AxiosError<ErrorMessage>>({
    queryKey: ["skills"],
    queryFn: async (): Promise<Skill[]> => {
      const res = await api.get<Skill[]>("/mentors/skills");
      return res.data;
    },
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });
}

export function useGetAllMentors() {
  return useQuery<PaginationDto<MentorInfo>, AxiosError<ErrorMessage>>({
    queryKey: ["mentors"],
    queryFn: async (): Promise<PaginationDto<MentorInfo>> => {
      const res = await api.get<PaginationDto<MentorInfo>>(
        "/mentors?page=1&pageSize=1000",
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useInfiniteGetMentorCard(
  pageSize: number = 12,
  searchTerm?: string,
  skillId?: string,
) {
  return useInfiniteQuery<PaginationDto<MentorInfo>, AxiosError<ErrorMessage>>({
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
  return useQuery<MentorInfo, AxiosError<ErrorMessage>>({
    queryKey: ["mentor", id],
    queryFn: async (): Promise<MentorInfo> => {
      const res = await api.get<MentorInfo>(`/mentors/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useGetCurrentMentorProfile() {
  return useQuery<MentorProfile, AxiosError<ErrorMessage>>({
    queryKey: ["current-mentor-profile"],
    queryFn: async (): Promise<MentorProfile> => {
      const res = await api.get<MentorProfile>("/mentors/profile");
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export interface MentorRegistrationRequest {
  biography: string;
  pricePerHour: number;
  skills: string[];
  company: string;
  position: string;
  yearsOfExperience: number;
  user: {
    name: string;
    phone: string;
    email: string;
    password: string;
    avatar: string;
  };
}

export function useRegisterMentor() {
  return useMutation<
    Message,
    AxiosError<ErrorMessage>,
    MentorRegistrationRequest
  >({
    mutationFn: async (data): Promise<Message> => {
      const res = await api.post<Message>("/mentors/register", data);
      return res.data;
    },
  });
}

export function usePatchUpdateMentorProfile() {
  return useMutation<Message, AxiosError<ErrorMessage>, MentorProfile>({
    mutationFn: async (data): Promise<Message> => {
      const res = await api.patch<Message>(`/mentors/profile`, data);
      return res.data;
    },
  });
}

export function useGetPendingMentors() {
  return useQuery<
    PaginationDto<MentorInfo> | MentorInfo[],
    AxiosError<ErrorMessage>
  >({
    queryKey: ["pending-mentors"],
    queryFn: async () => {
      const res = await api.get<MentorInfo[]>("/mentors/pending");
      return res.data;
    },
  });
}

export function useApproveMentor() {
  return useMutation<Message, AxiosError<ErrorMessage>, string>({
    mutationFn: async (id): Promise<Message> => {
      const res = await api.post<Message>(`/mentors/${id}/approve`);
      return res.data;
    },
  });
}

export function useToggleVerifyMentor() {
  return useMutation<
    Message,
    AxiosError<ErrorMessage>,
    { isVerified: boolean; mentorId: string }
  >({
    mutationFn: async ({ isVerified, mentorId }): Promise<Message> => {
      const res = await api.patch<Message>(`/mentors/${mentorId}/verify`, {
        isVerified,
      });
      return res.data;
    },
  });
}
