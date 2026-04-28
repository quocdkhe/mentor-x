using backend.Models.DTOs;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/call")]
public class CallController : ControllerBase
{
    private readonly ICallService _callService;
    private readonly IConfiguration _configuration;

    public CallController(ICallService callService, IConfiguration configuration)
    {
        _callService = callService;
        _configuration = configuration;
    }

    [HttpGet("{sessionId}/token")]
    [Authorize]
    public async Task<ActionResult<TurnCredentialDto>> GetToken(string sessionId)
    {
        var userId = User.GetUserId().ToString();
        await _callService.ValidateParticipant(sessionId, userId);

        var turnCredential = _callService.GenerateTurnCredential(userId);
        var turnHost = _configuration["Turn:Host"];
        var turnPort = _configuration.GetValue<int?>("Turn:Port");

        if (string.IsNullOrWhiteSpace(turnHost))
        {
            throw new InvalidOperationException("Turn host is not configured");
        }

        if (turnPort is null)
        {
            throw new InvalidOperationException("Turn port is not configured");
        }

        return Ok(new TurnCredentialDto
        {
            RoomId = sessionId,
            TurnHost = turnHost,
            TurnPort = turnPort.Value,
            TurnUsername = turnCredential.Username,
            TurnCredential = turnCredential.Credential,
            ExpiresAt = turnCredential.ExpiresAt
        });
    }
}
