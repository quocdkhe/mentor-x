using backend.Models;
using backend.Models.DTOs.User;

namespace backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<User> Register(RegisterDTO userDto);
    }
}
