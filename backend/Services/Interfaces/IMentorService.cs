using backend.Models.DTOs;
using backend.Models.DTOs.Mentor;

namespace backend.Services.Interfaces
{
    public interface IMentorService
    {
        Task<PaginationDto<MentorListItemDTO>> GetAllMentors(PaginationRequest paginationRequest, String searchTerm = "", Guid skillId = default, Guid? userId = null);
        Task<List<SkillDTO>> GetMentorSkills();
        Task<MentorDetailResponseDTO?> GetMentorByUserId(Guid userId, Guid? currentUserId = null);
        Task<MentorProfileResponseDTO?> GetMentorProfileByUserId(Guid userId);
        Task<bool> RegisterMentor(MentorRegistrationRequestDTO request);
        Task<bool> UpdateMentorProfile(Guid userId, MentorUpdateRequestDTO request);
        Task<List<MentorListItemDTO>> GetPendingMentors();
        Task<bool> ApproveMentor(Guid mentorId);
        Task UpdateVerifiedMentorStatus(bool isVerified, Guid mentorId);
    }
}

