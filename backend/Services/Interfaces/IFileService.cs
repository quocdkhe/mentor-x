namespace backend.Services.Interfaces
{
    public interface IFileService
    {
        Task<(bool Success, string? UrlOrError)> UploadFileAsync(IFormFile file);
        Task<(bool Success, string? UrlOrError)> UpdateFileAsync(string fileUrl, IFormFile newFile);
    }
}
