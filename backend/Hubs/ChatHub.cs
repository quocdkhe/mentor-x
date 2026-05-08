using backend.Middleware.Exceptions;
using backend.Models.DTOs.Chat;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    public async Task JoinConversation(string conversationId)
    {
        var parsedConversationId = ParseConversationId(conversationId);
        var userId = GetCurrentUserId();

        await EnsureParticipant(parsedConversationId, userId);
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(parsedConversationId));
    }

    public async Task LeaveConversation(string conversationId)
    {
        var parsedConversationId = ParseConversationId(conversationId);
        var userId = GetCurrentUserId();

        await EnsureParticipant(parsedConversationId, userId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(parsedConversationId));
    }

    public async Task SendMessage(string conversationId, string content)
    {
        try
        {
            var parsedConversationId = ParseConversationId(conversationId);
            var userId = GetCurrentUserId();

            await EnsureParticipant(parsedConversationId, userId);

            var savedMessage = await _chatService.SaveMessageAsync(parsedConversationId, userId, content);
            var conversationDetail = await _chatService.GetConversationAsync(parsedConversationId, userId);

            await Clients.Group(GroupName(parsedConversationId)).SendAsync("ReceiveMessage", savedMessage);

            var senderConversation = await ResolveConversationDtoForUser(parsedConversationId, userId);
            await Clients.Caller.SendAsync("ConversationUpdated", senderConversation);

            var otherParticipantId = conversationDetail.Participants
                .Select(p => p.UserId)
                .FirstOrDefault(id => id != userId);

            if (otherParticipantId != Guid.Empty)
            {
                var otherConversation = await ResolveConversationDtoForUser(parsedConversationId, otherParticipantId);
                await Clients.OthersInGroup(GroupName(parsedConversationId)).SendAsync("ConversationUpdated", otherConversation);
            }
        }
        catch (Exception ex) when (
            ex is BadRequestException ||
            ex is ForbiddenException ||
            ex is NotFoundException ||
            ex is UnauthorizedException)
        {
            throw new HubException(ex.Message);
        }
    }

    public async Task Typing(string conversationId, bool isTyping)
    {
        try
        {
            var parsedConversationId = ParseConversationId(conversationId);
            var userId = GetCurrentUserId();

            var detail = await _chatService.GetConversationAsync(parsedConversationId, userId);
            var currentUser = detail.Participants.FirstOrDefault(p => p.UserId == userId)
                ?? throw new UnauthorizedException("Unauthorized");

            await Clients.OthersInGroup(GroupName(parsedConversationId)).SendAsync("UserTyping", new
            {
                userId,
                name = currentUser.Name,
                isTyping
            });
        }
        catch (Exception ex) when (
            ex is BadRequestException ||
            ex is ForbiddenException ||
            ex is NotFoundException ||
            ex is UnauthorizedException)
        {
            throw new HubException(ex.Message);
        }
    }

    public async Task MarkAsRead(string conversationId)
    {
        try
        {
            var parsedConversationId = ParseConversationId(conversationId);
            var userId = GetCurrentUserId();

            await _chatService.MarkAsReadAsync(parsedConversationId, userId);
            var readAt = DateTime.UtcNow;

            await Clients.OthersInGroup(GroupName(parsedConversationId)).SendAsync("MessageRead", new
            {
                conversationId = parsedConversationId,
                userId,
                readAt
            });

            var conversation = await ResolveConversationDtoForUser(parsedConversationId, userId);
            await Clients.Caller.SendAsync("ConversationUpdated", conversation);
        }
        catch (Exception ex) when (
            ex is BadRequestException ||
            ex is ForbiddenException ||
            ex is NotFoundException ||
            ex is UnauthorizedException)
        {
            throw new HubException(ex.Message);
        }
    }

    private async Task EnsureParticipant(Guid conversationId, Guid userId)
    {
        var isParticipant = await _chatService.IsParticipantAsync(conversationId, userId);
        if (!isParticipant)
        {
            throw new ForbiddenException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }
    }

    private static Guid ParseConversationId(string conversationId)
    {
        if (!Guid.TryParse(conversationId, out var parsedConversationId))
        {
            throw new BadRequestException("conversationId không hợp lệ");
        }

        return parsedConversationId;
    }

    private static string GroupName(Guid conversationId)
    {
        return $"conv-{conversationId}";
    }

    private Guid GetCurrentUserId()
    {
        return Context.User?.GetUserId() ?? throw new UnauthorizedException("Unauthorized");
    }

    private async Task<ConversationDto> ResolveConversationDtoForUser(Guid conversationId, Guid userId)
    {
        var conversations = await _chatService.GetConversationsAsync(userId);
        var conversation = conversations.FirstOrDefault(c => c.Id == conversationId);

        if (conversation == null)
        {
            throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
        }

        return conversation;
    }
}
