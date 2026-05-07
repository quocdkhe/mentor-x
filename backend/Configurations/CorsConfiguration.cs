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
            var origins = configuration.GetSection("CorsOrigins").Get<string[]>() ?? [];
            var wildcardPatterns = configuration.GetSection("CorsWildcardOrigins").Get<string[]>() ?? [];

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", policy =>
                {
                    policy
                        .WithOrigins(origins)
                        .SetIsOriginAllowed(origin =>
                        {
                            // Allow exact origins
                            if (origins.Contains(origin)) return true;

                            // Allow wildcard patterns (e.g. "*.vercel.app")
                            return wildcardPatterns.Any(pattern =>
                            {
                                if (!pattern.StartsWith("*.")) return false;
                                var suffix = pattern[1..]; // e.g. ".vercel.app"
                                var uri = new Uri(origin);
                                return uri.Host.EndsWith(suffix, StringComparison.OrdinalIgnoreCase);
                            });
                        })
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            return services;
        }
    }
}