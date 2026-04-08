using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Forum;

namespace backend.Services.Interfaces;

public interface IForumService
{
    Task<Message> CreateNewTopic(ForumTopic topic);

    Task<PaginationDto<ForumTopicDto>> GetAllTopicPagination(PaginationRequest paginationRequest);
    
    Task<PaginationDto<ForumPostDto>> GetAllPostPagination(Guid topicId, PaginationRequest paginationRequest);
    
    Task<TotalPostCountDto> CreateNewPost(ForumPost post);
    
    Task<ForumTopicDto> GetTopicById(Guid id);

    Task<Message> LikePost(Guid postId, Guid userId);
    
    Task<Message> DeletePost(Guid postId);
    
    Task<Message> UpdatePostContent(Guid postId, string newContent);
}