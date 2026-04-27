using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class CallService : ICallService
{
    private readonly MentorXContext _context;
    private readonly ILogger<CallService> _logger;

    public CallService(MentorXContext context, ILogger<CallService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Call> InitiateCallAsync(Guid initiatorId, Guid recipientId, Guid? appointmentId = null)
    {
        // Auto-cleanup stale calls (older than 5 minutes in Pending/Ringing status)
        var staleThreshold = DateTime.UtcNow.AddMinutes(-5);
        var staleCalls = await _context.Calls
            .Where(c => (c.Status == CallStatus.Pending || c.Status == CallStatus.Ringing) && c.CreatedAt < staleThreshold)
            .ToListAsync();
        
        foreach (var staleCall in staleCalls)
        {
            staleCall.Status = CallStatus.Ended;
            staleCall.EndReason = CallEndReason.Timeout;
            staleCall.EndedAt = DateTime.UtcNow;
        }
        if (staleCalls.Any())
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Cleaned up {Count} stale calls", staleCalls.Count);
        }

        // Check if initiator is already in a call
        if (await IsUserInCallAsync(initiatorId))
        {
            throw new InvalidOperationException("You are already in a call");
        }

        // Check if recipient is already in a call
        if (await IsUserInCallAsync(recipientId))
        {
            throw new InvalidOperationException("Recipient is already in a call");
        }

        // If appointmentId is provided, validate it exists and belongs to these users
        if (appointmentId.HasValue)
        {
            var appointment = await _context.Appointments.FindAsync(appointmentId.Value);
            if (appointment == null)
            {
                throw new InvalidOperationException("Appointment not found");
            }
            
            if (appointment.MentorId != initiatorId && appointment.MentorId != recipientId ||
                appointment.MenteeId != initiatorId && appointment.MenteeId != recipientId)
            {
                throw new InvalidOperationException("Users are not part of this appointment");
            }
        }

        var call = new Call
        {
            Id = Guid.NewGuid(),
            InitiatorId = initiatorId,
            RecipientId = recipientId,
            AppointmentId = appointmentId,
            Status = CallStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Calls.Add(call);
        await _context.SaveChangesAsync();

        await LogCallEventAsync(call.Id, initiatorId, "call_initiated", 
            $"{{\"recipientId\": \"{recipientId}\", \"appointmentId\": \"{appointmentId}\"}}");

        _logger.LogInformation("Call {CallId} initiated from {InitiatorId} to {RecipientId}", 
            call.Id, initiatorId, recipientId);

        return call;
    }

    public async Task<Call?> GetCallAsync(Guid callId)
    {
        return await _context.Calls
            .Include(c => c.Initiator)
            .Include(c => c.Recipient)
            .Include(c => c.Appointment)
            .FirstOrDefaultAsync(c => c.Id == callId);
    }

    public async Task<Call> AcceptCallAsync(Guid callId, Guid userId)
    {
        var call = await _context.Calls.FindAsync(callId);
        if (call == null)
        {
            throw new InvalidOperationException("Call not found");
        }

        if (call.RecipientId != userId)
        {
            throw new InvalidOperationException("Only the recipient can accept this call");
        }

        if (call.Status != CallStatus.Pending && call.Status != CallStatus.Ringing)
        {
            throw new InvalidOperationException($"Cannot accept call in {call.Status} status");
        }

        call.Status = CallStatus.Connected;
        call.StartedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        await LogCallEventAsync(callId, userId, "call_accepted", null);

        _logger.LogInformation("Call {CallId} accepted by {UserId}", callId, userId);

        return call;
    }

    public async Task<Call> RejectCallAsync(Guid callId, Guid userId, string? reason = null)
    {
        var call = await _context.Calls.FindAsync(callId);
        if (call == null)
        {
            throw new InvalidOperationException("Call not found");
        }

        if (call.RecipientId != userId)
        {
            throw new InvalidOperationException("Only the recipient can reject this call");
        }

        if (call.Status != CallStatus.Pending && call.Status != CallStatus.Ringing)
        {
            throw new InvalidOperationException($"Cannot reject call in {call.Status} status");
        }

        call.Status = CallStatus.Rejected;
        call.EndedAt = DateTime.UtcNow;
        call.EndReason = CallEndReason.UserInitiated;

        await _context.SaveChangesAsync();
        await LogCallEventAsync(callId, userId, "call_rejected", $"{{\"reason\": \"{reason}\"}}");

        _logger.LogInformation("Call {CallId} rejected by {UserId}: {Reason}", callId, userId, reason);

        return call;
    }

    public async Task<Call> EndCallAsync(Guid callId, Guid userId, string? reason = null)
    {
        var call = await _context.Calls.FindAsync(callId);
        if (call == null)
        {
            throw new InvalidOperationException("Call not found");
        }

        if (call.InitiatorId != userId && call.RecipientId != userId)
        {
            throw new InvalidOperationException("You are not part of this call");
        }

        if (call.Status != CallStatus.Connected && call.Status != CallStatus.Ringing)
        {
            throw new InvalidOperationException($"Cannot end call in {call.Status} status");
        }

        call.Status = CallStatus.Ended;
        call.EndedAt = DateTime.UtcNow;
        call.EndReason = CallEndReason.UserInitiated;

        if (call.StartedAt.HasValue)
        {
            call.DurationSeconds = (int)(call.EndedAt.Value - call.StartedAt.Value).TotalSeconds;
        }

        await _context.SaveChangesAsync();
        await LogCallEventAsync(callId, userId, "call_ended", $"{{\"reason\": \"{reason}\"}}");

        _logger.LogInformation("Call {CallId} ended by {UserId}. Duration: {Duration}s", 
            callId, userId, call.DurationSeconds);

        return call;
    }

    public async Task<Call> MarkCallConnectedAsync(Guid callId)
    {
        var call = await _context.Calls.FindAsync(callId);
        if (call == null)
        {
            throw new InvalidOperationException("Call not found");
        }

        call.Status = CallStatus.Connected;
        call.StartedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Call {CallId} marked as connected", callId);

        return call;
    }

    public async Task<Call> MarkCallFailedAsync(Guid callId, string errorMessage)
    {
        var call = await _context.Calls.FindAsync(callId);
        if (call == null)
        {
            throw new InvalidOperationException("Call not found");
        }

        call.Status = CallStatus.Failed;
        call.EndedAt = DateTime.UtcNow;
        call.EndReason = CallEndReason.Error;
        call.ErrorMessage = errorMessage;

        await _context.SaveChangesAsync();
        await LogCallEventAsync(callId, call.InitiatorId, "call_failed", $"{{\"error\": \"{errorMessage}\"}}");

        _logger.LogWarning("Call {CallId} failed: {Error}", callId, errorMessage);

        return call;
    }

    public async Task<Call> MarkCallMissedAsync(Guid callId)
    {
        var call = await _context.Calls.FindAsync(callId);
        if (call == null)
        {
            throw new InvalidOperationException("Call not found");
        }

        call.Status = CallStatus.Missed;
        call.EndedAt = DateTime.UtcNow;
        call.EndReason = CallEndReason.Timeout;

        await _context.SaveChangesAsync();
        await LogCallEventAsync(callId, call.RecipientId, "call_missed", null);

        _logger.LogInformation("Call {CallId} marked as missed", callId);

        return call;
    }

    public async Task<IEnumerable<Call>> GetCallHistoryAsync(Guid userId, int limit = 50)
    {
        return await _context.Calls
            .Include(c => c.Initiator)
            .Include(c => c.Recipient)
            .Where(c => c.InitiatorId == userId || c.RecipientId == userId)
            .Where(c => c.Status == CallStatus.Ended || 
                        c.Status == CallStatus.Rejected || 
                        c.Status == CallStatus.Missed ||
                        c.Status == CallStatus.Failed)
            .OrderByDescending(c => c.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<CallStatistics> GetCallStatisticsAsync(Guid userId)
    {
        var calls = await _context.Calls
            .Where(c => c.InitiatorId == userId || c.RecipientId == userId)
            .Where(c => c.Status == CallStatus.Ended || 
                        c.Status == CallStatus.Rejected || 
                        c.Status == CallStatus.Missed ||
                        c.Status == CallStatus.Failed)
            .ToListAsync();

        var totalCalls = calls.Count;
        var completedCalls = calls.Count(c => c.Status == CallStatus.Ended);
        var missedCalls = calls.Count(c => c.Status == CallStatus.Missed);
        var rejectedCalls = calls.Count(c => c.Status == CallStatus.Rejected);
        
        var averageDuration = completedCalls > 0 
            ? calls.Where(c => c.Status == CallStatus.Ended).Average(c => c.DurationSeconds) 
            : 0;

        var successRate = totalCalls > 0 
            ? (double)completedCalls / totalCalls * 100 
            : 0;

        return new CallStatistics
        {
            TotalCalls = totalCalls,
            CompletedCalls = completedCalls,
            MissedCalls = missedCalls,
            RejectedCalls = rejectedCalls,
            AverageDurationSeconds = averageDuration,
            SuccessRate = successRate
        };
    }

    public async Task<IEnumerable<Call>> GetActiveCallsAsync(Guid userId)
    {
        return await _context.Calls
            .Include(c => c.Initiator)
            .Include(c => c.Recipient)
            .Where(c => (c.InitiatorId == userId || c.RecipientId == userId) &&
                        (c.Status == CallStatus.Pending || 
                         c.Status == CallStatus.Ringing || 
                         c.Status == CallStatus.Connected))
            .ToListAsync();
    }

    public async Task LogCallEventAsync(Guid callId, Guid userId, string eventType, string? details = null)
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

    public async Task<bool> IsUserInCallAsync(Guid userId)
    {
        return await _context.Calls.AnyAsync(c => 
            (c.InitiatorId == userId || c.RecipientId == userId) &&
            (c.Status == CallStatus.Pending || 
             c.Status == CallStatus.Ringing || 
             c.Status == CallStatus.Connected));
    }
}
