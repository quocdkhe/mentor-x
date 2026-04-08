using backend.Models.DTOs;
using backend.Models.DTOs.Review;

namespace backend.Services.Interfaces
{
    public interface IReviewService
    {
        Task<Message> CreateReviewAsync(Guid menteeId, CreateReviewRequestDTO dto);
        
        Task<PaginationDto<MentorReviewResponseDTO>> GetMentorReviews(
            Guid mentorId, 
            int page, 
            int pageSize, 
            Guid? currentUserId = null
        );

        Task<Message> ToggleUpvoteAsync(Guid reviewId, Guid userId);
    }
}
