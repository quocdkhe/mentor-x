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
                    ServiceURL = configuration["S3Credential:ServiceURL"], // MinIO or R2 endpoint
                    ForcePathStyle = true
                };
                return new AmazonS3Client(configuration["S3Credential:ACCESS_KEY"], configuration["S3Credential:SECRET_KEY"], config);
            });

            return services;
        }
    }
}
