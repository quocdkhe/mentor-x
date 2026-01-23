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
}
