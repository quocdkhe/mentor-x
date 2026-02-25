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
                IsPaid = a.IsPaid,
                BankAccountNumber = a.Mentor.MentorProfile.BankAccountNumber,
                BankName = a.Mentor.MentorProfile.BankName
            }).ToListAsync();
    }

    public async Task MarkAppointmentIsPaid(Guid appointmentId)
    {
        var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == appointmentId);
        if (appointment != null)
        {
            appointment.IsPaid = true;
            await _context.SaveChangesAsync();
        }
    }
}
