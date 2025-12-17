using System.Text.Json.Serialization;

namespace backend.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserRole
{
    Admin,
    Mentor,
    User 
}