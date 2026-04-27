using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.P2P;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/calls")]
[Authorize]
public class CallController : ControllerBase
{
    private readonly ICallService _callService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CallController> _logger;

    public CallController(ICallService callService, IConfiguration configuration, ILogger<CallController> logger)
    {
        _callService = callService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("initiate")]
    [Authorize(Roles = Roles.User + "," + Roles.Mentor)]
    public async Task<ActionResult<CallResponseDto>> InitiateCall([FromBody] InitiateCallRequest request)
    {
        try
        {
            var initiatorId = User.GetUserId();
            var call = await _callService.InitiateCallAsync(initiatorId, request.RecipientId, request.AppointmentId);
            return Ok(MapToDto(call));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new Message(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating call");
            return StatusCode(500, new Message("Internal server error"));
        }
    }

    [HttpGet("{callId}")]
    public async Task<ActionResult<CallResponseDto>> GetCall(Guid callId)
    {
        var userId = User.GetUserId();
        var call = await _callService.GetCallAsync(callId);
        
        if (call == null)
        {
            return NotFound(new Message("Call not found"));
        }

        // Only participants can view call details
        if (call.InitiatorId != userId && call.RecipientId != userId)
        {
            return Forbid();
        }

        return Ok(MapToDto(call));
    }

    [HttpPost("{callId}/accept")]
    public async Task<ActionResult<CallResponseDto>> AcceptCall(Guid callId)
    {
        try
        {
            var userId = User.GetUserId();
            var call = await _callService.AcceptCallAsync(callId, userId);
            return Ok(MapToDto(call));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new Message(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accepting call {CallId}", callId);
            return StatusCode(500, new Message("Internal server error"));
        }
    }

    [HttpPost("{callId}/reject")]
    public async Task<ActionResult<CallResponseDto>> RejectCall(Guid callId, [FromBody] RejectCallRequest? request)
    {
        try
        {
            var userId = User.GetUserId();
            var call = await _callService.RejectCallAsync(callId, userId, request?.Reason);
            return Ok(MapToDto(call));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new Message(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting call {CallId}", callId);
            return StatusCode(500, new Message("Internal server error"));
        }
    }

    [HttpPost("{callId}/end")]
    public async Task<ActionResult<CallResponseDto>> EndCall(Guid callId, [FromBody] EndCallRequest? request)
    {
        try
        {
            var userId = User.GetUserId();
            var call = await _callService.EndCallAsync(callId, userId, request?.Reason);
            return Ok(MapToDto(call));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new Message(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ending call {CallId}", callId);
            return StatusCode(500, new Message("Internal server error"));
        }
    }

    [HttpGet("history")]
    public async Task<ActionResult<IEnumerable<CallResponseDto>>> GetCallHistory([FromQuery] int limit = 50)
    {
        var userId = User.GetUserId();
        var calls = await _callService.GetCallHistoryAsync(userId, limit);
        return Ok(calls.Select(MapToDto));
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<CallStatisticsResponseDto>> GetCallStatistics()
    {
        var userId = User.GetUserId();
        var stats = await _callService.GetCallStatisticsAsync(userId);
        return Ok(new CallStatisticsResponseDto
        {
            TotalCalls = stats.TotalCalls,
            CompletedCalls = stats.CompletedCalls,
            MissedCalls = stats.MissedCalls,
            RejectedCalls = stats.RejectedCalls,
            AverageDurationSeconds = stats.AverageDurationSeconds,
            SuccessRate = stats.SuccessRate
        });
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<CallResponseDto>>> GetActiveCalls()
    {
        var userId = User.GetUserId();
        var calls = await _callService.GetActiveCallsAsync(userId);
        return Ok(calls.Select(MapToDto));
    }

    private static CallResponseDto MapToDto(Call call)
    {
        return new CallResponseDto
        {
            Id = call.Id,
            InitiatorId = call.InitiatorId,
            InitiatorName = call.Initiator?.Name ?? "Unknown",
            RecipientId = call.RecipientId,
            RecipientName = call.Recipient?.Name ?? "Unknown",
            AppointmentId = call.AppointmentId,
            Status = call.Status,
            CreatedAt = call.CreatedAt,
            StartedAt = call.StartedAt,
            EndedAt = call.EndedAt,
            DurationSeconds = call.DurationSeconds,
            EndReason = call.EndReason,
            ErrorMessage = call.ErrorMessage
        };
    }

    [HttpGet("ice-configuration")]
    [AllowAnonymous]
    public ActionResult<IceConfigurationResponse> GetIceConfiguration()
    {
        var turnUrl = _configuration["WebRTC:TurnServer:Url"] ?? "turn:quocdk.id.vn:3478";
        var turnUsername = _configuration["WebRTC:TurnServer:Username"] ?? "testuser";
        var turnCredential = _configuration["WebRTC:TurnServer:Credential"] ?? "testpass";
        var stunServers = _configuration.GetSection("WebRTC:StunServers").Get<string[]>() 
            ?? new[] { "stun:stun.l.google.com:19302" };
        var callTimeout = _configuration.GetValue<int>("WebRTC:CallTimeoutSeconds", 60);
        var maxDuration = _configuration.GetValue<int>("WebRTC:MaxCallDurationSeconds", 3600);

        var response = new IceConfigurationResponse
        {
            IceServers = new List<IceServerDto>
            {
                new() { Urls = stunServers },
                new() 
                { 
                    Urls = new[] { turnUrl }, 
                    Username = turnUsername, 
                    Credential = turnCredential 
                }
            },
            CallTimeoutSeconds = callTimeout,
            MaxCallDurationSeconds = maxDuration
        };

        return Ok(response);
    }
}
