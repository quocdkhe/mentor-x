using backend.Models;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class MentorService : IMentorService
    {
        private readonly MentorXContext _context;
        public MentorService(MentorXContext context)
        {
            _context = context;
        }

        public async Task<MentorListResponseDTO> GetAllMentors()
        {
            var mentors = await _context.MentorProfiles
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
            return new MentorListResponseDTO
            {
                Mentors = mentors
            };
        }

        public async Task<List<SkillDTO>> GetMentorSkills()
        {
            var skills = await _context.Skills
                .Select(s => new SkillDTO
                {
                    Id = s.Id,
                    Name = s.Name
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
    }
}
