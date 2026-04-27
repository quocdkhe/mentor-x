namespace backend.Models.DTOs.P2P;

public class IceConfigurationResponse
{
    public List<IceServerDto> IceServers { get; set; } = new();
    public int CallTimeoutSeconds { get; set; }
    public int MaxCallDurationSeconds { get; set; }
}

public class IceServerDto
{
    public string[] Urls { get; set; } = Array.Empty<string>();
    public string? Username { get; set; }
    public string? Credential { get; set; }
}
