using backend.Models.DTOs.User;
using Microsoft.AspNetCore.Mvc;

namespace backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<UserResponseDTO> Register(RegisterDTO userDto);

        Task<bool> checkExistsByEmail(string Email);
    }
}
