using backend.Models.DTOs;
using backend.Models.DTOs.User;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
                Role = currentUser.Role,
                IsGoogleAuthenticated = currentUser.GoogleAccount != null
            };
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateProfileDTO dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            await _userService.UpdateUserProfile(userId, dto);
            return Ok(new Message("Cập nhật thông tin thành công"));
        }

        [HttpPost("")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<Message>> CreateUser([FromBody] AdminCreateUserDTO dto)
        {
            await _userService.CreateUser(dto);
            return Ok(new Message("Tạo người dùng thành công"));
        }

        [HttpGet("")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<List<UserResponseDTO>>> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users);
        }

        [HttpPatch("role")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> UpdateRole([FromBody] UpdateRoleDTO dto)
        {
            await _userService.UpdateRole(dto);
            return Ok(new Message("Cập nhật vai trò thành công"));
        }


    }
}
