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
    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpPost("appointments")]
    [Authorize]
    public async Task<ActionResult<Message>> BookAnAppointment([FromBody] BookingRequestDto dto)
    {
        var userId = User.GetUserId();
        var result = await _bookingService.BookAnAppointment(userId, dto);
        if (!result.Success)
        {
            return BadRequest(new Message(result.Message));
        }
        return Ok(result.Data);
    }
    
    [HttpGet("/mentors/me/appointments")]
    [Authorize]
    public async Task<ActionResult<List<MentorAppointmentDto>>> GetMentorAppointments([FromQuery] DateTime? date)
    {
        var mentorId = User.GetUserId();
        var result = await _bookingService.GetMentorAppointments(mentorId, date);
        if (result.Success == false) return BadRequest(new Message(result.Message));
        return Ok(result.Data);
    }

    [HttpGet("/mentees/me/appointments")]
    [Authorize]
    public async Task<ActionResult<List<MenteeAppointmentDto>>> GetMenteeAppointments([FromQuery] DateTime? date)
    {
        var menteeId = User.GetUserId();
        var result = await _bookingService.GetMenteeAppointments(menteeId, date);
        if (result.Success == false) return BadRequest(new Message(result.Message));
        return Ok(result.Data);
    }
    
}