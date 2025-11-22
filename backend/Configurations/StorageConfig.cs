using Amazon.S3;

namespace backend.Configurations
{
    public static class StorageConfig
    {
        public static IServiceCollection AddStorageConfig(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IAmazonS3>(sp =>
            {
                var config = new AmazonS3Config
                {
                    ServiceURL = "https://storage.quocdk.id.vn", // MinIO or R2 endpoint
                    ForcePathStyle = true
                };
                return new AmazonS3Client("ACCESS_KEY", "SECRET_KEY", config);
            });

            return services;
        }
    }
}
