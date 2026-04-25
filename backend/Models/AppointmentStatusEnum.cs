using System.Text.Json.Serialization;

namespace backend.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AppointmentStatusEnum
{
    AwaitingPayment = 1,
    Pending = 2,
    Confirmed = 3,
    Cancelled = 4,
    Completed = 5
}