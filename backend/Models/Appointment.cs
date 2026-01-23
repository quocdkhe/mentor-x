namespace backend.Models;

public class Appointment
{
    public Guid Id { get; set; }

    public Guid MentorId { get; set; }

    public Guid MenteeId { get; set; }

    /// <summary>
    /// Stored in UTC
    /// </summary>
    public DateTime StartAt { get; set; }

    /// <summary>
    /// Stored in UTC
    /// </summary>
    public DateTime EndAt { get; set; }

    /// <summary>
    /// Pending | Confirmed | Cancelled | Completed
    /// </summary>
    public AppointmentStatusEnum Status { get; set; }

    public string? MeetingLink { get; set; }
    
    public string? GoogleCalendarLink { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public User Mentor { get; set; }
    public User Mentee { get; set; }
    public virtual ICollection<MentorReview> Reviews { get; set; } = new List<MentorReview>();
}
