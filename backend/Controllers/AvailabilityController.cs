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
    [Route("/availabilities")]
    public class AvailabilityController: ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IMentorService _mentorService;
        public AvailabilityController(IBookingService bookingService, IMentorService mentorService)
        {
            _bookingService = bookingService;
            _mentorService = mentorService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<AvailabilityResponseDTO>>> GetAvailabilities()
        {
            var userId = User.GetUserId();
            return Ok(await _bookingService.GetAvailabilities(userId));
        }

        [HttpPatch]
        [Authorize]
        public async Task<IActionResult> UpdateAvailabilities([FromBody] List<AvailabilityResponseDTO> availabilities)
        {
            var userId = User.GetUserId();
            var result = await _bookingService.UpdateAvailabilities(userId, availabilities);
            if (!result.Success)
            {
                return BadRequest(new Message(result.Message));
            }
            return Ok(result.Data);
        }
    }
}