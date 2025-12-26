


using System.Security.Claims;
using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Forum;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("/forum-topics")]
    public class ForumController : ControllerBase
    {
        private readonly IForumService _forumService;
        public ForumController(IForumService forumService)
        {
            _forumService = forumService;
        }
        
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ForumTopic>> CreateNewTopic([FromBody] CreateTopicDTO dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null)
            {
                return Unauthorized(new Message("Không tìm thấy user"));
            }
            var userId = Guid.Parse(userIdString);
            var newTopic = new ForumTopic
            {
                UserId = userId,
                Topic = dto.Topic,
                Type = dto.Type,
            };
            var result = await _forumService.CreateNewTopic(newTopic);
            if (!result.Success)
            {
                return BadRequest(new Message(result.Message));
            }

            return Ok(result.Data);
        }
        
        [HttpGet]
        public async Task<ActionResult<PaginationDto<ForumTopicDto>>> GetAllTopics([FromQuery] PaginationRequest request)
        {
            return await _forumService.GetAllTopicPagination(request);
        }
    }
}

