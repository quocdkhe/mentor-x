using backend.Models.DTOs;
using backend.Models.DTOs.Review;

namespace backend.Services.Interfaces
{
    public interface IReviewService
    {
        Task<ServiceResult<Message>> CreateReviewAsync(Guid menteeId, CreateReviewRequestDTO dto);
    }
}
