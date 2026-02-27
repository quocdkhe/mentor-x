using backend.Models.DTOs.Booking;

namespace backend.Services.Interfaces
{
    public interface IPaymentService
    {
        Task VerifyPayment(BookingRequestDto dto);
    }
}
