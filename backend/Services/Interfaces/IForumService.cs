using backend.Models;
using backend.Models.DTOs;

namespace backend.Services.Interfaces;

public interface IForumService
{
    Task<ServiceResult<ForumTopic>> CreateNewTopic(ForumTopic topic);
}