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
        private readonly string _publicUrl;

        public FileService(IAmazonS3 s3Client, IConfiguration configuration)
        {
            _s3Client = s3Client;
            _bucketName = configuration["S3Credential:BUCKET_NAME"]!;
            _publicUrl = configuration["S3Credential:PublicUrl"]!;
        }



        public async Task<(bool Success, string? UrlOrError)> UploadFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return (false, "No file uploaded.");

            try
            {
                // Generate unique object key
                var objectKey = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

                // Read file into a MemoryStream
                byte[] fileBytes;
                await using (var ms = new MemoryStream())
                {
                    await file.CopyToAsync(ms);
                    fileBytes = ms.ToArray();
                }

                // Build the PutObjectRequest for R2
                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = objectKey,
                    ContentType = file.ContentType,
                    InputStream = new MemoryStream(fileBytes),

                    // FROM CLOUDFARE DOCS — REQUIRED FOR R2
                    DisablePayloadSigning = true,
                    DisableDefaultChecksumValidation = true
                };

                // Upload
                await _s3Client.PutObjectAsync(request);

                // Construct public URL
                var fileUrl = _publicUrl.Contains("r2-storage")
                    ? $"{_publicUrl}/{objectKey}"
                    : $"{_publicUrl}/{_bucketName}/{objectKey}";

                return (true, fileUrl);
            }
            catch (AmazonS3Exception ex)
            {
                return (false, $"S3 error: {ex.Message}");
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
