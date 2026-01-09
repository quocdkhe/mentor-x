using backend.Models;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using backend.Models.DTOs;

namespace backend.Services
{
    public class MentorService : IMentorService
    {
        private readonly MentorXContext _context;
        public MentorService(MentorXContext context)
        {
            _context = context;
        }

        public async Task<PaginationDto<MentorListItemDTO>> GetAllMentors(PaginationRequest paginationRequest, String searchTerm = "", Guid skillId = default)
        {
            var page = paginationRequest.Page < 1 ? 1 : paginationRequest.Page;
            var pageSize = paginationRequest.PageSize < 1 ? 10 : paginationRequest.PageSize;
            var query = _context.MentorProfiles
                .AsNoTracking();
            
            var totalItems = await query.CountAsync();
            
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var keyword = $"%{searchTerm}%";

                query = query.Where(m =>
                    EF.Functions.ILike(m.User.Name, keyword) ||
                    EF.Functions.ILike(m.Company, keyword) ||
                    EF.Functions.ILike(m.Position, keyword)
                );
            }


            if (skillId != default)
            {
                query = query.Where(m => m.MentorSkills.Any(s => s.Id == skillId));
            }
            
            var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Where(m => m.Status == "approved")
            .Include(m => m.User)
            .Include(m => m.MentorSkills)
            .Select(m => new MentorListItemDTO
            {
                Id = m.Id,
                Name = m.User.Name,
                Avatar = m.User.Avatar,
                Biography = m.Biography,
                Skills = m.MentorSkills.Select(s => s.Name).ToList(),
                AvgRating = m.AvgRating,
                TotalRatings = m.TotalRatings,
                PricePerHour = m.PricePerHour,
                Position = m.Position,
                Company = m.Company,
                YearsOfExperience = m.YearsOfExperience
            })
            .ToListAsync();
            
            return new PaginationDto<MentorListItemDTO>
            {
                Items = items,
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        public async Task<List<SkillDTO>> GetMentorSkills()
        {
            var skills = await _context.Skills
                .Select(s => new SkillDTO
                {
                    Id = s.Id,
                    Name = s.Name,
                    Icon = s.Icon
                })
                .ToListAsync();
            return skills;
        }

        public async Task<MentorDetailResponseDTO?> GetMentorById(Guid mentorId)
        {
            var mentor = await _context.MentorProfiles
                .Include(m => m.User)
                .Include(m => m.MentorSkills)
                .Include(m => m.MentorReviews)
                .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(m => m.Id == mentorId);

            if (mentor == null)
                return null;

            var mentorDetail = new MentorDetailResponseDTO
            {
                Id = mentor.Id,
                Name = mentor.User.Name,
                Avatar = mentor.User.Avatar,
                Biography = mentor.Biography,
                Skills = mentor.MentorSkills.Select(s => s.Name).ToList(),
                AvgRating = mentor.AvgRating,
                TotalRatings = mentor.TotalRatings,
                PricePerHour = mentor.PricePerHour,
                Position = mentor.Position,
                Company = mentor.Company,
                YearsOfExperience = mentor.YearsOfExperience,
                Reviews = mentor.MentorReviews
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new MentorReviewDTO
                    {
                        Id = r.Id,
                        UserId = r.UserId,
                        UserName = r.User.Name,
                        UserAvatar = r.User.Avatar,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        Date = r.CreatedAt
                    })
                    .ToList()
            };
            return mentorDetail;

        }

        public async Task<bool> RegisterMentor(Guid userId, MentorRegistrationRequestDTO request)
        {
            var user = await _context.Users
                .Include(u => u.MentorProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            if (user.MentorProfile != null)
                throw new Exception("User is already a mentor");

            // Role update
            user.Role = UserRole.Mentor;

            // Skills
            var skills = new List<Skill>();
            foreach (var skillName in request.Skills)
            {
                var skill = await _context.Skills.FirstOrDefaultAsync(s => s.Name == skillName);
                if (skill == null)
                {
                    skill = new Skill { Name = skillName.ToUpper() };
                    _context.Skills.Add(skill);
                }
                skills.Add(skill);
            }

            // Profile
            var mentorProfile = new MentorProfile
            {
                UserId = userId,
                Biography = request.Biography,
                PricePerHour = request.PricePerHour,
                MentorSkills = skills,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AvgRating = 0,
                TotalRatings = 0
            };

            _context.MentorProfiles.Add(mentorProfile);
            await _context.SaveChangesAsync(); // Saves both user role update and new mentor profile
            return true;
        }

        public async Task<bool> UpdateMentorProfile(Guid userId, MentorUpdateRequestDTO request)
        {
            var user = await _context.Users
                .Include(u => u.MentorProfile)
                .ThenInclude(m => m.MentorSkills)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            if (user.MentorProfile == null)
                throw new Exception("User is not a mentor");

            var mentorProfile = user.MentorProfile;

            // Update User Information
            if (request.User != null)
            {
                if (!string.IsNullOrWhiteSpace(request.User.Name))
                    user.Name = request.User.Name;

                if (!string.IsNullOrWhiteSpace(request.User.Phone))
                    user.Phone = request.User.Phone;

                if (!string.IsNullOrWhiteSpace(request.User.Avatar))
                    user.Avatar = request.User.Avatar;

                if (!string.IsNullOrWhiteSpace(request.User.Password))
                    user.Password = PasswordHashing.HashPassword(request.User.Password);

                user.UpdatedAt = DateTime.UtcNow;
            }

            // Update Mentor Profile Information
            if (!string.IsNullOrWhiteSpace(request.Biography))
                mentorProfile.Biography = request.Biography;

            if (request.PricePerHour.HasValue)
                mentorProfile.PricePerHour = request.PricePerHour.Value;

            if (!string.IsNullOrWhiteSpace(request.Employer))
                mentorProfile.Position = request.Employer;

            if (!string.IsNullOrWhiteSpace(request.Company))
                mentorProfile.Company = request.Company;

            if (request.YearsOfExperience.HasValue)
                mentorProfile.YearsOfExperience = request.YearsOfExperience.Value;

            // Update Skills if provided
            if (request.Skills != null && request.Skills.Count > 0)
            {
                // Remove old skills
                mentorProfile.MentorSkills.Clear();

                // Add new skills
                var skills = new List<Skill>();
                foreach (var skillName in request.Skills)
                {
                    var skill = await _context.Skills.FirstOrDefaultAsync(s => s.Id.ToString() == skillName);
                    skills.Add(skill);
                }
                mentorProfile.MentorSkills = skills;
            }

            mentorProfile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
