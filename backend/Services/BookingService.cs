using backend.Models;
using backend.Models.DTOs;
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

        public async Task<ServiceResult<Message>> UpdateAvailabilities(
            Guid mentorId,
            List<AvailabilityResponseDTO> availabilities)
        {
            // ===== check overlap giữa các DTO =====
            var groupedByDay = availabilities.GroupBy(a => a.DayOfWeek);

            foreach (var group in groupedByDay)
            {
                var sorted = group
                    .OrderBy(a => a.StartTime)
                    .ToList();

                for (int i = 0; i < sorted.Count - 1; i++)
                {
                    if (sorted[i].EndTime > sorted[i + 1].StartTime)
                    {
                        return ServiceResult<Message>.Fail(
                            $"Giờ bị gối nhau trong cùng {group.Key}"
                        );
                    }
                }
            }

            // ===== validate + check DB =====
            foreach (var dto in availabilities)
            {
                // 1 Start < End
                if (dto.StartTime >= dto.EndTime)
                {
                    return ServiceResult<Message>.Fail(
                        "StartTime phải nhỏ hơn EndTime"
                    );
                }

                // 2️ Bội số 15 phút
                if (dto.StartTime.Minutes % 15 != 0 || dto.EndTime.Minutes % 15 != 0)
                {
                    return ServiceResult<Message>.Fail(
                        "Giờ phải là bội số của 15 phút (vd: 09:15, 09:30)"
                    );
                }
            }

            // ===== XÓA CŨ =====
            var existing = await _context.Availabilities
                .Where(a => a.MentorId == mentorId)
                .ToListAsync();

            if (existing.Any())
            {
                _context.Availabilities.RemoveRange(existing);
            }

            // ===== INSERT MỚI =====
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

            return ServiceResult<Message>.Ok( new Message(
                "Cập nhật availability thành công")
            );
        }

    }
}