namespace backend.Models.DTOs.Booking;

public class TimeBlockDto
{
    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }
}

public class BookedSlotDto
{
    public DateTime StartAt { get; set; } // UTC 

    public DateTime EndAt { get; set; }   // UTC
}

public class MentorScheduleDto
{
    public List<TimeBlockDto> Blocks { get; set; } = new();

    public List<BookedSlotDto> BookedSlots { get; set; } = new();
}
