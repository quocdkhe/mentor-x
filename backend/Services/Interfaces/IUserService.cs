using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.User;

namespace backend.Services.Interfaces
{
    public interface IUserService
    {
        Task CreateUser(AdminCreateUserDTO dto);
        Task<List<UserResponseDTO>> GetAllUsers();
        Task UpdateRole(UpdateRoleDTO dto);
        Task<User?> GetUserByEmail(string Email);
        Task<User?> GetUserById(Guid Id);
        Task UpdateUserProfile(Guid userId, UserUpdateProfileDTO dto);
    }
}
