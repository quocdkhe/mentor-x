using backend.Models;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.WebUtilities;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using backend.Models.DTOs.Booking;

namespace backend.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly MentorXContext _context;

        public PaymentService(HttpClient httpClient, IConfiguration configuration, MentorXContext context)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _context = context;
        }

        private async Task<SepayResponseDto?> GetTransactionsAsync(int amountIn)
        {
            var apiEndpoint = _configuration["Sepay:ApiEndpoint"];
            var bearerToken = _configuration["Sepay:BearerToken"];

            if (string.IsNullOrEmpty(apiEndpoint) || string.IsNullOrEmpty(bearerToken))
                throw new InvalidOperationException("Sepay configuration is missing.");

            // Build today's date range
            var today = DateTime.Today;

            var dateMin = today.ToString("yyyy-MM-dd 00:00:00");
            var dateMax = today.ToString("yyyy-MM-dd 23:59:00");

            var query = new Dictionary<string, string?>
            {
                ["transaction_date_min"] = dateMin,
                ["transaction_date_max"] = dateMax,
                ["amount_in"] = amountIn.ToString()
            };

            var uri = QueryHelpers.AddQueryString(apiEndpoint, query);

            using var request = new HttpRequestMessage(HttpMethod.Get, uri);

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", bearerToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            return JsonSerializer.Deserialize<SepayResponseDto>(json, options);
        }

        public async Task<bool> VerifyPayment(Guid appointmentId)
        {
            // Skip API call in development environment
            var environment = _configuration["ASPNETCORE_ENVIRONMENT"];
            if (environment == "Development")
            {
                return true;
            }

            var appointment = await _context.Appointments
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);
            if (appointment == null || appointment.Payment?.PaymentCode == null)
            {
                return false;
            }

            var mentor = await _context.MentorProfiles
                .FirstOrDefaultAsync(mp => mp.UserId == appointment.MentorId);
            if (mentor == null)
            {
                return false;
            }

            decimal pricePerHour = mentor.PricePerHour;
            TimeSpan duration = appointment.EndAt - appointment.StartAt;
            decimal totalHours = (decimal)duration.TotalHours;
            totalHours = Math.Round(totalHours, 2);

            int totalPrice = decimal.ToInt32(totalHours * pricePerHour);
            var sepayResponse = await GetTransactionsAsync(totalPrice);

            return sepayResponse?.Transactions.Any(tran =>
                !string.IsNullOrWhiteSpace(tran.TransactionContent) &&
                tran.TransactionContent.Contains(appointment.Payment.PaymentCode, StringComparison.OrdinalIgnoreCase)
            ) == true;
        }
    }
}
