namespace backend.Models;

public class GoogleAccount
{
    public Guid UserId { get; set; }          // PK + FK -> Users
    public string GoogleUserId { get; set; }  // sub
    public string? RefreshToken { get; set; } // encrypted
    public string Scope { get; set; }
    public string TokenType { get; set; }
    public bool RefreshTokenRevoked { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; }
}
