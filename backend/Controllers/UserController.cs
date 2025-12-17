using backend.Models.DTOs;
using backend.Models.DTOs.User;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("/users")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("self")]
        [Authorize]
        public async Task<ActionResult<UserResponseDTO>> WhoAmI()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized(new Message("Không tìm thấy user id"));
            }
            var currentUser = await _userService.GetUserById(Guid.Parse(userId));
            if (currentUser == null)
            {
                return Unauthorized(new Message("Không tìm thấy người dùng"));
            }
            return new UserResponseDTO
            {
                Avatar = currentUser.Avatar,
                Email = currentUser.Email,
                Id = currentUser.Id,
                Name = currentUser.Name,
                Phone = currentUser.Phone,
                Role = currentUser.Role
            };
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
