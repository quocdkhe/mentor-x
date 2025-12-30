using backend.Models;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces
{
    public interface IMentorService
    {
        Task<MentorListResponseDTO> GetAllMentors();
        Task<List<SkillDTO>> GetMentorSkills();
        Task<MentorDetailResponseDTO?> GetMentorById(Guid mentorId);
    }
}

