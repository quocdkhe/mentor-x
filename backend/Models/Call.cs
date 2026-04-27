namespace backend.Models;

public class Call
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InitiatorId { get; set; }
    public User Initiator { get; set; } = null!;
    
    public Guid RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
    
    public Guid? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }
    
    public CallStatus Status { get; set; } = CallStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
    
    public CallEndReason? EndReason { get; set; }
    public string? ErrorMessage { get; set; }
    
    public virtual ICollection<CallLog> CallLogs { get; set; } = new List<CallLog>();
}

public enum CallStatus
{
    Pending,      // Waiting for recipient to accept
    Ringing,      // Recipient notified, awaiting response
    Connected,    // Both parties connected
    Ended,        // Call completed normally
    Failed,       // Call failed to establish
    Rejected,     // Recipient rejected
    Missed        // Recipient didn't respond
}

public enum CallEndReason
{
    UserInitiated,
    NetworkFailure,
    Timeout,
    Error
}

public class CallLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CallId { get; set; }
    public Call Call { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string EventType { get; set; } = null!; // "offer_sent", "answer_received", "ice_candidate", "connection_established", etc.
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? Details { get; set; } // JSON for additional data
}
