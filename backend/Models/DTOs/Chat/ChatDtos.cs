namespace backend.Models.DTOs.Chat;

public record CreateConversationRequest(Guid TargetUserId);

public record ParticipantDto(
    Guid UserId,
    string Name,
    string? Avatar
);

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    Guid SenderId,
    string SenderName,
    string? SenderAvatar,
    string Content,
    bool IsDeleted,
    DateTime CreatedAt
);

public record ConversationDto(
    Guid Id,
    ParticipantDto OtherUser,
    MessageDto? LastMessage,
    int UnreadCount,
    DateTime UpdatedAt
);

public record ConversationDetailDto(
    Guid Id,
    IEnumerable<ParticipantDto> Participants,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record PagedMessagesDto(
    IEnumerable<MessageDto> Messages,
    bool HasMore,
    Guid? NextCursor
);
