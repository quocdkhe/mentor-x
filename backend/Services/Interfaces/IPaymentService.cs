using backend.Models.DTOs.Booking;

namespace backend.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<bool> VerifyPayment(BookingRequestDto dto);
    }
}
