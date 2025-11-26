using backend.Models;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly MentorXContext _context;
        public UserService(MentorXContext context)
        {
            _context = context;
        }
        public async Task<User?> GetUserByEmail(string Email)
        {
            var entity = _context.Users.FirstOrDefault(u => u.Email == Email);
            if (entity == null)
            {
                return null;
            }
            return entity;
        }

        public async Task<User?> GetUserById(Guid Id)
        {
            var entity = _context.Users.FirstOrDefault(u => u.Id == Id);
            if (entity == null)
            {
                return null;
            }
            return entity;
        }

        public async Task<bool> UpdateUserProfile(Guid userId, UserUpdateProfileDTO dto)
        {
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (currentUser == null)
            {
                return false;
            }
            currentUser.Name = dto.Name;
            currentUser.Avatar = dto.Avatar;
            currentUser.Phone = dto.Phone;
            if (dto.Password != null)
            {
                currentUser.Password = PasswordHashing.HashPassword(dto.Password);
            }
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
