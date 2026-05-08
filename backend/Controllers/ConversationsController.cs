using backend.Models.DTOs.Chat;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("/api/conversations")]
[Authorize]
public class ConversationsController : ControllerBase
{
    private readonly IChatService _chatService;

    public ConversationsController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet("")]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations()
    {
        var userId = User.GetUserId();
        var result = await _chatService.GetConversationsAsync(userId);
        return Ok(result);
    }

    [HttpPost("")]
    public async Task<ActionResult<ConversationDto>> CreateConversation([FromBody] CreateConversationRequest request)
    {
        var userId = User.GetUserId();
        var result = await _chatService.GetOrCreateConversationAsync(userId, request.TargetUserId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ConversationDetailDto>> GetConversation(Guid id)
    {
        var userId = User.GetUserId();
        var result = await _chatService.GetConversationAsync(id, userId);
        return Ok(result);
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<ActionResult<PagedMessagesDto>> GetMessages(Guid id, [FromQuery] Guid? before, [FromQuery] int limit = 30)
    {
        var userId = User.GetUserId();
        var result = await _chatService.GetMessagesAsync(id, userId, before, limit);
        return Ok(result);
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = User.GetUserId();
        await _chatService.MarkAsReadAsync(id, userId);
        return NoContent();
    }
}
