using backend.Models.DTOs;
using backend.Models.DTOs.Booking;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public class BookingController : ControllerBase
{

    private readonly IBookingService _bookingService;
    private readonly IPaymentService _paymentService;
    public BookingController(IBookingService bookingService, IPaymentService paymentService)
    {
        _bookingService = bookingService;
        _paymentService = paymentService;
    }

    [HttpPost("appointments")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<Message>> BookAnAppointment([FromBody] BookingRequestDto dto)
    {
        var userId = User.GetUserId();

        var isPaid = await _paymentService.VerifyPayment(dto);
        if (!isPaid)
        {
            return BadRequest(new Message("Vui lòng hãy thanh toán. Nếu bạn đã thanh toán, hãy liên hệ Admin để " +
                                          "được trợ giúp"));
        }
        var result = await _bookingService.BookAnAppointment(userId, dto);
        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }
        return Ok(result.Data);
    }

    [HttpGet("/mentors/me/appointments")]
    [Authorize(Roles = Roles.Mentor)]
    public async Task<ActionResult<List<MentorAppointmentDto>>> GetMentorAppointments([FromQuery] DateTime? date)
    {
        var mentorId = User.GetUserId();
        var result = await _bookingService.GetMentorAppointments(mentorId, date);
        if (result.Success == false) return BadRequest(new Message(result.Message));
        return Ok(result.Data);
    }

    [HttpGet("/mentees/me/appointments")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<List<MenteeAppointmentDto>>> GetMenteeAppointments([FromQuery] DateTime? date)
    {
        var menteeId = User.GetUserId();
        var result = await _bookingService.GetMenteeAppointments(menteeId, date);
        if (result.Success == false) return BadRequest(new Message(result.Message));
        return Ok(result.Data);
    }

    [HttpGet("/mentors/{mentorId}/schedules")]
    public async Task<ActionResult<MentorScheduleDto>> GetMentorSchedules(Guid mentorId, [FromQuery] DateTime? date)
    {
        var result = await _bookingService.GetMentorSchedule(mentorId, date);
        if (result.Success == false) return BadRequest(new Message(result.Message));
        return Ok(result.Data);
    }

    [HttpPost("appointments/{appointmentId}/accept")]
    [Authorize(Roles = Roles.Mentor)]
    public async Task<ActionResult<Message>> AcceptAppointment(Guid appointmentId)
    {
        var mentorId = User.GetUserId();
        var result = await _bookingService.AcceptAppointment(mentorId, appointmentId);
        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }
        return Ok(result.Data);
    }

    [HttpPost("appointments/{appointmentId}/cancel")]
    [Authorize]
    public async Task<ActionResult<Message>> CancelAppointment(Guid appointmentId)
    {
        var userId = User.GetUserId();
        var result = await _bookingService.CancelAppointment(userId, appointmentId);
        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }
        return Ok(result.Data);
    }

    [HttpPost("appointments/{appointmentId}/complete")]
    [Authorize(Roles = Roles.Mentor)]
    public async Task<ActionResult<Message>> CompleteAppointment(Guid appointmentId)
    {
        var mentorId = User.GetUserId();
        var result = await _bookingService.CompleteAppointment(mentorId, appointmentId);
        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }
        return Ok(result.Data);
    }

    [HttpDelete("appointments/{appointmentId}")]
    [Authorize(Roles = Roles.User)]
    public async Task<ActionResult<Message>> DeleteAppointment(Guid appointmentId)
    {
        var menteeId = User.GetUserId();
        var result = await _bookingService.DeleteAppointment(menteeId, appointmentId);
        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }
        return Ok(result.Data);
    }
}