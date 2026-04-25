using backend.Models;

namespace backend.Models.DTOs.Booking;

public class AppointmentPaymentDetailDto
{
    public Guid AppointmentId { get; set; }
    public string PaymentCode { get; set; } = null!;
    public Guid MentorId { get; set; }
    public string MentorName { get; set; } = null!;
    public string? MentorAvatar { get; set; }
    public string? MentorCompany { get; set; }
    public string? MentorPosition { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public decimal Amount { get; set; }
    public AppointmentStatusEnum Status { get; set; }
}
