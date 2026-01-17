using Google.Apis.Auth;

namespace backend.Services.Interfaces
{
    public interface IGoogleOAuthService
    {
        Task<GoogleJsonWebSignature.Payload?> ValidateIdToken(string idToken);

        Task<GoogleTokenResponse> ExchangeCode(string code);

        Task Upsert(Guid userId, string googleUserId, GoogleTokenResponse token);
        
        Task<string> GetGoogleAccessToken(Guid userId);
    }

}
