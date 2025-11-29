using backend.Models;
using backend.Models.DTOs.User;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly MentorXContext mentorXContext;
        public AuthService(MentorXContext mentorXContext)
        {
            this.mentorXContext = mentorXContext;
        }

        public async Task<User> Register(RegisterDTO registerDto)
        {
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
            var userEntity = await mentorXContext.Users.AddAsync(new User
            {
                Name = registerDto.Name,
                Phone = registerDto.Phone,
                Email = registerDto.Email,
                Password = hashedPassword,
                Avatar = registerDto.Avatar
            });
            mentorXContext.SaveChanges();
            return userEntity.Entity;
        }

    }
}
