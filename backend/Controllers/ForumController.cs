using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Forum;
using backend.Services.Interfaces;
using backend.Utils;
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
        public async Task<ActionResult<Message>> CreateNewTopic([FromBody] CreateTopicDTO dto)
        {
            var userId = User.GetUserId();
            
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
        public async Task<ActionResult<TotalPostCountDto>> CreateNewPost(Guid topicId, [FromBody] CreatePostDto dto)
        {
            var userId = User.GetUserId();
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

        [HttpPatch("topics/posts/{postId}")]
        [Authorize]
        public async Task<ActionResult<Message>> LikeOrDislikePostById(Guid postId)
        {
            var userId = User.GetUserId();
            var result = await _forumService.LikePost(postId, userId);
            if (!result.Success)
            {
                return NotFound(result.Message);
            }

            return Ok(result.Data);
        }

        [HttpDelete("topics/posts/{postId}")]
        [Authorize]
        public async Task<ActionResult<Message>> DeletePost(Guid postId)
        {
            var result = await _forumService.DeletePost(postId);
            if (!result.Success)
            {
                return NotFound(result.Message);
            }
            
            return Ok(result.Data);
        }

        [HttpPut("topics/posts/{postId}")]
        [Authorize]
        public async Task<ActionResult<Message>> UpdatePostContent(CreatePostDto dto, Guid postId)
        {
            var result = await _forumService.UpdatePostContent(postId, dto.Content);
            if (!result.Success)
            {
                return NotFound(result.Message);
            }
            return Ok(result.Data);
        }
    }
}

