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

            // Start with approved mentors only
            var query = _context.MentorProfiles
                .AsNoTracking()
                .Where(m => m.Status == "approved");

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

            // Count after filters so pagination is correct
            var totalItems = await query.CountAsync();

            var items = await query
                .OrderByDescending(m => !m.IsVerified)  // verified first, across ALL pages
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
                    IsVerified = m.IsVerified,
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
                MeetingHours = meetingHours,
                IsVerified = mentor.IsVerified
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

        public async Task<bool> RegisterMentor(MentorRegistrationRequestDTO request)
        {
            // Check if email or phone already exists
            if (request.User == null) throw new Exception("User info required");

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.User.Email);

            if (existingUser != null)
            {
                if (existingUser.Email == request.User.Email)
                    throw new Exception("Email already exists");
            }

            // Create new User
            var newUser = new User
            {
                Name = request.User.Name,
                Email = request.User.Email,
                Phone = request.User.Phone,
                Avatar = request.User.Avatar,
                Password = PasswordHashing.HashPassword(request.User.Password),
                Role = UserRole.User, // Default to Mentee until approved
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync(); // Save to get the new UserId

            // Skills
            var skills = new List<Skill>();
            foreach (var skillName in request.Skills)
            {
                var skill = await _context.Skills.FirstOrDefaultAsync(s => s.Id.ToString() == skillName || s.Name == skillName);
                if (skill == null)
                {
                    if (Guid.TryParse(skillName, out var skillId))
                    {
                        skill = await _context.Skills.FindAsync(skillId);
                    }
                }

                if (skill != null)
                {
                    skills.Add(skill);
                }
            }

            // Create MentorProfile linked to new User
            var mentorProfile = new MentorProfile
            {
                UserId = newUser.Id,
                Biography = request.Biography,
                PricePerHour = request.PricePerHour,
                MentorSkills = skills,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                AvgRating = 0,
                TotalRatings = 0,
                Company = request.Company,
                Position = request.Position,
                YearsOfExperience = request.YearsOfExperience,
                Status = "pending" // Set status to pending
            };

            _context.MentorProfiles.Add(mentorProfile);
            await _context.SaveChangesAsync();
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

        public async Task<List<MentorListItemDTO>> GetPendingMentors()
        {
            var items = await _context.MentorProfiles
                .AsNoTracking()
                .Where(m => m.Status == "pending")
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
                    HasMet = false
                })
                .ToListAsync();

            return items;
        }

        public async Task<bool> ApproveMentor(Guid mentorProfileId)
        {
            var mentorProfile = await _context.MentorProfiles
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.Id == mentorProfileId);

            if (mentorProfile == null)
                throw new Exception("Mentor profile not found");

            if (mentorProfile.Status == "approved")
                return true;

            mentorProfile.Status = "approved";
            mentorProfile.User.Role = UserRole.Mentor; // Update user role to Mentor
            mentorProfile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UpdateVerifiedMentorStatus(bool isVerified, Guid mentorId)
        {
            var mentor = await _context.MentorProfiles.FirstOrDefaultAsync(mp => mp.User.Id == mentorId);
            mentor.IsVerified = isVerified;
            await _context.SaveChangesAsync();
        }
    }
}
