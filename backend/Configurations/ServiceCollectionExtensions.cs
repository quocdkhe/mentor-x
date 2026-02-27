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
            services.AddScoped<IMentorService, MentorService>();
            services.AddScoped<IForumService, ForumService>();
            services.AddScoped<IBookingService, BookingService>();
            services.AddScoped<IGoogleCalendarService, GoogleCalendarService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<IStatisticService, StatisticService>();
            services.AddScoped<IPaymentService, PaymentService>();
            return services;
        }
    }
}
