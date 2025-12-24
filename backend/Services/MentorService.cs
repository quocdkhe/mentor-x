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
            .Include(m => m.User)
            .Include(m => m.MentorSkills)
            .Select(m => new MentorListItemDTO
            {
                Id = m.UserId,                // mentor id = user id
                Name = m.User.Name,
                Avatar = m.User.Avatar,
                Biography = m.Biography,
                Skills = m.MentorSkills.Select(s => s.Name).ToList(),
                AvgRating = m.AvgRating,
                TotalRatings = m.TotalRatings,
                PricePerHour = m.PricePerHour
            })
            .ToListAsync();
            return new MentorListResponseDTO
            {
                Mentors = mentors
            };
        }
    }
}
