using backend.Models.DTOs;
using backend.Models.DTOs.User;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDTO>> Register([FromBody] RegisterDTO registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _authService.checkExistsByEmail(registerDto.Email))
            {
                return BadRequest(new ErrorMessage("Email đã tồn tại, vui lòng nhập email khác"));
            }

            var result = await _authService.Register(registerDto);

            if (result == null)
                return BadRequest(new ErrorMessage("Đăng kí thất bại, có lỗi xảy ra"));

            return Ok(result);
        }
    }
}
