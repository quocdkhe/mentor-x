using System.Text.Json.Serialization;

namespace backend.Models.DTOs.P2P;

public class InitiateCallRequest
{
    [JsonPropertyName("recipientId")]
    public Guid RecipientId { get; set; }
    
    [JsonPropertyName("appointmentId")]
    public Guid? AppointmentId { get; set; }
}
