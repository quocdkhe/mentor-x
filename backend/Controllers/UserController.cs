using backend.Models.DTOs;
using backend.Models.DTOs.File;
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

        // [HttpPut("avatar")]
        // [Consumes("multipart/form-data")] 
        // [Authorize]
        // public async Task<ActionResult> UploadFile([FromForm] FileUploadRequest request)
        // {
        //     var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        //     Guid userId = Guid.TryParse(userIdString, out var parsedGuid) ? parsedGuid : Guid.Empty;
        //     if (userId == Guid.Empty)
        //     {
        //         return Unauthorized(new Message("Không tìm thấy user id"));
        //     }
        //     var (success, urlOrError) = await _fileService.UploadFileAsync(request.File);
        //     if (success)
        //     {
        //         await _userService.UpdateUserAvatar(userId, urlOrError);
        //         return Ok(new Message(urlOrError));
        //     }
        //     return BadRequest(new Message(urlOrError));
        // }
    }
}
