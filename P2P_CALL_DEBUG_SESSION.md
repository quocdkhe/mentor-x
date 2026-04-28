# P2P Call Feature - Debug Session Summary
 
## Session Date: 2026-04-27
## Status: IN PROGRESS - SignalR Connection Issue
 
---
 
## 1. FEATURE OVERVIEW
 
Implemented a P2P video call feature using:
- **Backend**: ASP.NET Core 9.0 + SignalR for signaling + PostgreSQL for call persistence
- **Frontend**: React + TypeScript + WebRTC API
- **TURN Server**: coturn (turn:quocdk.id.vn:3478)
 
### Key Components
- `/backend/Hubs/CallSignalingHub.cs` - SignalR hub for call signaling
- `/backend/Services/CallService.cs` - Business logic for call management
- `/backend/Controllers/CallController.cs` - REST API for call operations
- `/frontend/src/components/features/call/CallManager.tsx` - Main call UI component
- `/frontend/src/hooks/useWebRTC.ts` - WebRTC peer connection management
- `/frontend/src/hooks/useCallSignaling.ts` - SignalR connection management
 
---
 
## 2. FILES MODIFIED IN THIS SESSION
 
### Backend
 
1. **`/backend/Hubs/CallSignalingHub.cs`**
   - Fixed `InitiateCall` method to properly parse GUIDs
   - Changed `Context.User?.Identity?.Name` to `Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)`
   - Fixed `OnConnectedAsync` and `OnDisconnectedAsync` to use proper user ID claim
   - Added null/empty validation for recipientId and bookingId
 
2. **`/backend/Services/CallService.cs`**
   - Added auto-cleanup for stale calls (> 5 minutes in Pending/Ringing status)
   - Fixed `InitiateCallAsync` to clean up stale calls before checking for active calls
 
3. **`/backend/Services/TokenService.cs`**
   - Added `JwtRegisteredClaimNames.Sub` claim with user ID
   - Ensured `ClaimTypes.NameIdentifier` contains user ID (not username)
 
4. **`/backend/Configurations/JwtConfiguration.cs`**
   - Added `NameClaimType = ClaimTypes.NameIdentifier` to properly map user ID from JWT
 
5. **`/backend/Controllers/CallController.cs`**
   - Added `GetIceConfiguration` endpoint to serve TURN/STUN server config
   - Fixed API routes to include `/api` prefix
 
6. **`/backend/Models/DTOs/P2P/InitiateCallRequest.cs`**
   - Added `[JsonPropertyName]` attributes for camelCase JSON mapping
 
7. **`/backend/Models/DTOs/Booking/MentorAppointmentDto.cs`**
   - Added `MenteeId` property to support call initiation
 
### Frontend
 
8. **`/frontend/src/components/features/call/CallManager.tsx`**
   - Added SignalR connection check before initiating calls
   - Added auto-connect logic if connection is not established
   - Fixed call initiation flow
 
9. **`/frontend/src/api/call.ts`**
   - Fixed API paths to include `/api` prefix
 
10. **`/frontend/src/pages/mentor/schedules.tsx`**
    - Integrated `CallManager` component
    - Added "Start Call" button for confirmed appointments
 
11. **`/frontend/src/pages/user/schedules.tsx`**
    - Integrated `CallManager` component
    - Added "Start Call" button for confirmed appointments
 
12. **`/frontend/src/types/appointment.ts`**
    - Added `menteeId` to `MentorAppointmentDto` type
 
---
 
## 3. PROBLEMS ENCOUNTERED & FIXES APPLIED
 
### Problem 1: 404 Not Found on API Calls
**Status**: ✅ FIXED
**Cause**: Frontend API calls were missing `/api` prefix
**Fix**: Updated all paths in `/frontend/src/api/call.ts` to include `/api`
 
### Problem 2: "You are already in a call" Error (Stale Calls)
**Status**: ✅ FIXED
**Cause**: Database had stale calls in Pending/Ringing status that weren't cleaned up
**Fix**: 
- Added auto-cleanup logic in `CallService.InitiateCallAsync()`
- Calls older than 5 minutes in Pending/Ringing status are auto-marked as Ended
 
### Problem 3: SignalR "Unrecognized Guid format" Error
**Status**: ✅ FIXED
**Cause**: `Context.User?.Identity?.Name` returns username, not user ID
**Fix**: 
- Changed all hub methods to use `Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)`
- Updated `OnConnectedAsync` and `OnDisconnectedAsync` to use proper claim
- Fixed JWT configuration to map `NameIdentifier` correctly
 
### Problem 4: "Recipient is not available" Error
**Status**: 🔴 CURRENT ISSUE
**Cause**: SignalR connection lookup fails - recipient user ID not found in `UserConnections` dictionary
**Diagnosis**:
- Both users (mentor and mentee) are connecting to SignalR
- Backend logs show: `User {guid} connected with connection {id}`
- However, when initiating call, the recipient lookup fails
- Possible causes:
  1. Timing issue - recipient connected after lookup
  2. User ID mismatch between JWT claim and database
  3. `UserConnections` dictionary not properly storing/retrieving entries
  4. Connection lost and not reconnected before call initiation
 
**Debug Steps Needed**:
1. Add logging to `CallSignalingHub.InitiateCall` to log:
   - Contents of `UserConnections` dictionary
   - The exact recipientId being looked up
   - Connection state of both users
2. Verify that mentee and mentor user IDs in JWT match database IDs exactly
3. Check if both users have active WebSocket connections before call initiation
 
---
 
## 4. CURRENT TESTING SETUP
 
### Required Environment
- Backend running on `http://localhost:4000`
- Frontend running on `http://localhost:5173`
- PostgreSQL database with `calls` and `call_logs` tables
- TURN server configured in `appsettings.json` or using defaults
 
### Testing Steps
1. **Start Backend**: `cd /run/media/quocdk/Shit/mentor-x/backend && dotnet run`
2. **Start Frontend**: `cd /run/media/quocdk/Shit/mentor-x/frontend && npm run dev`
3. **Open Two Browsers**:
   - Browser 1: Login as **Mentor** → Navigate to `/mentor/schedules`
   - Browser 2: Login as **Mentee** → Navigate to `/user/schedules`
4. **Verify Connections**:
   - Check backend logs for both "User {guid} connected" messages
   - Check browser consoles for "WebSocket connected" messages
5. **Initiate Call**: Click "Start Call" button from one user's schedule page
 
### Expected Behavior (When Working)
1. Caller clicks "Start Call" → Call state: `calling`
2. SignalR sends `CallIncoming` to recipient
3. Recipient sees incoming call dialog
4. Recipient accepts → WebRTC offer/answer exchange
5. Both users see video streams
6. Call state: `connected`
 
---
 
## 5. PENDING ISSUES TO FIX
 
### High Priority
1. **Fix "Recipient is not available" Error**
   - Root cause: SignalR user lookup failing
   - Suggested fix: Add debug logging and verify UserConnections dictionary logic
 
2. **Add Connection State Recovery**
   - Handle case where recipient reconnects during call initiation
   - Add retry logic for SignalR message delivery
 
### Medium Priority
3. **Fix End Call API for Pending Status**
   - Currently returns 400 "Cannot end call in Pending status"
   - Should allow ending/canceling calls in any status
 
4. **Improve Error Handling**
   - Better error messages for network failures
   - Toast notifications for call state changes
 
5. **Add Call Timeout**
   - Auto-end calls stuck in Pending/Ringing status after timeout
 
### Low Priority
6. **TURN Server Testing**
   - Test from different networks (not same LAN)
   - Verify TURN relay works when direct P2P fails
 
---
 
## 6. KEY CODE SNIPPETS
 
### SignalR Hub Connection (Frontend)
```typescript
// useCallSignaling.ts
const signaling = useCallSignaling({
  hubUrl: `${apiUrl}/hubs/call-signaling`,
  accessToken,
  onIncomingCall: (call) => { /* handle incoming */ },
  onCallAccepted: (callId) => { /* handle accepted */ },
  onCallRejected: (callId, reason) => { /* handle rejected */ },
  onCallError: (callId, error) => { /* handle error */ },
});
```
 
### WebRTC Initialization (Frontend)
```typescript
// CallManager.tsx
const initiateCall = async (recipientId: string, bookingId?: string) => {
  // Ensure SignalR is connected
  if (signaling.connectionState !== 'connected') {
    await signaling.connect();
  }
 
  // Get local stream
  await getLocalStream();
 
  // Initialize WebRTC
  await initializeConnection();
 
  // Create call via API
  const call = await callApi.initiateCall({ recipientId, appointmentId: bookingId });
 
  // Send SignalR initiate
  await signaling.initiateCall(recipientId, bookingId);
};
```
 
### User Connection Tracking (Backend)
```csharp
// CallSignalingHub.cs
private static readonly ConcurrentDictionary<string, string> UserConnections = new();
 
public override async Task OnConnectedAsync()
{
    var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!string.IsNullOrEmpty(userId))
    {
        UserConnections[userId] = Context.ConnectionId;
    }
    await base.OnConnectedAsync();
}
```
 
---
 
## 7. DATABASE SCHEMA
 
### Calls Table
```sql
CREATE TABLE calls (
    id UUID PRIMARY KEY,
    initiator_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id),
    status VARCHAR(20) NOT NULL, -- Pending, Ringing, Connected, Ended, Missed, Rejected
    created_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    end_reason VARCHAR(50),
    error_message TEXT
);
```
 
### Call Logs Table
```sql
CREATE TABLE call_logs (
    id UUID PRIMARY KEY,
    call_id UUID NOT NULL REFERENCES calls(id),
    user_id UUID NOT NULL REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    details TEXT
);
```
 
---
 
## 8. RELATED DOCUMENTATION
 
- **SignalR Documentation**: https://docs.microsoft.com/en-us/aspnet/core/signalr
- **WebRTC Documentation**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **TURN Server Setup**: See `/backend/TURN_SERVER_CONFIG.md`
- **Implementation Plan**: See `/backend/P2P_CALL_IMPLEMENTATION_PLAN.md`
 
---
 
## 9. CONTACT & CONTEXT
 
**Original Developer**: User implementing Mentor-X platform
**Debug Session**: 2026-04-27
**Next Steps**: Fix "Recipient is not available" SignalR lookup issue
 
**Key Files for Next Agent**:
1. `/backend/Hubs/CallSignalingHub.cs` - Check `UserConnections` dictionary logic
2. `/backend/Services/CallService.cs` - Verify call initiation logic
3. `/frontend/src/hooks/useCallSignaling.ts` - Check SignalR connection handling
4. `/frontend/src/components/features/call/CallManager.tsx` - Verify call flow
 
---
 
## 10. QUICK DEBUG COMMANDS
 
### Check Active Calls in Database
```sql
SELECT id, initiator_id, recipient_id, status, created_at, ended_at 
FROM calls 
WHERE status IN ('Pending', 'Ringing', 'Connected')
ORDER BY created_at DESC;
```
 
### Clear All Pending Calls
```sql
UPDATE calls 
SET status = 'Ended', end_reason = 'SystemCleanup', ended_at = NOW()
WHERE status IN ('Pending', 'Ringing');
```
 
### View Call Logs
```sql
SELECT * FROM call_logs 
WHERE call_id = 'your-call-id-here'
ORDER BY timestamp DESC;
```
 
---
 
**END OF DOCUMENT**