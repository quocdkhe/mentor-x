using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.User;

namespace backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<ServiceResult<bool>> CreateUser(AdminCreateUserDTO dto);
        Task<List<UserResponseDTO>> GetAllUsers();
        Task<ServiceResult<bool>> UpdateRole(UpdateRoleDTO dto);
        Task<User?> GetUserByEmail(string Email);
        Task<User?> GetUserById(Guid Id);
        Task<bool> UpdateUserProfile(Guid userId, UserUpdateProfileDTO dto);
    }

}
