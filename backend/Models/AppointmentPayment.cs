namespace backend.Models;

/// <summary>
/// Tracks payment events for an appointment.
/// Created eagerly (all nulls) when an appointment is booked.
/// - UserPaidAt: when the mentee's payment to the platform was confirmed
/// - MentorPaidAt: when the admin paid out to the mentor
/// - PaymentCode: Sepay / bank transfer reference code
/// </summary>
public class AppointmentPayment
{
    /// <summary>
    /// Same as the related Appointment's Id (1-to-1 PK/FK).
    /// </summary>
    public Guid AppointmentId { get; set; }

    /// <summary>
    /// Timestamp (UTC) when the mentee's payment was confirmed. Null if not yet paid.
    /// </summary>
    public DateTime? UserPaidAt { get; set; }

    /// <summary>
    /// Timestamp (UTC) when the admin paid out to the mentor. Null if not yet paid.
    /// </summary>
    public DateTime? MentorPaidAt { get; set; }

    /// <summary>
    /// Sepay / bank transfer reference code recorded at booking time.
    /// </summary>
    public string? PaymentCode { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public Appointment Appointment { get; set; } = null!;
}
