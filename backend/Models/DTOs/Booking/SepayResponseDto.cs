namespace backend.Models.DTOs.Booking;

using System.Text.Json.Serialization;

public class SepayResponseDto
{
    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("error")]
    public object? Error { get; set; }

    [JsonPropertyName("messages")]
    public MessageDto Messages { get; set; } = default!;

    [JsonPropertyName("transactions")]
    public List<TransactionDto> Transactions { get; set; } = new();
}

public class MessageDto
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }
}

public class TransactionDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = default!;

    [JsonPropertyName("bank_brand_name")]
    public string BankBrandName { get; set; } = default!;

    [JsonPropertyName("account_number")]
    public string AccountNumber { get; set; } = default!;

    [JsonPropertyName("transaction_date")]
    [JsonConverter(typeof(CustomDateTimeConverter))]
    public DateTime TransactionDate { get; set; }

    [JsonPropertyName("amount_out")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public decimal AmountOut { get; set; }

    [JsonPropertyName("amount_in")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public decimal AmountIn { get; set; }

    [JsonPropertyName("accumulated")]
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public decimal Accumulated { get; set; }

    [JsonPropertyName("transaction_content")]
    public string TransactionContent { get; set; } = default!;

    [JsonPropertyName("reference_number")]
    public string ReferenceNumber { get; set; } = default!;

    [JsonPropertyName("code")]
    public string? Code { get; set; }

    [JsonPropertyName("sub_account")]
    public string? SubAccount { get; set; }

    [JsonPropertyName("bank_account_id")]
    public string BankAccountId { get; set; } = default!;
}