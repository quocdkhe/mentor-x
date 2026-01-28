using backend.Models.DTOs;
using backend.Models.DTOs.File;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;

        public FileController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")] // Important for Swagger
        public async Task<IActionResult> UploadFile([FromForm] FileUploadRequest request)
        {
            var (success, urlOrError) = await _fileService.UploadFileAsync(request.File);

            return success
                ? Ok(new Message(urlOrError))
                : BadRequest(new Message(urlOrError));
        }

        [HttpPut("update")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateFile([FromForm] FileUploadRequest request, string fileUrl)
        {
            var (success, urlOrError) = await _fileService.UpdateFileAsync(fileUrl, request.File);

            return success
                ? Ok(new Message(urlOrError))
                : BadRequest(new Message(urlOrError));
        }
    }
}
