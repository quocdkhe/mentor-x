using backend.Models.DTOs;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces
{
    public interface IMentorService
    {
        Task<PaginationDto<MentorListItemDTO>> GetAllMentors(PaginationRequest paginationRequest);
        Task<List<SkillDTO>> GetMentorSkills();
        Task<MentorDetailResponseDTO?> GetMentorById(Guid mentorId);
        Task<bool> RegisterMentor(Guid userId, MentorRegistrationRequestDTO request);
        Task<bool> UpdateMentorProfile(Guid userId, MentorUpdateRequestDTO request);
    }
}

