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
                return NotFound(new { message = "Mentor not found" });

            return Ok(mentor);
        }   
            

    }
}
