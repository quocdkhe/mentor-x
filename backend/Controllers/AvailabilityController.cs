using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    public class AvailabilityController : ControllerBase
    {

        private readonly IBookingService _bookingService;

        public AvailabilityController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("/mentors/{mentorId}/availabilities")]
        public async Task<ActionResult<List<AvailabilityResponseDTO>>> GetAvailabilities([FromRoute] Guid mentorId)
        {
            var availabilities = await _bookingService.GetAvailabilities(mentorId);
            return Ok(availabilities);
        }

        [HttpPatch("/mentors/me/availabilities")]
        [Authorize(Roles = Roles.Mentor)]
        public async Task<ActionResult<Message>> UpdateAvailabilities([FromBody] List<AvailabilityResponseDTO> availabilities)
        {
            var userId = User.GetUserId();
            var serviceResult = await _bookingService.UpdateAvailabilities(userId, availabilities);
            if (!serviceResult.Success)
            {
                return BadRequest(new { message = serviceResult.Message });
            }
            return Ok(new { message = "Cập nhật lịch khả dụng thành công" });
        }
    }
}
