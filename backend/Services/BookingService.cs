using backend.Middleware.Exceptions;
using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Booking;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BookingService : IBookingService
    {
        private readonly MentorXContext _context;
        private readonly IGoogleCalendarService _googleCalendarService;
        private readonly IGoogleOAuthService _googleOAuthService;

        public BookingService(MentorXContext context, IGoogleCalendarService googleCalendarService
            , IGoogleOAuthService googleOAuthService)
        {
            _context = context;
            _googleCalendarService = googleCalendarService;
            _googleOAuthService = googleOAuthService;
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

        public async Task<Message> UpdateAvailabilities(
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
                        throw new BadRequestException(
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
                    throw new BadRequestException(
                        "StartTime phải nhỏ hơn EndTime"
                    );
                }

                // 2️ Bội số 15 phút
                if (dto.StartTime.Minutes % 15 != 0 || dto.EndTime.Minutes % 15 != 0)
                {
                    throw new BadRequestException(
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

            return new Message("Cập nhật availability thành công");
        }

        public async Task<BookingCreatedResponseDto> BookAnAppointment(Guid menteeId, BookingRequestDto dto)
        {
            var isDuplicate = await _context.Appointments.AnyAsync(a =>
                a.MentorId == dto.MentorId &&
                a.StartAt < dto.EndAt &&
                a.EndAt > dto.StartAt
            );

            if (isDuplicate)
            {
                throw new ConflictException("Lịch đặt bị trùng với lịch khác, vui lòng thử lại");
            }

            var appointment = new Appointment
            {
                Status = AppointmentStatusEnum.AwaitingPayment,
                MenteeId = menteeId,
                MentorId = dto.MentorId,
                StartAt = dto.StartAt,
                EndAt = dto.EndAt,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();

            var paymentCode = GeneratePaymentCode.Generate();

            await _context.AppointmentPayments.AddAsync(new AppointmentPayment
            {
                AppointmentId = appointment.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PaymentCode = paymentCode,
            });
            await _context.SaveChangesAsync();

            return new BookingCreatedResponseDto
            {
                Message = "Đặt lịch thành công, vui lòng tiếp tục thanh toán",
                PaymentCode = paymentCode,
                AppointmentId = appointment.Id,
            };
        }

        public async Task<List<MentorAppointmentDto>> GetMentorAppointments(Guid mentorId, DateTime? date)
        {
            var query = _context.Appointments
                .Include(a => a.Mentee)
                .Where(a => a.MentorId == mentorId);

            if (date.HasValue)
            {
                var startOfDay = date.Value.Date;
                var endOfDay = startOfDay.AddDays(1);
                query = query.Where(a => a.StartAt >= startOfDay && a.StartAt < endOfDay);
            }

            var appointments = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new MentorAppointmentDto
                {
                    AppointmentId = a.Id,
                    MentorId = a.MentorId,
                    Mentee = new MenteeInfoDto
                    {
                        Name = a.Mentee.Name,
                        Email = a.Mentee.Email,
                        Avatar = a.Mentee.Avatar
                    },
                    StartAt = a.StartAt,
                    EndAt = a.EndAt,
                    Status = a.Status,
                    MeetingLink = a.MeetingLink,
                    GoogleCalendarLink = a.GoogleCalendarLink
                })
                .ToListAsync();

            return appointments;
        }

        public async Task<List<MenteeAppointmentDto>> GetMenteeAppointments(Guid menteeId, DateTime? date)
        {
            var query = _context.Appointments
                .Include(a => a.Mentor)
                .ThenInclude(m => m.MentorProfile)
                .Where(a => a.MenteeId == menteeId);

            if (date.HasValue)
            {
                var startOfDay = date.Value.Date;
                var endOfDay = startOfDay.AddDays(1);
                query = query.Where(a => a.StartAt >= startOfDay && a.StartAt < endOfDay);
            }

            var appointments = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new MenteeAppointmentDto
                {
                    AppointmentId = a.Id,
                    MentorId = a.MentorId,
                    Mentor = new MentorInfoDto
                    {
                        Name = a.Mentor.Name,
                        Email = a.Mentor.Email,
                        Avatar = a.Mentor.Avatar,
                        Company = a.Mentor.MentorProfile != null ? a.Mentor.MentorProfile.Company : null,
                        Position = a.Mentor.MentorProfile != null ? a.Mentor.MentorProfile.Position : null
                    },
                    StartAt = a.StartAt,
                    EndAt = a.EndAt,
                    Status = a.Status,
                    MeetingLink = a.MeetingLink,
                    GoogleCalendarLink = a.GoogleCalendarLink,
                    IsReviewed = _context.MentorReviews.Any(r => r.AppointmentId == a.Id)
                })
                .ToListAsync();

            return appointments;
        }

        public async Task<MentorScheduleDto> GetMentorSchedule(Guid mentorId, DateTime? date)
        {
            if (date == null)
            {
                throw new BadRequestException("DateTime là bắt buộc");
            }

            WeekDayEnum day = (WeekDayEnum)date?.DayOfWeek;
            List<TimeBlockDto> blocks = await _context.Availabilities
                .Where(a => a.MentorId == mentorId && a.DayOfWeek == day && a.IsActive)
                .Select(a => new TimeBlockDto
                {
                    StartTime = a.StartTime,
                    EndTime = a.EndTime
                })
                .ToListAsync();

            var startOfDay = date?.Date;
            var endOfDay = startOfDay?.AddDays(1);

            List<BookedSlotDto> bookedSlots = await _context.Appointments
                .Where(a => a.MentorId == mentorId && a.StartAt >= startOfDay && a.StartAt < endOfDay)
                .Select(a => new BookedSlotDto
                {
                    StartAt = a.StartAt,
                    EndAt = a.EndAt
                }).ToListAsync();

            return new MentorScheduleDto
            {
                Blocks = blocks,
                BookedSlots = bookedSlots
            };
        }

        public async Task<Message> AcceptAppointment(Guid mentorId, Guid appointmentId, AcceptAppointmentDto dto)
        {
            var appointment = _context.Appointments
                .Include(a => a.Mentor)
                .Include(a => a.Mentee)
                .FirstOrDefault(a =>
                    a.Id == appointmentId && a.MentorId == mentorId);
            if (appointment == null)
            {
                throw new NotFoundException("Không tìm thấy cuộc hẹn");
            }

            if (dto.GoogleCalendarLink != null && dto.GoogleMeetLink != null)
            {
                appointment.MeetingLink = dto.GoogleCalendarLink;
                appointment.GoogleCalendarLink = dto.GoogleCalendarLink;
            }
            else
            {
                try
                {
                    // Create meeting link and google calendar event
                    string accessToken = await _googleOAuthService.GetGoogleAccessToken(mentorId);
                    GoogleMeetingResult googleMeetingResult = await
                        _googleCalendarService.CreateMeetingAsync(accessToken, appointment.StartAt,
                            appointment.EndAt, appointment.Mentor.Email, appointment.Mentee.Email);
                    appointment.MeetingLink = googleMeetingResult.MeetLink;
                    appointment.GoogleCalendarLink = googleMeetingResult.CalendarLink;
                }
                catch (Exception ex)
                {
                    throw new BadRequestException($"Không thể tạo cuộc họp: {ex.Message}");
                }
            }

            appointment.Status = AppointmentStatusEnum.Confirmed;
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return new Message("Cuộc hẹn đã được chấp nhận");
        }

        public Task<Message> CompleteAppointment(Guid mentorId, Guid appointmentId)
        {
            var appointment = _context.Appointments.FirstOrDefault(a =>
                a.Id == appointmentId && a.MentorId == mentorId);
            if (appointment == null)
            {
                throw new NotFoundException("Không tìm thấy cuộc hẹn");
            }

            appointment.Status = AppointmentStatusEnum.Completed;
            _context.Appointments.Update(appointment);
            _context.SaveChanges();
            return Task.FromResult(new Message("Thành công"));
        }

        public Task<Message> CancelAppointment(Guid userId, Guid appointmentId)
        {
            var appointment = _context.Appointments.FirstOrDefault(a =>
                a.Id == appointmentId);
            if (appointment == null || (appointment.MentorId != userId && appointment.MenteeId != userId))
            {
                throw new NotFoundException("Không tìm thấy cuộc hẹn");
            }

            appointment.Status = AppointmentStatusEnum.Cancelled;
            _context.Appointments.Update(appointment);
            _context.SaveChanges();
            return Task.FromResult(new Message("Cuộc hẹn đã bị hủy"));
        }

        public async Task<Message> DeleteAppointment(Guid menteeId, Guid appointmentId)
        {
            var appointment = await _context.Appointments.FirstOrDefaultAsync(a =>
                a.Id == appointmentId && a.MenteeId == menteeId);
            if (appointment == null)
            {
                throw new NotFoundException("Không tìm thấy cuộc hẹn");
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return new Message("Cuộc hẹn đã bị xóa");
        }
    }
}
