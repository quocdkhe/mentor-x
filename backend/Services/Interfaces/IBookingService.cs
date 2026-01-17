using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Booking;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces
{
    public interface IBookingService
    {
        Task<List<AvailabilityResponseDTO>> GetAvailabilities(Guid mentorId);
        Task<ServiceResult<Message>> UpdateAvailabilities(Guid mentorId, List<AvailabilityResponseDTO> availabilities);
        Task<ServiceResult<Message>> BookAnAppointment(Guid menteeId, BookingRequestDto dto);
        Task<ServiceResult<List<MentorAppointmentDto>>> GetMentorAppointments(Guid mentorId, DateTime? date);
        Task<ServiceResult<List<MenteeAppointmentDto>>> GetMenteeAppointments(Guid menteeId, DateTime? date);
        Task<ServiceResult<MentorScheduleDto>> GetMentorSchedule(Guid mentorId, DateTime? date);
    }
}
