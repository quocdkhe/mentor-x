using backend.Models.DTOs;
using backend.Models.DTOs.File;
using backend.Models.DTOs.User;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly IUserService _userService;

        public UserController(IFileService fileService, IUserService userService)
        {
            _fileService = fileService;
            _userService = userService;
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateProfileDTO dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            bool updated = await _userService.UpdateUserProfile(userId, dto);
            return updated ? Ok(new Message("Cập nhật thông tin thành công")) : BadRequest(new Message("Cập nhật thông tin thất bại"));
        }
    }
}
