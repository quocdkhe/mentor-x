using System;

namespace backend.Models.DTOs.Mentor;

public class PaymentStatusDto
{
    public Guid AppointmentId { get; set; }
    public string MentorName { get; set; } = string.Empty;
    public string MentorEmail { get; set; } = string.Empty;
    public string MentorAvatar { get; set; } = string.Empty;
    public string MenteeName { get; set; } = string.Empty;
    public string MenteeEmail { get; set; } = string.Empty;
    public string MenteeAvatar { get; set; } = string.Empty;
    public decimal PricePerHour { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    /// <summary>When the mentee paid the platform (null = not yet paid).</summary>
    public DateTime? UserPaidAt { get; set; }
    /// <summary>When the admin paid out to the mentor (null = not yet paid).</summary>
    public DateTime? MentorPaidAt { get; set; }
    /// <summary>Sepay / bank transfer reference code.</summary>
    public string? PaymentCode { get; set; }
    public string BankAccountNumber { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
}

