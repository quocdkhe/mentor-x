import type { ErrorMessage } from "@/types/common";
import api from "./api";
import type {
  ConversationDetailDto,
  ConversationDto,
  PagedMessagesDto,
} from "@/types/chat";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const STALE_TIMES = {
  conversations: 1000 * 30,
  conversationDetail: 1000 * 60 * 5,
  messages: 1000 * 10,
} as const;

export const chatQueryKeys = {
  all: ["chat"] as const,
  conversations: ["chat", "conversations"] as const,
  conversation: (conversationId: string) =>
    ["chat", "conversations", conversationId] as const,
  messages: (conversationId: string, before?: string, limit = 30) =>
    ["chat", "messages", conversationId, before ?? null, limit] as const,
};

export async function getConversations(): Promise<ConversationDto[]> {
  const res = await api.get<ConversationDto[]>("/api/conversations");
  return res.data;
}

export async function createConversation(
  targetUserId: string,
): Promise<ConversationDto> {
  const res = await api.post<ConversationDto>("/api/conversations", {
    targetUserId,
  });
  return res.data;
}

export async function getConversation(
  conversationId: string,
): Promise<ConversationDetailDto> {
  const res = await api.get<ConversationDetailDto>(
    `/api/conversations/${conversationId}`,
  );
  return res.data;
}

export async function getMessages(
  conversationId: string,
  before?: string,
  limit = 30,
): Promise<PagedMessagesDto> {
  const res = await api.get<PagedMessagesDto>(
    `/api/conversations/${conversationId}/messages`,
    {
      params: {
        before,
        limit,
      },
    },
  );

  return res.data;
}

export async function markAsRead(conversationId: string): Promise<void> {
  await api.put(`/api/conversations/${conversationId}/read`);
}

export function useGetConversations() {
  return useQuery<ConversationDto[], AxiosError<ErrorMessage>>({
    queryKey: chatQueryKeys.conversations,
    queryFn: getConversations,
    staleTime: STALE_TIMES.conversations,
  });
}

export function useGetConversation(conversationId: string) {
  return useQuery<ConversationDetailDto, AxiosError<ErrorMessage>>({
    queryKey: chatQueryKeys.conversation(conversationId),
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: STALE_TIMES.conversationDetail,
  });
}

export function useGetMessages(
  conversationId: string,
  before?: string,
  limit = 30,
) {
  return useQuery<PagedMessagesDto, AxiosError<ErrorMessage>>({
    queryKey: chatQueryKeys.messages(conversationId, before, limit),
    queryFn: () => getMessages(conversationId, before, limit),
    enabled: !!conversationId,
    staleTime: STALE_TIMES.messages,
  });
}

export function useCreateConversation() {
  return useMutation<ConversationDto, AxiosError<ErrorMessage>, string>({
    mutationFn: createConversation,
  });
}

export function useMarkAsRead() {
  return useMutation<void, AxiosError<ErrorMessage>, string>({
    mutationFn: markAsRead,
  });
}
