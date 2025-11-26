using backend.Models;
using backend.Models.DTOs.User;

namespace backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<User?> GetUserByEmail(string Email);
        Task<User?> GetUserById(Guid Id);
        Task<bool> UpdateUserProfile(Guid userId, UserUpdateProfileDTO dto);
    }
}
