using backend.Middleware.Exceptions;
using backend.Services.Interfaces;
using backend.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

[Authorize]
public class CallHub : Hub
{
    private readonly ICallService _callService;

    public CallHub(ICallService callService)
    {
        _callService = callService;
    }

    public async Task JoinRoom(string roomId)
    {
        await EnsureParticipant(roomId);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.OthersInGroup(roomId).SendAsync("UserJoined", Context.User?.GetUserId().ToString());
    }

    public async Task LeaveRoom(string roomId)
    {
        await EnsureParticipant(roomId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("UserLeft", Context.User?.GetUserId().ToString());
    }

    public async Task SendOffer(string roomId, string sdp)
    {
        await EnsureParticipant(roomId);
        await Clients.OthersInGroup(roomId).SendAsync("ReceiveOffer", sdp);
    }

    public async Task SendAnswer(string roomId, string sdp)
    {
        await EnsureParticipant(roomId);
        await Clients.OthersInGroup(roomId).SendAsync("ReceiveAnswer", sdp);
    }

    public async Task SendIceCandidate(string roomId, string candidate)
    {
        await EnsureParticipant(roomId);
        await Clients.OthersInGroup(roomId).SendAsync("ReceiveIceCandidate", candidate);
    }

    private async Task EnsureParticipant(string roomId)
    {
        try
        {
            var userId = Context.User?.GetUserId().ToString()
                ?? throw new UnauthorizedException("Unauthorized");

            await _callService.ValidateParticipant(roomId, userId);
        }
        catch (Exception ex) when (
            ex is BadRequestException ||
            ex is ForbiddenException ||
            ex is NotFoundException ||
            ex is UnauthorizedException)
        {
            throw new HubException(ex.Message);
        }
    }
}
