using backend.Models;
using backend.Services;  // your namespaces
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddProjectServices(this IServiceCollection services, IConfiguration config)
        {
            // Cors configuration
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", builder =>
                {
                    builder
                        .WithOrigins("http://localhost:5173") // your frontend URL
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials(); // allow cookies
                });
            });

            // Add DB context
            services.AddDbContext<MentorXContext>(options =>
                options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

            // Depedency Injection for Services
            services.AddScoped<IAuthService, AuthService>();


            return services;
        }
    }
}
