using System;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces;

public interface IStatisticService
{
    Task<List<PaymentStatusDto>> GetAllPaymentStatus(Guid? mentorId);
    Task MarkAppointmentIsPaid(Guid appointmentId);
}
