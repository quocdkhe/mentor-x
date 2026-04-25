using System.Text.Json.Serialization;

namespace backend.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AppointmentStatusEnum
{
    AwaitingPayment,
    Pending,
    Confirmed,
    Cancelled,
    Completed
}