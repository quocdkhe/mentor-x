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

            return ServiceResult<Message>.Ok(new Message("Đánh giá của bạn đã được gửi thành công"));
        }
    }
}
