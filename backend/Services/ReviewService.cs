using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Review;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ReviewService : IReviewService
    {
        private readonly MentorXContext _context;

        public ReviewService(MentorXContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<Message>> ToggleUpvoteAsync(Guid reviewId, Guid userId)
        {
            var review = await _context.MentorReviews
                .Include(r => r.Upvoters)
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null)
            {
                return ServiceResult<Message>.Fail("Không tìm thấy đánh giá");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return ServiceResult<Message>.Fail("Không tìm thấy người dùng");
            }

            var existingUpvote = review.Upvoters.FirstOrDefault(u => u.Id == userId);

            if (existingUpvote != null)
            {
                // Remove upvote
                review.Upvoters.Remove(existingUpvote);
                await _context.SaveChangesAsync();
                return ServiceResult<Message>.Ok(new Message("Đã bỏ thích đánh giá"));
            }
            else
            {
                // Add upvote
                review.Upvoters.Add(user);
                await _context.SaveChangesAsync();
                return ServiceResult<Message>.Ok(new Message("Đã thích đánh giá"));
            }
        }

        public async Task<ServiceResult<Message>> CreateReviewAsync(Guid menteeId, CreateReviewRequestDTO dto)
        {
            // Validate appointment exists and belongs to the mentee
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId && a.MenteeId == menteeId);

            if (appointment == null)
            {
                return ServiceResult<Message>.Fail("Không tìm thấy cuộc hẹn hoặc bạn không có quyền đánh giá cuộc hẹn này");
            }

            // Validate appointment status is Completed
            if (appointment.Status != AppointmentStatusEnum.Completed)
            {
                return ServiceResult<Message>.Fail("Chỉ có thể đánh giá sau khi cuộc hẹn đã hoàn thành");
            }

            // Check if review already exists for this appointment
            var existingReview = await _context.MentorReviews
                .FirstOrDefaultAsync(r => r.AppointmentId == dto.AppointmentId);

            if (existingReview != null)
            {
                return ServiceResult<Message>.Fail("Bạn đã đánh giá cuộc hẹn này rồi");
            }

            // Create new review
            var review = new MentorReview
            {
                Id = Guid.NewGuid(),
                MentorId = appointment.MentorId,
                MenteeId = menteeId,
                AppointmentId = dto.AppointmentId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _context.MentorReviews.AddAsync(review);
            await _context.SaveChangesAsync();

            // Update mentor profile ratings
            var mentorProfile = await _context.MentorProfiles
                .FirstOrDefaultAsync(m => m.UserId == appointment.MentorId);

            if (mentorProfile != null)
            {
                // Calculate new average rating
                var allReviews = await _context.MentorReviews
                    .Where(r => r.MentorId == appointment.MentorId)
                    .ToListAsync();

                mentorProfile.TotalRatings = allReviews.Count;
                mentorProfile.AvgRating = allReviews.Average(r => r.Rating);
                mentorProfile.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
            }

            return ServiceResult<Message>.Ok(new Message("Đánh giá của bạn đã được gửi thành công"));
        }

        public async Task<ServiceResult<PaginationDto<MentorReviewResponseDTO>>> GetMentorReviews(
            Guid mentorId,
            int page,
            int pageSize,
            Guid? currentUserId = null)
        {
            // Validate page and pageSize
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 5;

            var query = _context.MentorReviews
                .Include(r => r.Mentee)
                .Include(r => r.Appointment)
                .Include(r => r.Upvoters)
                .Where(r => r.MentorId == mentorId);

            var totalItems = await query.CountAsync();

            var reviews = await query
                .OrderByDescending(r => r.Upvoters.Count)
                .ThenByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new MentorReviewResponseDTO
                {
                    Id = r.Id,
                    MenteeName = r.Mentee.Name,
                    MenteeAvatar = r.Mentee.Avatar,
                    AppointmentStartAt = r.Appointment.StartAt,
                    AppointmentEndAt = r.Appointment.EndAt,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    UpvoteCount = r.Upvoters.Count,
                    CreatedAt = r.CreatedAt,
                    IsUpvotedByCurrentUser = currentUserId.HasValue && r.Upvoters.Any(u => u.Id == currentUserId.Value)
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            return ServiceResult<PaginationDto<MentorReviewResponseDTO>>.Ok(new PaginationDto<MentorReviewResponseDTO>
            {
                Items = reviews,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages
            });
        }
    }
}
