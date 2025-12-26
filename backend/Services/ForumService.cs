using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.Forum;
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
        await _context.SaveChangesAsync(); 
        
        return ServiceResult<ForumTopic>.Ok(result.Entity);
    }
    
    public async Task<PaginationDto<ForumTopicDto>> GetAllTopicPagination(
        PaginationRequest paginationRequest)
    {
        var page = paginationRequest.Page < 1 ? 1 : paginationRequest.Page;
        var pageSize = paginationRequest.PageSize < 1 ? 10 : paginationRequest.PageSize;

        var query = _context.ForumTopics
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt);

        var totalItems = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new ForumTopicDto
            {
                Id = t.Id.ToString(),
                Title = t.Topic,
                Type = t.Type.ToString(),
                DateCreated = t.CreatedAt,
                Author = new ForumTopicDto.AuthorDto
                {
                    Name = t.User.Name,
                    Avatar = t.User.Avatar
                }
            })
            .ToListAsync();

        return new PaginationDto<ForumTopicDto>
        {
            Items = items,
            CurrentPage = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
        };
    }

}