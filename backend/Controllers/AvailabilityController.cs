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
            try
            {
                var userId = User.GetUserId();
                
                var MentorId = await _mentorService.GetMentorIdByUserId(userId);
                if(MentorId == null)
                {
                    return BadRequest(new { Message = "User is not a mentor" });
                }
                return await _bookingService.GetAvailabilities(MentorId.Value);
            } 
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPatch]
        [Authorize]
        public async Task<IActionResult> UpdateAvailabilities([FromBody] List<AvailabilityResponseDTO> availabilities)
        {
            try
            {
                var userId = User.GetUserId();
                var mentorId = await _mentorService.GetMentorIdByUserId(userId);
                
                if (mentorId == null)
                {
                    return BadRequest(new { Message = "User is not a mentor" });
                }

                await _bookingService.UpdateAvailabilities(mentorId.Value, availabilities);
                return Ok(new { Message = "Availabilities updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}