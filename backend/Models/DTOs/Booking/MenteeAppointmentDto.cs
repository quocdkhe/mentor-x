namespace backend.Models.DTOs.Booking;

public class MentorInfoDto
{
    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Avatar { get; set; }
    
    public string? Company { get; set; }
    
    public string? Position { get; set; }
}

public class MenteeAppointmentDto
{
    public Guid MentorId { get; set; }

    public MentorInfoDto Mentor { get; set; } = null!;

    public DateTime StartAt { get; set; }

    public DateTime EndAt { get; set; }

    public AppointmentStatusEnum Status { get; set; }

    public string? MeetingLink { get; set; }
}