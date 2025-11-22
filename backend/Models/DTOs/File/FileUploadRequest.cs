using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.File
{
    public class FileUploadRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }

}
