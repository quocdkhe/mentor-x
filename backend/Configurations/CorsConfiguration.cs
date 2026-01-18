using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace backend.Configurations
{
    public static class CorsConfiguration
    {
        public static IServiceCollection AddCorsConfig(this IServiceCollection services, IConfiguration configuration)
        {
            // Cors configuration
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:5173", "http://localhost:4173", "https://mentor-x-gamma.vercel.app", "https://mentor-x.quocdk.id.vn") // your frontend URL
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials(); // allow cookies
                });
            });
            return services;
        }
    }
}
