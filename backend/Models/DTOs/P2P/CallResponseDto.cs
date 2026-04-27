using backend.Models;

namespace backend.Models.DTOs.P2P;

public class CallResponseDto
{
    public Guid Id { get; set; }
    public Guid InitiatorId { get; set; }
    public string InitiatorName { get; set; } = null!;
    public Guid RecipientId { get; set; }
    public string RecipientName { get; set; } = null!;
    public Guid? AppointmentId { get; set; }
    public CallStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
    public CallEndReason? EndReason { get; set; }
    public string? ErrorMessage { get; set; }
}
