using backend.Models.DTOs;
using backend.Models.DTOs.Review;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost("reviews")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<Message>> CreateReview([FromBody] CreateReviewRequestDTO dto)
    {
        var menteeId = User.GetUserId();
        var result = await _reviewService.CreateReviewAsync(menteeId, dto);

        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }

        return Ok(result.Data);
    }

    [HttpGet("mentors/{mentorId}/reviews")]
    public async Task<ActionResult<PaginationDto<MentorReviewResponseDTO>>> GetMentorReviews(
        Guid mentorId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5)
    {
        // Get current user ID if authenticated
        Guid? userId = null;
        if (User.Identity != null && User.Identity.IsAuthenticated)
        {
            userId = User.GetUserId();
        }

        var result = await _reviewService.GetMentorReviews(mentorId, page, pageSize, userId);

        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }

        return Ok(result.Data);
    }

    [HttpPost("reviews/{reviewId}/upvote")]
    [Authorize]
    public async Task<ActionResult<Message>> ToggleUpvote(Guid reviewId)
    {
        var userId = User.GetUserId();
        var result = await _reviewService.ToggleUpvoteAsync(reviewId, userId);

        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }

        return Ok(result.Data);
    }
}
