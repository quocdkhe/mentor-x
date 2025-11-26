using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class FileService : IFileService
    {

        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly string _baseUrl;

        public FileService(IAmazonS3 s3Client, IConfiguration configuration)
        {
            _s3Client = s3Client;
            _bucketName = configuration["S3Credential:BUCKET_NAME"]!;
            _baseUrl = configuration["S3Credential:ServiceURL"]!;
        }

        public async Task<(bool Success, string? UrlOrError)> UploadFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return (false, "No file uploaded.");

            try
            {
                var objectKey = Guid.NewGuid() + Path.GetExtension(file.FileName);

                using var stream = file.OpenReadStream();
                var uploadRequest = new TransferUtilityUploadRequest
                {
                    InputStream = stream,
                    Key = objectKey,
                    BucketName = _bucketName,
                    ContentType = file.ContentType
                };

                var transferUtility = new TransferUtility(_s3Client);
                await transferUtility.UploadAsync(uploadRequest);

                var fileUrl = $"{_baseUrl}/{_bucketName}/{objectKey}";
                return (true, fileUrl);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }

        public async Task<(bool Success, string? UrlOrError)> UpdateFileAsync(string fileUrl, IFormFile newFile)
        {
            try
            {
                // Step 1: Delete the old file
                string fileName = fileUrl.Split('/').Last();
                var deleteReq = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = fileName
                };

                await _s3Client.DeleteObjectAsync(deleteReq);

                // Step 2: Upload the new file
                return await UploadFileAsync(newFile);
            }
            catch (Exception ex)
            {
                return (false, ex.Message);
            }
        }
    }
}
