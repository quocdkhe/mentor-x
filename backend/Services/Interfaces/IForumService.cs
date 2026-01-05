using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Forum;

namespace backend.Services.Interfaces;

public interface IForumService
{
    Task<ServiceResult<Message>> CreateNewTopic(ForumTopic topic);

    Task<PaginationDto<ForumTopicDto>> GetAllTopicPagination(PaginationRequest paginationRequest);
    
    Task<PaginationDto<ForumPostDto>> GetAllPostPagination(Guid topicId, PaginationRequest paginationRequest);
    
    Task<ServiceResult<TotalPostCountDto>> CreateNewPost(ForumPost post);
    
    Task<ServiceResult<ForumTopicDto>> GetTopicById(Guid id);

    Task<ServiceResult<Message>> LikePost(Guid postId, Guid userId);
    
    Task<ServiceResult<Message>> DeletePost(Guid postId);
    
    Task<ServiceResult<Message>> UpdatePostContent(Guid postId, string newContent);
}   