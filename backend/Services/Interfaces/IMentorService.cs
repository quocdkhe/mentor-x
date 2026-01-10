using backend.Models.DTOs;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces
{
    public interface IMentorService
    {
        Task<PaginationDto<MentorListItemDTO>> GetAllMentors(PaginationRequest paginationRequest, String searchTerm = "", Guid skillId = default);
        Task<List<SkillDTO>> GetMentorSkills();
        Task<MentorDetailResponseDTO?> GetMentorById(Guid mentorId);
        Task<MentorProfileResponseDTO?> GetMentorProfileByUserId(Guid userId);
        Task<bool> RegisterMentor(Guid userId, MentorRegistrationRequestDTO request);
        Task<bool> UpdateMentorProfile(Guid userId, MentorUpdateRequestDTO request);
    }
}

