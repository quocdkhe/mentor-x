using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using backend.Models;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace backend.Hubs;

[Authorize]
public class CallSignalingHub : Hub
{
    private static readonly ConcurrentDictionary<string, string> UserConnections = new();
    private static readonly ConcurrentDictionary<string, CallState> ActiveCalls = new();
    private readonly MentorXContext _context;
    private readonly ILogger<CallSignalingHub> _logger;

    public CallSignalingHub(MentorXContext context, ILogger<CallSignalingHub> logger)
    {
        _context = context;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections[userId] = Context.ConnectionId;
            _logger.LogInformation("User {UserId} connected with connection {ConnectionId}", userId, Context.ConnectionId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections.TryRemove(userId, out _);
            _logger.LogInformation("User {UserId} disconnected", userId);
            
            // End any active calls for this user
            await HandleDisconnection(userId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    // Initiator sends call request
    public async Task InitiateCall(string recipientId, string? bookingId = null)
    {
        var initiatorId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(initiatorId) || !Guid.TryParse(initiatorId, out var initiatorGuid))
        {
            await Clients.Caller.SendAsync("CallError", null, "User not authenticated");
            return;
        }

        if (!Guid.TryParse(recipientId, out var recipientGuid))
        {
            await Clients.Caller.SendAsync("CallError", null, "Invalid recipient ID");
            return;
        }

        Guid? appointmentGuid = null;
        if (!string.IsNullOrEmpty(bookingId) && Guid.TryParse(bookingId, out var aptGuid))
        {
            appointmentGuid = aptGuid;
        }

        var callId = Guid.NewGuid().ToString();
        var call = new Call
        {
            Id = Guid.Parse(callId),
            InitiatorId = initiatorGuid,
            RecipientId = recipientGuid,
            AppointmentId = appointmentGuid,
            Status = CallStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Calls.Add(call);
        await _context.SaveChangesAsync();

        ActiveCalls[callId] = new CallState
        {
            CallId = callId,
            InitiatorId = initiatorGuid.ToString(),
            RecipientId = recipientGuid.ToString(),
            Status = CallStatus.Pending
        };

        // Get initiator name for the notification
        var initiator = await _context.Users.FindAsync(initiatorGuid);
        var initiatorName = initiator?.Name ?? "Unknown";

        // Notify recipient if online
        if (UserConnections.TryGetValue(recipientId, out var recipientConnectionId))
        {
            await Clients.Client(recipientConnectionId).SendAsync("CallIncoming", callId, initiatorGuid.ToString(), initiatorName, bookingId);
            
            call.Status = CallStatus.Ringing;
            await _context.SaveChangesAsync();
        }
        else
        {
            // Recipient not online - mark as missed
            call.Status = CallStatus.Missed;
            call.EndedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            await Clients.Caller.SendAsync("CallError", callId, "Recipient is not available");
            ActiveCalls.TryRemove(callId, out _);
        }

        await LogCallEvent(Guid.Parse(callId), initiatorGuid, "call_initiated", $"{{\"recipientId\": \"{recipientId}\", \"bookingId\": \"{bookingId}\"}}");
        
        _logger.LogInformation("Call {CallId} initiated from {InitiatorId} to {RecipientId}", callId, initiatorId, recipientId);
    }

    // Recipient accepts call
    public async Task AcceptCall(string callId)
    {
        var recipientId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(recipientId))
        {
            await Clients.Caller.SendAsync("CallError", callId, "User not authenticated");
            return;
        }

        if (!ActiveCalls.TryGetValue(callId, out var callState))
        {
            await Clients.Caller.SendAsync("CallError", callId, "Call not found or expired");
            return;
        }

        if (callState.RecipientId != recipientId)
        {
            await Clients.Caller.SendAsync("CallError", callId, "You are not the intended recipient");
            return;
        }

        var call = await _context.Calls.FindAsync(Guid.Parse(callId));
        if (call == null)
        {
            await Clients.Caller.SendAsync("CallError", callId, "Call not found in database");
            return;
        }

        call.Status = CallStatus.Connected;
        call.StartedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        callState.Status = CallStatus.Connected;

        // Notify initiator
        if (UserConnections.TryGetValue(callState.InitiatorId, out var initiatorConnectionId))
        {
            await Clients.Client(initiatorConnectionId).SendAsync("CallAccepted", callId);
        }

        await LogCallEvent(Guid.Parse(callId), Guid.Parse(recipientId), "call_accepted", null);
        _logger.LogInformation("Call {CallId} accepted by {RecipientId}", callId, recipientId);
    }

    // Recipient rejects call
    public async Task RejectCall(string callId, string? reason = null)
    {
        var recipientId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(recipientId))
        {
            await Clients.Caller.SendAsync("CallError", callId, "User not authenticated");
            return;
        }

        if (!ActiveCalls.TryGetValue(callId, out var callState))
        {
            await Clients.Caller.SendAsync("CallError", callId, "Call not found or expired");
            return;
        }

        var call = await _context.Calls.FindAsync(Guid.Parse(callId));
        if (call == null) return;

        call.Status = CallStatus.Rejected;
        call.EndedAt = DateTime.UtcNow;
        call.EndReason = CallEndReason.UserInitiated;
        await _context.SaveChangesAsync();

        // Notify initiator
        if (UserConnections.TryGetValue(callState.InitiatorId, out var initiatorConnectionId))
        {
            await Clients.Client(initiatorConnectionId).SendAsync("CallRejected", callId, reason);
        }

        ActiveCalls.TryRemove(callId, out _);

        await LogCallEvent(Guid.Parse(callId), Guid.Parse(recipientId), "call_rejected", $"{{\"reason\": \"{reason}\"}}");
        _logger.LogInformation("Call {CallId} rejected by {RecipientId}: {Reason}", callId, recipientId, reason);
    }

    // Exchange WebRTC offer
    public async Task SendOffer(string callId, string sdpOffer)
    {
        var senderId = Context.User?.Identity?.Name;
        if (string.IsNullOrEmpty(senderId)) return;

        if (!ActiveCalls.TryGetValue(callId, out var callState)) return;

        // Forward offer to the other party
        var targetId = senderId == callState.InitiatorId ? callState.RecipientId : callState.InitiatorId;
        if (UserConnections.TryGetValue(targetId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync("OfferReceived", callId, sdpOffer);
        }

        await LogCallEvent(Guid.Parse(callId), Guid.Parse(senderId), "offer_sent", null);
        _logger.LogDebug("Offer sent for call {CallId} from {SenderId}", callId, senderId);
    }

    // Exchange WebRTC answer
    public async Task SendAnswer(string callId, string sdpAnswer)
    {
        var senderId = Context.User?.Identity?.Name;
        if (string.IsNullOrEmpty(senderId)) return;

        if (!ActiveCalls.TryGetValue(callId, out var callState)) return;

        // Forward answer to the other party
        var targetId = senderId == callState.InitiatorId ? callState.RecipientId : callState.InitiatorId;
        if (UserConnections.TryGetValue(targetId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync("AnswerReceived", callId, sdpAnswer);
        }

        await LogCallEvent(Guid.Parse(callId), Guid.Parse(senderId), "answer_sent", null);
        _logger.LogDebug("Answer sent for call {CallId} from {SenderId}", callId, senderId);
    }

    // Exchange ICE candidates
    public async Task SendIceCandidate(string callId, string candidate, int sdpMLineIndex, string sdpMid)
    {
        var senderId = Context.User?.Identity?.Name;
        if (string.IsNullOrEmpty(senderId)) return;

        if (!ActiveCalls.TryGetValue(callId, out var callState)) return;

        // Forward ICE candidate to the other party
        var targetId = senderId == callState.InitiatorId ? callState.RecipientId : callState.InitiatorId;
        if (UserConnections.TryGetValue(targetId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync("IceCandidateReceived", callId, candidate, sdpMLineIndex, sdpMid);
        }
    }

    // End call
    public async Task EndCall(string callId, string? reason = null)
    {
        var senderId = Context.User?.Identity?.Name;
        if (string.IsNullOrEmpty(senderId)) return;

        if (!ActiveCalls.TryGetValue(callId, out var callState)) return;

        // Only initiator or recipient can end the call
        if (senderId != callState.InitiatorId && senderId != callState.RecipientId) return;

        await TerminateCall(callId, callState, CallEndReason.UserInitiated, reason);
    }

    // Heartbeat to keep connection alive
    public Task Ping()
    {
        return Clients.Caller.SendAsync("Pong");
    }

    private async Task HandleDisconnection(string userId)
    {
        var callsToEnd = ActiveCalls.Where(c => c.Value.InitiatorId == userId || c.Value.RecipientId == userId).ToList();
        foreach (var call in callsToEnd)
        {
            await TerminateCall(call.Key, call.Value, CallEndReason.NetworkFailure, "User disconnected");
        }
    }

    private async Task TerminateCall(string callId, CallState callState, CallEndReason reason, string? errorMessage = null)
    {
        var call = await _context.Calls.FindAsync(Guid.Parse(callId));
        if (call != null && call.Status == CallStatus.Connected)
        {
            call.Status = CallStatus.Ended;
            call.EndedAt = DateTime.UtcNow;
            call.EndReason = reason;
            call.ErrorMessage = errorMessage;
            
            if (call.StartedAt.HasValue)
            {
                call.DurationSeconds = (int)(call.EndedAt.Value - call.StartedAt.Value).TotalSeconds;
            }
            
            await _context.SaveChangesAsync();
        }

        // Notify other party
        var otherPartyId = callState.InitiatorId == Context.User?.Identity?.Name ? callState.RecipientId : callState.InitiatorId;
        if (UserConnections.TryGetValue(otherPartyId, out var otherConnectionId))
        {
            await Clients.Client(otherConnectionId).SendAsync("CallEnded", callId, reason.ToString());
        }

        ActiveCalls.TryRemove(callId, out _);

        if (call != null)
        {
            var userId = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(userId))
            {
                await LogCallEvent(Guid.Parse(callId), Guid.Parse(userId), "call_ended", $"{{\"reason\": \"{reason}\", \"message\": \"{errorMessage}\"}}");
            }
        }

        _logger.LogInformation("Call {CallId} ended. Reason: {Reason}", callId, reason);
    }

    private async Task LogCallEvent(Guid callId, Guid userId, string eventType, string? details)
    {
        var log = new CallLog
        {
            CallId = callId,
            UserId = userId,
            EventType = eventType,
            Details = details,
            Timestamp = DateTime.UtcNow
        };
        _context.CallLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    private class CallState
    {
        public string CallId { get; set; } = null!;
        public string InitiatorId { get; set; } = null!;
        public string RecipientId { get; set; } = null!;
        public CallStatus Status { get; set; }
    }
}
