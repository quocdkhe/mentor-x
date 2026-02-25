using backend.Models.DTOs.Mentor;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    public class StatisticController : ControllerBase
    {
        private readonly IStatisticService _statisticService;

        public StatisticController(IStatisticService statisticService)
        {
            _statisticService = statisticService;
        }

        [HttpGet("statistics/payment-status")]
        public async Task<ActionResult<List<PaymentStatusDto>>> GetAllPaymentStatus([FromQuery] Guid? mentorId)
        {
            var result = await _statisticService.GetAllPaymentStatus(mentorId);
            return Ok(result);
        }

        [HttpPatch("statistics/mark-paid/{appointmentId}")]
        public async Task<ActionResult> MarkAppointmentIsPaid(Guid appointmentId)
        {
            await _statisticService.MarkAppointmentIsPaid(appointmentId);
            return Ok();
        }
    }
}
