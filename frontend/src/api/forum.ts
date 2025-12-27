import { useQuery } from "@tanstack/react-query";
import api from "./api";
import type { AxiosError } from "axios";
import type { Message } from "@/types/common";
import type { ForumTopic, Post } from "@/types/forum";
import type { PaginationDto } from "@/types/pagination";

export function useGetTopicPagination(page: number, pageSize: number) {
  return useQuery<PaginationDto<ForumTopic>, AxiosError<Message>>({
    queryKey: ["forum-topics", page, pageSize],
    queryFn: async (): Promise<PaginationDto<ForumTopic>> => {
      const res = await api.get<PaginationDto<ForumTopic>>(
        `/forum/topics?page=${page}&pageSize=${pageSize}`
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetAllPostsByTopicId(
  topicId: string,
  page: number,
  pageSize: number
) {
  return useQuery<PaginationDto<Post>, AxiosError<Message>>({
    queryKey: ["forum-topic-posts", topicId, page, pageSize],
    queryFn: async (): Promise<PaginationDto<Post>> => {
      const res = await api.get<PaginationDto<Post>>(
        `/forum/topics/${topicId}/posts?page=${page}&pageSize=${pageSize}`
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetTopicById(topicId: string) {
  return useQuery<ForumTopic, AxiosError<Message>>({
    queryKey: ["forum-topic", topicId],
    queryFn: async (): Promise<ForumTopic> => {
      const res = await api.get<ForumTopic>(`/forum/topics/${topicId}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
