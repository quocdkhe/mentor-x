using backend.Models;
using backend.Models.DTOs.Auth;
using backend.Services.Interfaces;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace backend.Services
{
    public class GoogleOAuthService : IGoogleOAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _http;
        private readonly MentorXContext _db;
        private readonly IMemoryCache _cache;
        
        public GoogleOAuthService(IConfiguration configuration, HttpClient http, MentorXContext db,
            IMemoryCache cache)
        {
            _cache = cache;
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
        
        private async Task<GoogleTokenResponse> RefreshAccessTokenAsync(string refreshToken)
        {
            var response = await _http.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["client_id"] = _configuration["Google:ClientId"],
                    ["client_secret"] = _configuration["Google:ClientSecret"],
                    ["refresh_token"] = refreshToken,
                    ["grant_type"] = "refresh_token"
                })
            );
            
            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Google token error: {response.StatusCode} - {raw}");
            }

            response.EnsureSuccessStatusCode();

            return JsonSerializer.Deserialize<GoogleTokenResponse>(
                await response.Content.ReadAsStringAsync()
            )!;
        }

        public async Task<string> GetGoogleAccessToken(Guid userId)
        {
            var cacheKey = $"google:access_token:{userId}";

            // 1. Try cache
            if (_cache.TryGetValue(cacheKey, out GoogleAccessTokenCache cached))
                return cached.AccessToken;

            // 2. Load refresh token
            var googleAccount = await _db.GoogleAccounts
                                    .SingleOrDefaultAsync(x => x.UserId == userId)
                                ?? throw new Exception("User chưa liên kết Google");

            // 3. Refresh access token from Google
            var token = await RefreshAccessTokenAsync(googleAccount.RefreshToken);

            // 4. Cache using EXACT expiry from Google
            var expiresAtUtc = DateTime.UtcNow.AddSeconds(token.ExpiresIn);
            var ttl = TimeSpan.FromSeconds(token.ExpiresIn);

            _cache.Set(
                cacheKey,
                new GoogleAccessTokenCache
                {
                    AccessToken = token.AccessToken,
                    ExpiresAtUtc = expiresAtUtc
                },
                ttl
            );

            return token.AccessToken;
        }


    }
}
