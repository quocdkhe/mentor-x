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

        public MentorController(IMentorService mentorService)
        {
            _mentorService = mentorService;
        }

        [HttpGet("")]
        public async Task<ActionResult<MentorListResponseDTO>> GetAllMentors([FromQuery] PaginationRequest paginationRequest, String searchTerm = "", Guid skillId = default)
        {
            // Try to get userId from JWT if user is logged in
            Guid? userId = null;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedUserId))
            {
                userId = parsedUserId;
            }

            var mentorList = await _mentorService.GetAllMentors(paginationRequest, searchTerm, skillId, userId);
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
            // Try to get currentUserId from JWT if user is logged in
            Guid? currentUserId = null;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedUserId))
            {
                currentUserId = parsedUserId;
            }

            var mentor = await _mentorService.GetMentorByUserId(id, currentUserId);
            if (mentor == null)
                return NotFound(new { message = "Không tìm thấy mentor." });

            return Ok(mentor);
        }

        [HttpGet("profile")]
        [Authorize(Roles = Roles.Mentor)]
        public async Task<ActionResult<MentorProfileResponseDTO>> GetMyMentorProfile()
        {
            var userId = User.GetUserId();
            var profile = await _mentorService.GetMentorProfileByUserId(userId);

            if (profile == null)
                return NotFound(new { message = "Mentor profile not found." });

            return Ok(profile);
        }



        [HttpPost("register")]
        public async Task<IActionResult> RegisterMentor([FromBody] MentorRegistrationRequestDTO request)
        {

            try
            {
                await _mentorService.RegisterMentor(request);
                return Ok(new { message = "Registered successfully. Please wait for admin approval." });
            }
            catch (Exception ex)
            {
                // In production, probably shouldn't return exact exception message
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("pending")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<List<MentorListItemDTO>>> GetPendingMentors()
        {
            var mentors = await _mentorService.GetPendingMentors();
            return Ok(mentors);
        }

        [HttpPost("{id}/approve")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> ApproveMentor(Guid id)
        {
            try
            {
                await _mentorService.ApproveMentor(id);
                return Ok(new { message = "Mentor approved successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("profile")]
        [Authorize(Roles = Roles.Mentor)]
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

        [HttpPatch("{mentorId}/verify")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> UpdateVerifiedMentorStatus([FromBody] VerifyRequestDto dto, Guid mentorId)
        {
            await _mentorService.UpdateVerifiedMentorStatus(dto.IsVerified, mentorId);
            return Ok(new { message = "Xác nhận thành công" });
        }


    }
}
