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
    
    public async Task<ServiceResult<Message>> CreateNewTopic(ForumTopic topic)
    {
        if (!await _context.Users.AnyAsync(e => e.Id == topic.UserId))
        {
            return ServiceResult<Message>.Fail("Không tìm thấy người dùng");
        }
        
        var result = await _context.ForumTopics.AddAsync(topic);
        await _context.SaveChangesAsync(); 
        
        return ServiceResult<Message>.Ok(new Message("Tạo chủ đề thành công"));
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
                    Id = t.UserId,
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
            .OrderBy(p => p.CreatedAt)
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
                    Id = p.UserId,
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

    public async Task<ServiceResult<TotalPostCountDto>> CreateNewPost(ForumPost post)
    {
        if (!await _context.Users.AnyAsync(e => e.Id == post.UserId))
        {
            return ServiceResult<TotalPostCountDto>.Fail("Không tìm thấy người dùng");
        }

        if (!await _context.ForumTopics.AnyAsync(t => t.Id == post.ForumTopicId))
        {
            return ServiceResult<TotalPostCountDto>.Fail("Không tìm thấy chủ đề");
        }
        
        var result = await _context.ForumPosts.AddAsync(post);
        await _context.SaveChangesAsync(); 
        
        // Now return a new total count
        var newTotalCount = await _context.ForumPosts
            .Where(p => p.ForumTopicId == post.ForumTopicId)
            .CountAsync();
        
        return ServiceResult<TotalPostCountDto>.Ok(new TotalPostCountDto(newTotalCount));
    }

    public async Task<ServiceResult<ForumTopicDto>> GetTopicById(Guid id)
    {
        var query = _context.ForumTopics
            .AsNoTracking();

        var result = await query
            .Where(t => t.Id == id)
            .Select(t => new ForumTopicDto
            {
                Id = t.Id.ToString(),
                Title = t.Topic,
                Type = t.Type.ToString(),
                DateCreated = t.CreatedAt,
                Author = new AuthorDto
                {
                    Id = t.UserId,
                    Role = t.User.Role.ToString(),
                    Name = t.User.Name,
                    Avatar = t.User.Avatar
                }
            }).FirstOrDefaultAsync();
        return result != null ? 
            ServiceResult<ForumTopicDto>.Ok(result) : ServiceResult<ForumTopicDto>.Fail("Không tìm thấy topic");
    }

    public async Task<ServiceResult<Message>> LikePost(Guid postId, Guid userId)
    {
        if (!await _context.Users.AnyAsync(u => u.Id == userId))
        {
            return ServiceResult<Message>.Fail("Không tìm thấy người dùng");
        }

        var post = await _context.ForumPosts
            .Include(p => p.Likers)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post == null)
        {
            return ServiceResult<Message>.Fail("Không tìm thấy bài viết");
        }

        var existingUser = post.Likers.FirstOrDefault(u => u.Id == userId);

        if (existingUser != null)
        {
            post.Likers.Remove(existingUser); 
        }
        else
        {
            var user = new User { Id = userId };
            _context.Users.Attach(user);  
            post.Likers.Add(user);
        }

        await _context.SaveChangesAsync();

        return ServiceResult<Message>.Ok(new Message("ok"));
    }

    public async Task<ServiceResult<Message>> DeletePost(Guid postId)
    {
        var post = new ForumPost { Id = postId };

        if (!await _context.ForumPosts.AnyAsync(p => p.Id == postId))
        {
            return ServiceResult<Message>.Fail("Không tìm thấy post");
        }
        
        _context.ForumPosts.Attach(post);
        _context.ForumPosts.Remove(post);
        await _context.SaveChangesAsync();

        return ServiceResult<Message>.Ok(new Message("ok"));
    }

    public async Task<ServiceResult<Message>> UpdatePostContent(Guid postId, string newContent)
    {
        var post = await _context.ForumPosts.FindAsync(postId);

        if (post == null)
        {
            return ServiceResult<Message>.Fail("Không tìm thấy post");
        }

        post.Content = newContent;
        post.UpdatedAt = DateTime.UtcNow; 

        await _context.SaveChangesAsync();

        return ServiceResult<Message>.Ok(new Message("Cập nhật bài viết thành công"));
    }





}