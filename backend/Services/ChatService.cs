using backend.Middleware.Exceptions;
using backend.Models;
using backend.Models.DTOs.Chat;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ChatService : IChatService
{
    private readonly MentorXContext _context;

    public ChatService(MentorXContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId)
    {
        var conversationIds = await _context.ConversationParticipants
            .AsNoTracking()
            .Where(cp => cp.UserId == userId)
            .Select(cp => cp.ConversationId)
            .ToListAsync();

        var result = new List<ConversationDto>();

        foreach (var conversationId in conversationIds)
        {
            result.Add(await BuildConversationDtoAsync(conversationId, userId));
        }

        return result
            .OrderByDescending(c => c.UpdatedAt)
            .ToList();
    }

    public async Task<ConversationDto> GetOrCreateConversationAsync(Guid userId, Guid targetUserId)
    {
        if (userId == targetUserId)
        {
            throw new BadRequestException("Không thể tạo cuộc trò chuyện với chính mình");
        }

        var targetUserExists = await _context.Users.AnyAsync(u => u.Id == targetUserId);
        if (!targetUserExists)
        {
            throw new NotFoundException("Không tìm thấy người dùng");
        }

        var existingConversationId = await _context.ConversationParticipants
            .AsNoTracking()
            .Where(cp => cp.UserId == userId || cp.UserId == targetUserId)
            .GroupBy(cp => cp.ConversationId)
            .Where(g => g.Count() == 2
                        && g.Any(cp => cp.UserId == userId)
                        && g.Any(cp => cp.UserId == targetUserId))
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        if (existingConversationId != Guid.Empty)
        {
            return await BuildConversationDtoAsync(existingConversationId, userId);
        }

        var hasConfirmedAppointment = await _context.Appointments.AnyAsync(a =>
            a.Status == AppointmentStatusEnum.Confirmed &&
            ((a.MentorId == userId && a.MenteeId == targetUserId) ||
             (a.MentorId == targetUserId && a.MenteeId == userId)));

        var eitherIsVerifiedMentor = await _context.MentorProfiles.AnyAsync(mp =>
            mp.IsVerified && (mp.UserId == userId || mp.UserId == targetUserId));

        if (!hasConfirmedAppointment && !eitherIsVerifiedMentor)
        {
            throw new ForbiddenException("Bạn không có quyền bắt đầu cuộc trò chuyện với người dùng này");
        }

        var now = DateTime.UtcNow;

        var conversation = new Conversation
        {
            CreatedAt = now,
            UpdatedAt = now,
            Participants =
            [
                new ConversationParticipant
                {
                    UserId = userId,
                    JoinedAt = now,
                    LastReadAt = now
                },
                new ConversationParticipant
                {
                    UserId = targetUserId,
                    JoinedAt = now,
                    LastReadAt = null
                }
            ]
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        return await BuildConversationDtoAsync(conversation.Id, userId);
    }

    public async Task<ConversationDetailDto> GetConversationAsync(Guid conversationId, Guid userId)
    {
        var conversation = await _context.Conversations
            .AsNoTracking()
            .Where(c => c.Id == conversationId)
            .Select(c => new
            {
                c.Id,
                c.CreatedAt,
                c.UpdatedAt,
                Participants = c.Participants.Select(p => new ParticipantDto(
                    p.UserId,
                    p.User.Name,
                    p.User.Avatar
                ))
            })
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
        }

        var isParticipant = conversation.Participants.Any(p => p.UserId == userId);
        if (!isParticipant)
        {
            throw new ForbiddenException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        return new ConversationDetailDto(
            conversation.Id,
            conversation.Participants,
            conversation.CreatedAt,
            conversation.UpdatedAt
        );
    }

    public async Task<PagedMessagesDto> GetMessagesAsync(Guid conversationId, Guid userId, Guid? before, int limit)
    {
        if (limit <= 0 || limit > 100)
        {
            limit = 30;
        }

        if (!await IsParticipantAsync(conversationId, userId))
        {
            throw new ForbiddenException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        var query = _context.Messages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .AsQueryable();

        if (before.HasValue)
        {
            var beforeMessage = await _context.Messages
                .AsNoTracking()
                .Where(m => m.Id == before.Value && m.ConversationId == conversationId)
                .Select(m => new { m.CreatedAt })
                .FirstOrDefaultAsync();

            if (beforeMessage == null)
            {
                throw new NotFoundException("Không tìm thấy cursor tin nhắn");
            }

            query = query.Where(m => m.CreatedAt < beforeMessage.CreatedAt);
        }

        var pageDesc = await query
            .Take(limit + 1)
            .ToListAsync();

        var hasMore = pageDesc.Count > limit;
        if (hasMore)
        {
            pageDesc = pageDesc.Take(limit).ToList();
        }

        var nextCursor = hasMore ? pageDesc.Last().Id : (Guid?)null;

        var messagesAsc = pageDesc
            .AsEnumerable()
            .Reverse()
            .Select(ToMessageDto)
            .ToList();

        return new PagedMessagesDto(messagesAsc, hasMore, nextCursor);
    }

    public async Task<MessageDto> SaveMessageAsync(Guid conversationId, Guid senderId, string content)
    {
        if (!await IsParticipantAsync(conversationId, senderId))
        {
            throw new ForbiddenException("Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này");
        }

        var trimmedContent = content.Trim();
        if (string.IsNullOrWhiteSpace(trimmedContent))
        {
            throw new BadRequestException("Nội dung tin nhắn không được để trống");
        }

        var now = DateTime.UtcNow;

        var message = new ChatMessage
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Content = trimmedContent,
            IsDeleted = false,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.Messages.Add(message);

        var conversation = await _context.Conversations.FirstOrDefaultAsync(c => c.Id == conversationId);
        if (conversation == null)
        {
            throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
        }

        conversation.UpdatedAt = now;

        await _context.SaveChangesAsync();

        var sender = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == senderId)
            .Select(u => new { u.Name, u.Avatar })
            .FirstOrDefaultAsync();

        if (sender == null)
        {
            throw new NotFoundException("Không tìm thấy người gửi");
        }

        return new MessageDto(
            message.Id,
            message.ConversationId,
            message.SenderId,
            sender.Name,
            sender.Avatar,
            message.Content,
            message.IsDeleted,
            message.CreatedAt
        );
    }

    public async Task MarkAsReadAsync(Guid conversationId, Guid userId)
    {
        var participant = await _context.ConversationParticipants
            .FirstOrDefaultAsync(cp => cp.ConversationId == conversationId && cp.UserId == userId);

        if (participant == null)
        {
            throw new ForbiddenException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        participant.LastReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public Task<bool> IsParticipantAsync(Guid conversationId, Guid userId)
    {
        return _context.ConversationParticipants
            .AsNoTracking()
            .AnyAsync(cp => cp.ConversationId == conversationId && cp.UserId == userId);
    }

    private async Task<ConversationDto> BuildConversationDtoAsync(Guid conversationId, Guid currentUserId)
    {
        var conversation = await _context.Conversations
            .AsNoTracking()
            .Where(c => c.Id == conversationId)
            .Select(c => new { c.Id, c.CreatedAt, c.UpdatedAt })
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
        }

        var participants = await _context.ConversationParticipants
            .AsNoTracking()
            .Where(cp => cp.ConversationId == conversationId)
            .Select(cp => new
            {
                cp.UserId,
                cp.LastReadAt,
                cp.User.Name,
                cp.User.Avatar
            })
            .ToListAsync();

        var currentParticipant = participants.FirstOrDefault(p => p.UserId == currentUserId);
        if (currentParticipant == null)
        {
            throw new ForbiddenException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        var otherParticipant = participants.FirstOrDefault(p => p.UserId != currentUserId);
        if (otherParticipant == null)
        {
            throw new BadRequestException("Cuộc trò chuyện chưa có đủ người tham gia");
        }

        var lastMessage = await _context.Messages
            .AsNoTracking()
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .FirstOrDefaultAsync();

        var unreadCount = await _context.Messages
            .AsNoTracking()
            .CountAsync(m =>
                m.ConversationId == conversationId
                && m.SenderId != currentUserId
                && (currentParticipant.LastReadAt == null || m.CreatedAt > currentParticipant.LastReadAt));

        return new ConversationDto(
            conversation.Id,
            new ParticipantDto(otherParticipant.UserId, otherParticipant.Name, otherParticipant.Avatar),
            lastMessage == null ? null : ToMessageDto(lastMessage),
            unreadCount,
            conversation.UpdatedAt
        );
    }

    private static MessageDto ToMessageDto(ChatMessage message)
    {
        return new MessageDto(
            message.Id,
            message.ConversationId,
            message.SenderId,
            message.Sender.Name,
            message.Sender.Avatar,
            message.IsDeleted ? "This message was deleted" : message.Content,
            message.IsDeleted,
            message.CreatedAt
        );
    }
}
