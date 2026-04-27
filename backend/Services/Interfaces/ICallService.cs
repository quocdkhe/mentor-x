using backend.Models;

namespace backend.Services.Interfaces;

public interface ICallService
{
    Task<Call> InitiateCallAsync(Guid initiatorId, Guid recipientId, Guid? appointmentId = null);
    Task<Call?> GetCallAsync(Guid callId);
    Task<Call> AcceptCallAsync(Guid callId, Guid userId);
    Task<Call> RejectCallAsync(Guid callId, Guid userId, string? reason = null);
    Task<Call> EndCallAsync(Guid callId, Guid userId, string? reason = null);
    Task<Call> MarkCallConnectedAsync(Guid callId);
    Task<Call> MarkCallFailedAsync(Guid callId, string errorMessage);
    Task<Call> MarkCallMissedAsync(Guid callId);
    
    Task<IEnumerable<Call>> GetCallHistoryAsync(Guid userId, int limit = 50);
    Task<CallStatistics> GetCallStatisticsAsync(Guid userId);
    Task<IEnumerable<Call>> GetActiveCallsAsync(Guid userId);
    
    Task LogCallEventAsync(Guid callId, Guid userId, string eventType, string? details = null);
    Task<bool> IsUserInCallAsync(Guid userId);
}

public class CallStatistics
{
    public int TotalCalls { get; set; }
    public int CompletedCalls { get; set; }
    public int MissedCalls { get; set; }
    public int RejectedCalls { get; set; }
    public double AverageDurationSeconds { get; set; }
    public double SuccessRate { get; set; }
}
