using backend.Services; 
using backend.Services.Interfaces;

namespace backend.Configurations
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddProjectServices(this IServiceCollection services)
        {
            // Depedency Injection for Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRefreshTokenService, RefreshTokenService>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IGoogleOAuthService, GoogleOAuthService>();
            services.AddScoped<IForumService, ForumService>();
            return services;
        }
    }
}
