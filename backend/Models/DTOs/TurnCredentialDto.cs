namespace backend.Models.DTOs;

public class TurnCredentialDto
{
    public string RoomId { get; set; } = null!;
    public string TurnHost { get; set; } = null!;
    public int TurnPort { get; set; }
    public string TurnUsername { get; set; } = null!;
    public string TurnCredential { get; set; } = null!;
    public DateTimeOffset ExpiresAt { get; set; }
}
