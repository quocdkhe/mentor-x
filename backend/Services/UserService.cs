using backend.Models;
using backend.Services.Interfaces;
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

        public async Task UpdateUserAvatar(Guid userId, string avatarUrl)
        {
            await _context.Set<User>()
                .Where(u => u.Id == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.Avatar, avatarUrl));
        }
    }
}
