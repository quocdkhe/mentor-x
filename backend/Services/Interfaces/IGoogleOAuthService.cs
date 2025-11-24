using Google.Apis.Auth;

namespace backend.Services.Interfaces
{
    public interface IGoogleOAuthService
    {
        Task<GoogleJsonWebSignature.Payload?> GetUserInfo(string token);
    }
}
