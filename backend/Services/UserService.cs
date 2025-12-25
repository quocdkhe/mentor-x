using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.User;
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

        public async Task<ServiceResult<bool>> CreateUser(AdminCreateUserDTO dto)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
            {
                return ServiceResult<bool>.Fail("Email đã tồn tại.");
            }
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Avatar = dto.Avatar,
                Role = dto.Role ?? UserRole.User,
                Password = PasswordHashing.HashPassword("123456") // Default password
            };
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true, "Tạo người dùng thành công.");
        }

        public async Task<List<UserResponseDTO>> GetAllUsers()
        {
            return await _context.Users
                .Select(u => new UserResponseDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    Phone = u.Phone,
                    Email = u.Email,
                    Avatar = u.Avatar,
                    Role = u.Role
                })
                .ToListAsync();
        }

        public async Task<ServiceResult<bool>> UpdateRole(UpdateRoleDTO dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.Id);
            if (user == null)
            {
                return ServiceResult<bool>.Fail("Người dùng không tồn tại.");
            }
            if (dto.Role != null)
            {
                user.Role = dto.Role.Value;
            }
            await _context.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true, "Cập nhật vai trò thành công.");
        }


    }
}
