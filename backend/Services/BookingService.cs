using backend.Models;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BookingService : IBookingService
    {
        private readonly MentorXContext _context;


        public BookingService(MentorXContext context)
        {
            _context = context;
        }

        public async Task<List<AvailabilityResponseDTO>> GetAvailabilities(Guid mentorId)
        {
            var availabilities = await _context.Availabilities
                .Where(a => a.MentorId == mentorId)
                .Select(a => new AvailabilityResponseDTO
                {
                    DayOfWeek = a.DayOfWeek,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    IsActive = a.IsActive
                })
                .ToListAsync();
            return availabilities;
        }

        public async Task<bool> UpdateAvailabilities(Guid mentorId, List<AvailabilityResponseDTO> availabilities)
        {
            var existing = await _context.Availabilities.Where(a => a.MentorId == mentorId).ToListAsync();
            if (existing != null)
            {
                _context.Availabilities.RemoveRange(existing);
            }

            var newAvailabilities = availabilities.Select(a => new Availability
            {
                MentorId = mentorId,
                DayOfWeek = a.DayOfWeek,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                IsActive = a.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }).ToList();

            await _context.Availabilities.AddRangeAsync(newAvailabilities);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}