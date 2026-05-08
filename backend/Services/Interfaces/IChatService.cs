using backend.Models.DTOs.Chat;

namespace backend.Services.Interfaces;

public interface IChatService
{
    Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId);
    Task<ConversationDto> GetOrCreateConversationAsync(Guid userId, Guid targetUserId);
    Task<ConversationDetailDto> GetConversationAsync(Guid conversationId, Guid userId);
    Task<PagedMessagesDto> GetMessagesAsync(Guid conversationId, Guid userId, Guid? before, int limit);
    Task<MessageDto> SaveMessageAsync(Guid conversationId, Guid senderId, string content);
    Task MarkAsReadAsync(Guid conversationId, Guid userId);
    Task<bool> IsParticipantAsync(Guid conversationId, Guid userId);
}
