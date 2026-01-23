using backend.Models;
using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using backend.Models.DTOs;
using backend.Models.DTOs.User;

namespace backend.Services
{
    public class MentorService : IMentorService
    {
        private readonly MentorXContext _context;
        public MentorService(MentorXContext context)
        {
            _context = context;
        }

        public async Task<PaginationDto<MentorListItemDTO>> GetAllMentors(PaginationRequest paginationRequest, String searchTerm = "", Guid skillId = default, Guid? userId = null)
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
                UserId = m.UserId,
                Name = m.User.Name,
                Avatar = m.User.Avatar,
                Biography = m.Biography,
                Skills = m.MentorSkills.Select(s => s.Name).ToList(),
                AvgRating = m.AvgRating,
                TotalRatings = m.TotalRatings,
                PricePerHour = m.PricePerHour,
                Position = m.Position,
                Company = m.Company,
                YearsOfExperience = m.YearsOfExperience,
                HasMet = userId.HasValue && _context.Appointments.Any(a => a.MenteeId == userId.Value
                    && a.MentorId == m.UserId && a.Status == AppointmentStatusEnum.Completed)
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

        public async Task<MentorDetailResponseDTO?> GetMentorByUserId(Guid userId, Guid? currentUserId = null)
        {
            var mentor = await _context.MentorProfiles
                .Include(m => m.User)
                .Include(m => m.MentorSkills)
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (mentor == null)
                return null;

            // Calculate meeting hours if currentUserId is provided
            double meetingHours = 0;
            if (currentUserId.HasValue)
            {
                var completedAppointments = await _context.Appointments
                    .Where(a => a.MenteeId == currentUserId.Value 
                        && a.MentorId == mentor.UserId 
                        && a.Status == AppointmentStatusEnum.Completed)
                    .ToListAsync();

                meetingHours = completedAppointments
                    .Sum(a => (a.EndAt - a.StartAt).TotalHours);
            }

            var mentorDetail = new MentorDetailResponseDTO
            {
                Id = mentor.Id,
                UserId = mentor.UserId,
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
                MeetingHours = meetingHours
            };
            return mentorDetail;
        }

        public async Task<MentorProfileResponseDTO?> GetMentorProfileByUserId(Guid userId)
        {
            var mentor = await _context.MentorProfiles
                .Include(m => m.User)
                .Include(m => m.MentorSkills)
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (mentor == null)
                return null;

            var profileResponse = new MentorProfileResponseDTO
            {
                User = new UserInfoResponseDTO
                {
                    Name = mentor.User.Name,
                    Phone = mentor.User.Phone,
                    Avatar = mentor.User.Avatar
                },
                Biography = mentor.Biography,
                PricePerHour = mentor.PricePerHour,
                Skills = mentor.MentorSkills.Select(s => s.Id).ToList(),
                Company = mentor.Company,
                Position = mentor.Position,
                YearsOfExperience = mentor.YearsOfExperience
            };

            return profileResponse;
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

            if (!string.IsNullOrWhiteSpace(request.Position))
                mentorProfile.Position = request.Position;

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

        public async Task<Guid?> GetMentorIdByUserId(Guid userId)
        {
            var mentor = await _context.MentorProfiles
                .FirstOrDefaultAsync(m => m.UserId == userId);
            return mentor?.Id;
        }
    }
}
