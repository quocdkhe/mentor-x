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
                Author = new AuthorDto
                {
                    Role = t.User.Role.ToString(),
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

    public async Task<PaginationDto<ForumPostDto>> GetAllPostPagination(Guid topicId,
        PaginationRequest paginationRequest)
    {
        var page = paginationRequest.Page < 1 ? 1 : paginationRequest.Page;
        var pageSize = paginationRequest.PageSize < 1 ? 10 : paginationRequest.PageSize;
        
        var query = _context.ForumPosts
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .Where(p => p.ForumTopicId == topicId);
        
        var totalItems = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ForumPostDto
            {
                Id = p.Id.ToString(),
                Content = p.Content,
                Timestamp = p.CreatedAt.ToString(),
                Likes = p.Likers.Select(u => new ForumPostDto.LikeDto { Name = u.Name }).ToList(),
                Author = new AuthorDto
                {
                    Name = p.User.Name,
                    Avatar = p.User.Avatar,
                    Role = p.User.Role.ToString()
                }
            })
            .ToListAsync();
        
        return new PaginationDto<ForumPostDto>
        {
            Items = items,
            CurrentPage = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
        };
    }

    public async Task<ServiceResult<ForumPost>> CreateNewPost(ForumPost post)
    {
        if (!await _context.Users.AnyAsync(e => e.Id == post.UserId))
        {
            return ServiceResult<ForumPost>.Fail("Không tìm thấy người dùng");
        }

        if (!await _context.ForumTopics.AnyAsync(t => t.Id == post.ForumTopicId))
        {
            return ServiceResult<ForumPost>.Fail("Không tìm thấy chủ đề");
        }
        
        var result = await _context.ForumPosts.AddAsync(post);
        await _context.SaveChangesAsync(); 
        
        return ServiceResult<ForumPost>.Ok(result.Entity);
    }
    
}