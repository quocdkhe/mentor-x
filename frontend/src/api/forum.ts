import { useQuery } from "@tanstack/react-query";
import api from "./api";
import type { AxiosError } from "axios";
import type { Message } from "@/types/common";
import type { ForumTopic } from "@/types/forum";
import type { PaginationDto } from "@/types/pagination";

export function useGetTopicPagination(page: number, pageSize: number) {
  return useQuery<PaginationDto<ForumTopic>, AxiosError<Message>>({
    queryKey: ["forum-topics", page, pageSize],
    queryFn: async (): Promise<PaginationDto<ForumTopic>> => {
      const res = await api.get<PaginationDto<ForumTopic>>(
        `/forum-topics?page=${page}&pageSize=${pageSize}`
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // optional: cache for 5 minutes
  });
}
