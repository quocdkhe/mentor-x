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

        public async Task<ServiceResult<Message>> UpdateAvailabilities(Guid mentorId, List<AvailabilityResponseDTO> availabilities)
        {
            if (availabilities == null || !availabilities.Any())
            {
                return new ServiceResult<Message>(false, new Message("Không tìm thấy thông tin"));
            }
            if (availabilities.Any(a => a.StartTime >= a.EndTime))
            {
                return new ServiceResult<Message>(false, new Message("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"));
            }

            if (availabilities.Any(a => a.DayOfWeek < 0 || a.DayOfWeek > 6))
            {
                return new ServiceResult<Message>(false, new Message("Ngày trong tuần phải từ 0 đến 6"));
            }

            if (availabilities.Any(a => a.StartTime.Minute % 15 != 0 || a.EndTime.Minute % 15 != 0))
            {
                return new ServiceResult<Message>(false, new Message("Phút bắt đầu và kết thúc phải là bội của 15"));
            }

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
            return new ServiceResult<Message>(true, new Message("Cập nhật thông tin thành công"));
        }
    }
}