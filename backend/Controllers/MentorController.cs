using backend.Models.DTOs;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Models;
using backend.Utils;

namespace backend.Controllers
{
    [ApiController]
    [Route("/mentors")]
    public class MentorController : ControllerBase
    {
        private readonly IMentorService _mentorService;
        private readonly IBookingService _bookingService;

        public MentorController(IMentorService mentorService, IBookingService bookingService)
        {
            _mentorService = mentorService;
            _bookingService = bookingService;
        }

        [HttpGet("")]
        public async Task<ActionResult<MentorListResponseDTO>> GetAllMentors([FromQuery] PaginationRequest paginationRequest, String searchTerm = "", Guid skillId = default)
        {
            var mentorList = await _mentorService.GetAllMentors(paginationRequest, searchTerm, skillId);
            return Ok(mentorList);
        }

        [HttpGet("skills")]
        public async Task<ActionResult<List<SkillDTO>>> GetMentorSkills()
        {
            var skills = await _mentorService.GetMentorSkills();
            return Ok(skills);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MentorDetailResponseDTO>> GetMentorByUserId(Guid id)
        {
            var mentor = await _mentorService.GetMentorByUserId(id);
            if (mentor == null)
                return NotFound(new { message = "Không tìm thấy mentor." });

            return Ok(mentor);
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<MentorProfileResponseDTO>> GetMyMentorProfile()
        {
            var userId = User.GetUserId();
            var profile = await _mentorService.GetMentorProfileByUserId(userId);

            if (profile == null)
                return NotFound(new { message = "Mentor profile not found." });

            return Ok(profile);
        }



        [HttpPost("register")]
        [Authorize]
        public async Task<IActionResult> RegisterMentor([FromBody] MentorRegistrationRequestDTO request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "Invalid User ID format." });
            }

            try
            {
                await _mentorService.RegisterMentor(userId, request);
                return Ok(new { message = "Registered successfully" });
            }
            catch (Exception ex)
            {
                // In production, probably shouldn't return exact exception message
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateMentorProfile([FromBody] MentorUpdateRequestDTO request)
        {
            try
            {
                var userId = User.GetUserId();
                await _mentorService.UpdateMentorProfile(userId, request);
                return Ok(new { message = "Mentor profile updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{mentorId}/availabilities")]
        public async Task<ActionResult<List<AvailabilityResponseDTO>>> GetAvailabilities(string mentorId)
        {
            if (Guid.TryParse(mentorId, out Guid mentorGuid) == false)
            {
                return BadRequest(new { message = "Id không đúng" });
            }
            var availabilities = await _bookingService.GetAvailabilities(mentorGuid);
            return availabilities;
        }

        [HttpPatch("me/availabilities")]
        [Authorize]
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
