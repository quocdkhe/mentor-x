using backend.Models;
using backend.Models.DTOs.User;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly MentorXContext mentorXContext;
        public AuthService(MentorXContext mentorXContext)
        {
            this.mentorXContext = mentorXContext;
        }

        public async Task<UserResponseDTO> Register(RegisterDTO registerDto)
        {
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
            var entity = await mentorXContext.Users.AddAsync(new User
            {
                Name = registerDto.Name,
                Phone = registerDto.Phone,
                Email = registerDto.Email,
                Password = hashedPassword,
                Avatar = registerDto.Avatar
            });

            mentorXContext.SaveChanges();
            return new UserResponseDTO
            {
                Id = entity.Entity.Id,
                Name = entity.Entity.Name,
                Phone = entity.Entity.Phone,
                Email = entity.Entity.Email,
                Avatar = entity.Entity.Avatar
            };
        }

    }
}
