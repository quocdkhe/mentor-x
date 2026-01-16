namespace backend.Models.DTOs.Booking;

public class MenteeInfoDto
{
    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Avatar { get; set; }
}


public class MentorAppointmentDto
{
    public Guid MentorId { get; set; }

    public MenteeInfoDto Mentee { get; set; } = null!;

    public DateTime StartAt { get; set; }

    public DateTime EndAt { get; set; }

    public AppointmentStatusEnum Status { get; set; }

    public string? MeetingLink { get; set; }
}
