namespace backend.Models.DTOs.Booking;

public class BookingCreatedResponseDto
{
    public string Message { get; set; } = null!;
    public string PaymentCode { get; set; } = null!;
    public Guid AppointmentId { get; set; }
}
