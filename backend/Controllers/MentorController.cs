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
        public async Task<ActionResult<MentorDetailResponseDTO>> GetMentorById(Guid id)
        {
            var mentor = await _mentorService.GetMentorById(id);
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
    }
}
