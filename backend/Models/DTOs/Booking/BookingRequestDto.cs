namespace backend.Models.DTOs.Booking;

public class BookingRequestDto
{
    public Guid MentorId { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
}