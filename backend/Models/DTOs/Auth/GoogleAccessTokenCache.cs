namespace backend.Models.DTOs.Auth;

public class GoogleAccessTokenCache
{
    public string AccessToken { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
}
