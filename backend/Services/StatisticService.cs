using backend.Models;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class StatisticService : IStatisticService
{
    private readonly MentorXContext _context;
    public StatisticService(MentorXContext context)
    {
        _context = context;
    }

    public async Task<List<PaymentStatusDto>> GetAllPaymentStatus(Guid? mentorId)
    {
        var query = _context.Appointments
            .Include(a => a.Mentor)
                .ThenInclude(m => m.MentorProfile)
            .Include(a => a.Mentee)
            .Include(a => a.Payment)
            .AsQueryable();

        if (mentorId != null)
        {
            query = query.Where(a => a.MentorId == mentorId);
        }

        return await query
            .Where(a => a.Status == AppointmentStatusEnum.Completed)
            .Select(a => new PaymentStatusDto
            {
                AppointmentId = a.Id,
                MentorName = a.Mentor.Name,
                MentorEmail = a.Mentor.Email,
                MentorAvatar = a.Mentor.Avatar,
                MenteeName = a.Mentee.Name,
                MenteeEmail = a.Mentee.Email,
                MenteeAvatar = a.Mentee.Avatar,
                PricePerHour = a.Mentor.MentorProfile.PricePerHour,
                StartAt = a.StartAt,
                EndAt = a.EndAt,
                UserPaidAt = a.Payment != null ? a.Payment.UserPaidAt : null,
                MentorPaidAt = a.Payment != null ? a.Payment.MentorPaidAt : null,
                PaymentCode = a.Payment != null ? a.Payment.PaymentCode : null,
                BankAccountNumber = a.Mentor.MentorProfile.BankAccountNumber,
                BankName = a.Mentor.MentorProfile.BankName
            }).ToListAsync();
    }

    /// <summary>Admin marks that the platform has paid out to the mentor.</summary>
    public async Task MarkMentorPaid(Guid appointmentId)
    {
        var payment = await _context.AppointmentPayments
            .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
        if (payment != null)
        {
            payment.MentorPaidAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>Records that the user (mentee) has paid. Called after Sepay verification.</summary>
    public async Task MarkUserPaid(Guid appointmentId, string? paymentCode)
    {
        var payment = await _context.AppointmentPayments
            .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
        if (payment != null)
        {
            payment.UserPaidAt = DateTime.UtcNow;
            payment.PaymentCode = paymentCode;
            payment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}

