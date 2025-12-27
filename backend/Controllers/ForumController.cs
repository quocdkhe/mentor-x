


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
    [Route("/forum")]
    public class ForumController : ControllerBase
    {
        private readonly IForumService _forumService;
        private readonly IUserService _userService;
        public ForumController(IForumService forumService, IUserService userService)
        {
            _forumService = forumService;
            _userService = userService;
        }
        
        [HttpPost("topics")]
        [Authorize]
        public async Task<ActionResult<ForumTopic>> CreateNewTopic([FromBody] CreateTopicDTO dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized(new Message("Không tìm thấy user"));
            }
            
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
        
        [HttpGet("topics")]
        public async Task<ActionResult<PaginationDto<ForumTopicDto>>> GetAllTopics([FromQuery] PaginationRequest request)
        {
            return await _forumService.GetAllTopicPagination(request);
        }
        
        [HttpGet("topics/{topicId}/posts")]
        public async Task<ActionResult<PaginationDto<ForumPostDto>>> GetAllPosts(Guid topicId, [FromQuery] PaginationRequest request)
        {
            return await _forumService.GetAllPostPagination(topicId, request);
        }
        
        [HttpPost("topics/{topicId}/posts")]
        [Authorize]
        public async Task<ActionResult<ForumPost>> CreateNewPost(Guid topicId, [FromBody] CreatePostDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdString == null || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized(new Message("Không tìm thấy user"));
            }
            ForumPost newPost = new ForumPost
            {
                Content = dto.Content,
                UserId = userId,
                ForumTopicId = topicId
            };
        
            var result = await _forumService.CreateNewPost(newPost);
            if (!result.Success)
            {
                return BadRequest(new Message(result.Message));
            }
        
            return Ok(result.Data);
        }

        [HttpGet("topics/{topicId}")]
        public async Task<ActionResult<ForumTopic>> GetPostById(Guid topicId)
        {
            var result = await _forumService.GetTopicById(topicId);
            if (!result.Success)
            {
                return NotFound(new Message(result.Message));
            }
            return Ok(result.Data);
        }
    }
}

