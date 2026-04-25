using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Booking;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces
{
    public interface IBookingService
    {
        Task<List<AvailabilityResponseDTO>> GetAvailabilities(Guid mentorId);
        Task<Message> UpdateAvailabilities(Guid mentorId, List<AvailabilityResponseDTO> availabilities);
        Task<BookingCreatedResponseDto> BookAnAppointment(Guid menteeId, BookingRequestDto dto);
        Task<List<MentorAppointmentDto>> GetMentorAppointments(Guid mentorId, DateTime? date);
        Task<List<MenteeAppointmentDto>> GetMenteeAppointments(Guid menteeId, DateTime? date);
        Task<AppointmentPaymentDetailDto> GetAppointmentPaymentDetail(Guid menteeId, Guid appointmentId);
        Task<MentorScheduleDto> GetMentorSchedule(Guid mentorId, DateTime? date);
        Task<Message> AcceptAppointment(Guid mentorId, Guid appointmentId, AcceptAppointmentDto dto);
        Task<Message> CancelAppointment(Guid userId, Guid appointmentId);
        Task<Message> CompleteAppointment(Guid mentorId, Guid appointmentId);
        Task<Message> DeleteAppointment(Guid userId, Guid appointmentId);
    }
}
