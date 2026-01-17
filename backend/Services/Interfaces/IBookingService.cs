using backend.Models;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces
{
    public interface IBookingService
    {
        Task<List<AvailabilityResponseDTO>> GetAvailabilities(Guid mentorId);
        Task<ServiceResult<Message>> UpdateAvailabilities(Guid mentorId, List<AvailabilityResponseDTO> availabilities);
    }
}
