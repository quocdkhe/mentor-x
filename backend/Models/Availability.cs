namespace backend.Models;

public class Availability
{
    public Guid Id { get; set; }

    public Guid MentorId { get; set; }

    /// <summary>
    /// 0 = Sunday ... 6 = Saturday
    /// </summary>
    public WeekDayEnum DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public User Mentor { get; set; }
}
