export interface ParticipantDto {
  userId: string;
  name: string;
  avatar?: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  otherUser: ParticipantDto;
  lastMessage?: MessageDto;
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationDetailDto {
  id: string;
  participants: ParticipantDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedMessagesDto {
  messages: MessageDto[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface CreateConversationRequest {
  targetUserId: string;
}
