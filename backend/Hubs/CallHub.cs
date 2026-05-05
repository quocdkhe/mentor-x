using System.Collections.Concurrent;
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

    // Track which connections are in each room so we can detect non-empty rooms
    // and clean up on unexpected disconnects.
    private static readonly ConcurrentDictionary<string, HashSet<string>> _roomConnections = new(StringComparer.OrdinalIgnoreCase);
    private static readonly ConcurrentDictionary<string, string> _connectionRooms = new();

    public CallHub(ICallService callService)
    {
        _callService = callService;
    }

    public async Task JoinRoom(string roomId)
    {
        await EnsureParticipant(roomId);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

        var connections = _roomConnections.GetOrAdd(roomId, _ => new HashSet<string>());
        bool roomWasOccupied;
        lock (connections)
        {
            roomWasOccupied = connections.Count > 0;
            connections.Add(Context.ConnectionId);
        }
        _connectionRooms[Context.ConnectionId] = roomId;

        // Notify existing members that someone new joined.
        await Clients.OthersInGroup(roomId).SendAsync("UserJoined", Context.User?.GetUserId().ToString());

        // If someone was already in the room, also tell the new joiner so the
        // initiator (mentee) can create the offer regardless of join order.
        if (roomWasOccupied)
        {
            await Clients.Caller.SendAsync("UserJoined", Context.User?.GetUserId().ToString());
        }
    }

    public async Task LeaveRoom(string roomId)
    {
        await EnsureParticipant(roomId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        RemoveFromRoom(Context.ConnectionId, roomId);
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

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_connectionRooms.TryGetValue(Context.ConnectionId, out var roomId))
        {
            RemoveFromRoom(Context.ConnectionId, roomId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("UserLeft", Context.User?.GetUserId().ToString());
        }
        await base.OnDisconnectedAsync(exception);
    }

    private static void RemoveFromRoom(string connectionId, string roomId)
    {
        _connectionRooms.TryRemove(connectionId, out _);
        if (_roomConnections.TryGetValue(roomId, out var connections))
        {
            lock (connections)
            {
                connections.Remove(connectionId);
                if (connections.Count == 0)
                    _roomConnections.TryRemove(roomId, out _);
            }
        }
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
