using backend.Models.DTOs.User;

namespace backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<UserResponseDTO> Register(RegisterDTO userDto);
    }
}
