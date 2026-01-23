using backend.Models.DTOs;
using backend.Models.DTOs.Review;

namespace backend.Services.Interfaces
{
    public interface IReviewService
    {
        Task<ServiceResult<Message>> CreateReviewAsync(Guid menteeId, CreateReviewRequestDTO dto);
        
        Task<ServiceResult<PaginationDto<MentorReviewResponseDTO>>> GetMentorReviews(
            Guid mentorId, 
            int page, 
            int pageSize, 
            Guid? currentUserId = null
        );

        Task<ServiceResult<Message>> ToggleUpvoteAsync(Guid reviewId, Guid userId);
    }
}
