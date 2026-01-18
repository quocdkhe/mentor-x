using Amazon.Runtime;
using Amazon.S3;

namespace backend.Configurations
{
    public static class StorageConfig
    {
        public static IServiceCollection AddStorageConfig(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IAmazonS3>(sp =>
            {
                var credentials = new BasicAWSCredentials(
                    configuration["S3Credential:ACCESS_KEY"],
                    configuration["S3Credential:SECRET_KEY"]);

                var config = new AmazonS3Config
                {
                    ServiceURL = configuration["S3Credential:ApiEndpoint"],
                    ForcePathStyle = true
                };
                return new AmazonS3Client(credentials, config);
            });

            return services;
        }
    }
}
