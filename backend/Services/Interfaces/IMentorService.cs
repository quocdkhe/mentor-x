using backend.Models;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces
{
    public interface IMentorService
    {
        Task<MentorListResponseDTO> GetAllMentors();
    }
}
