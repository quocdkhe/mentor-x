using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Forum;

namespace backend.Services.Interfaces;

public interface IForumService
{
    Task<ServiceResult<ForumTopic>> CreateNewTopic(ForumTopic topic);

    Task<PaginationDto<ForumTopicDto>> GetAllTopicPagination(PaginationRequest paginationRequest);
    
    Task<PaginationDto<ForumPostDto>> GetAllPostPagination(Guid topicId, PaginationRequest paginationRequest);
    
    Task<ServiceResult<ForumPost>> CreateNewPost(ForumPost post);
    
    Task<ServiceResult<ForumTopicDto>> GetTopicById(Guid id);
}   