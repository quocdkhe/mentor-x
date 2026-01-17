using backend.Models;
using backend.Services.Interfaces;
using Google.Apis.Auth;

namespace backend.Services
{
    public class GoogleOAuthService : IGoogleOAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _http;

        private readonly MentorXContext _db;
        public GoogleOAuthService(IConfiguration configuration, HttpClient http, MentorXContext db)
        {
            _configuration = configuration;
            _http = http;
            _db = db;
        }

        public async Task<GoogleTokenResponse> ExchangeCode(string code)
        {
            var data = new Dictionary<string, string>
            {
                ["client_id"] = _configuration["Google:ClientId"],
                ["client_secret"] = _configuration["Google:ClientSecret"],
                ["code"] = code,
                ["grant_type"] = "authorization_code",
                ["redirect_uri"] = "postmessage"
            };

            var res = await _http.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(data)
            );

            res.EnsureSuccessStatusCode();
            return await res.Content.ReadFromJsonAsync<GoogleTokenResponse>();
        }

        public async Task Upsert(Guid userId, string googleUserId, GoogleTokenResponse token)
        {
            var account = await _db.GoogleAccounts.FindAsync(userId);

            if (account == null)
            {
                account = new GoogleAccount
                {
                    UserId = userId,
                    GoogleUserId = googleUserId,
                    CreatedAt = DateTime.UtcNow
                };
                _db.GoogleAccounts.Add(account);
            }

            if (!string.IsNullOrEmpty(token.RefreshToken))
                account.RefreshToken = token.RefreshToken;

            account.Scope = token.Scope;
            account.TokenType = token.TokenType;
            account.RefreshTokenRevoked = false;
            account.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
        }


        public async Task<GoogleJsonWebSignature.Payload?> ValidateIdToken(string idToken)
        {
            try
            {
                return await GoogleJsonWebSignature.ValidateAsync(
                    idToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[] { _configuration["Google:ClientId"] }
                    });
            }
            catch
            {
                return null;
            }
        }

    }
}
