using backend.Services.Interfaces;
using Google.Apis.Auth;

namespace backend.Services
{
    public class GoogleOAuthService : IGoogleOAuthService
    {
        private readonly IConfiguration _configuration;
        public GoogleOAuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<GoogleJsonWebSignature.Payload?> GetUserInfo(string token)
        {
            try
            {
                // Verify the Google token
                var payload = await GoogleJsonWebSignature.ValidateAsync(
                    token,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { _configuration["Google:ClientId"] }
                    });

                // User is authenticated with Google
                // Create your own JWT token
                return payload;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
