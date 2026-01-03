using backend.Models.DTOs;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Models;

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
        public async Task<ActionResult<MentorListResponseDTO>> GetAllMentors()
        {
            var mentorList = await _mentorService.GetAllMentors();
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
    }
}
