using backend.Models;
using backend.Models.DTOs;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ForumService : IForumService
{
    
    private readonly MentorXContext _context;
    
    public ForumService(MentorXContext context)
    {
        _context = context;
    }
    
    public async Task<ServiceResult<ForumTopic>> CreateNewTopic(ForumTopic topic)
    {
        if (!await _context.Users.AnyAsync(e => e.Id == topic.UserId))
        {
            return ServiceResult<ForumTopic>.Fail("Không tìm thấy người dùng");
        }
        
        var result = await _context.ForumTopics.AddAsync(topic);
        
        return ServiceResult<ForumTopic>.Ok(result.Entity);
    }
}