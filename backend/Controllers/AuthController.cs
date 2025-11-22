using backend.Models;
using backend.Models.DTOs;
using backend.Models.DTOs.User;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        private readonly IRefreshTokenService _refreshTokenService;

        private readonly CookieOptions ACCESS_TOKEN_OPTION = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddMinutes(15)
        };

        private readonly CookieOptions REFRESH_TOKEN_OPTION = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        public AuthController(IAuthService authService, IUserService userService, ITokenService tokenService, IRefreshTokenService refreshTokenService)
        {
            _authService = authService;
            _userService = userService;
            _tokenService = tokenService;
            _refreshTokenService = refreshTokenService;
        }

        private void SetTokenCookies(string accessToken, string refreshToken)
        {
            Response.Cookies.Append("access_token", accessToken, ACCESS_TOKEN_OPTION);
            Response.Cookies.Append("refresh_token", refreshToken, REFRESH_TOKEN_OPTION);
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDTO>> Register([FromBody] RegisterDTO registerDto)
        {
            if (await _userService.GetUserByEmail(registerDto.Email) != null)
            {
                return BadRequest(new Message("Email đã tồn tại, vui lòng nhập email khác"));
            }

            var result = await _authService.Register(registerDto);

            if (result == null)
                return BadRequest(new Message("Đăng kí thất bại, có lỗi xảy ra"));

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserResponseDTO>> Login([FromBody] LoginDTO loginDto)
        {
            // 1. Find user by email
            var currentUser = await _userService.GetUserByEmail(loginDto.Email);
            // 2. Verify
            if (currentUser == null || !Utils.PasswordHashing.VerifyPassword(loginDto.Password, currentUser.Password))
            {
                return BadRequest(new Message("Thông tin tài khoản không hợp lệ"));
            }

            // 3. Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(currentUser);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // 4. Save refresh token to database
            await _refreshTokenService.SaveRefreshToken(currentUser.Id, refreshToken);

            // 5. Set HTTP-only cookies
            SetTokenCookies(accessToken, refreshToken);

            return Ok(new UserResponseDTO
            {
                Id = currentUser.Id,
                Name = currentUser.Name,
                Phone = currentUser.Phone,
                Email = currentUser.Email,
                Avatar = currentUser.Avatar,
                Role = currentUser.Role
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            // 1. Get refresh token from cookie
            var refreshToken = Request.Cookies["refresh_token"];

            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new Message("Refresh token not found"));

            // 2. Validate refresh token from database
            var storedToken = await _refreshTokenService.GetValidRefreshToken(refreshToken);

            if (storedToken == null)
            {
                return Unauthorized(new Message("Invalid or expired refresh token"));
            }

            // 3. Get user from database
            var currentUser = await _userService.GetUserById(storedToken.UserId);

            if (currentUser == null)
            {
                return Unauthorized(new Message("User not found"));
            }

            // 4. Generate new tokens
            var newAccessToken = _tokenService.GenerateAccessToken(currentUser);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // 5. Revoke old refresh token and save new one
            await _refreshTokenService.RevokeToken(storedToken.Id);
            await _refreshTokenService.SaveRefreshToken(currentUser.Id, newRefreshToken);

            // 6. Set new cookies
            SetTokenCookies(newAccessToken, newRefreshToken);

            return Ok(new { message = "Tokens refreshed successfully" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // 1. Get refresh token from cookie
            var refreshToken = Request.Cookies["refresh_token"];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                // 2. Validate refresh token from database
                var storedToken = await _refreshTokenService.GetValidRefreshToken(refreshToken);
                if (storedToken != null)
                {
                    // 3. Revoke the refresh token
                    await _refreshTokenService.RevokeToken(storedToken.Id);
                }
            }
            // 4. Remove cookies
            Response.Cookies.Delete("access_token", ACCESS_TOKEN_OPTION);
            Response.Cookies.Delete("refresh_token", REFRESH_TOKEN_OPTION);
            return Ok(new Message("Đăng xuất thành công"));
        }

        [HttpGet("self")]
        [Authorize]
        public async Task<ActionResult<UserResponseDTO>> WhoAmI()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(userId == null)
            {
                return Unauthorized(new Message("Không tìm thấy user id"));
            }
            var currentUser = await _userService.GetUserById(Guid.Parse(userId));
            if(currentUser == null)
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
    }
}
