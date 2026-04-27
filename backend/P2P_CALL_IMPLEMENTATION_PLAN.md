# P2P Call Feature - Detailed Implementation Plan

## Overview
Implement real-time peer-to-peer video/audio calling between mentors and mentees using WebRTC with SignalR signaling and TURN server fallback.

---

## Phase 1: Backend Infrastructure

### 1.1 Database Models & Migrations

**Location:** `Models/Call.cs`, `Models/CallParticipant.cs`

```csharp
public class Call
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InitiatorId { get; set; }
    public User Initiator { get; set; }
    
    public Guid RecipientId { get; set; }
    public User Recipient { get; set; }
    
    public Guid? BookingId { get; set; }
    public Booking Booking { get; set; }
    
    public CallStatus Status { get; set; } = CallStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
    
    public CallEndReason? EndReason { get; set; }
    public string? ErrorMessage { get; set; }
}

public enum CallStatus
{
    Pending,      // Waiting for recipient to accept
    Ringing,      // Recipient notified, awaiting response
    Connected,    // Both parties connected
    Ended,        // Call completed normally
    Failed,       // Call failed to establish
    Rejected,     // Recipient rejected
    Missed        // Recipient didn't respond
}

public enum CallEndReason
{
    UserInitiated,
    NetworkFailure,
    Timeout,
    Error
}

public class CallLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CallId { get; set; }
    public Call Call { get; set; }
    
    public Guid UserId { get; set; }
    public User User { get; set; }
    
    public string EventType { get; set; } // "offer_sent", "answer_received", "ice_candidate", "connection_established", etc.
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Details { get; set; } // JSON for additional data
}
```

**Tasks:**
- [ ] Create migration: `Add_Call_And_CallLog_Tables`
- [ ] Add DbSet properties to ApplicationDbContext
- [ ] Add navigation properties to User model

### 1.2 SignalR Hub for Signaling

**Location:** `Hubs/CallSignalingHub.cs`

**Responsibilities:**
- Manage WebRTC signaling (offer, answer, ICE candidates)
- Track active connections and user presence
- Handle call state transitions
- Broadcast call events to relevant parties

**Key Methods:**
```csharp
public class CallSignalingHub : Hub
{
    // Initiator sends call request
    public async Task InitiateCall(string recipientId, string bookingId = null)
    
    // Recipient accepts call
    public async Task AcceptCall(string callId)
    
    // Recipient rejects call
    public async Task RejectCall(string callId, string reason = null)
    
    // Exchange WebRTC offer
    public async Task SendOffer(string callId, string sdpOffer)
    
    // Exchange WebRTC answer
    public async Task SendAnswer(string callId, string sdpAnswer)
    
    // Exchange ICE candidates
    public async Task SendIceCandidate(string callId, string candidate, int sdpMLineIndex, string sdpMid)
    
    // End call
    public async Task EndCall(string callId, string reason = null)
    
    // Heartbeat to keep connection alive
    public async Task Ping()
}
```

**Client Events (sent to clients):**
- `CallIncoming(callId, initiatorId, initiatorName, bookingId)`
- `CallAccepted(callId)`
- `CallRejected(callId, reason)`
- `OfferReceived(callId, sdpOffer)`
- `AnswerReceived(callId, sdpAnswer)`
- `IceCandidateReceived(callId, candidate, sdpMLineIndex, sdpMid)`
- `CallEnded(callId, reason)`
- `CallError(callId, errorMessage)`

**Tasks:**
- [ ] Create CallSignalingHub class
- [ ] Implement connection tracking (userId -> connectionId mapping)
- [ ] Implement call state machine
- [ ] Add logging for all signaling events
- [ ] Handle disconnections and cleanup

### 1.3 Call Service

**Location:** `Services/ICallService.cs`, `Services/CallService.cs`

**Responsibilities:**
- Business logic for call management
- Database operations
- Call state validation
- Integration with booking system

**Key Methods:**
```csharp
public interface ICallService
{
    Task<Call> InitiateCallAsync(Guid initiatorId, Guid recipientId, Guid? bookingId = null);
    Task<Call> GetCallAsync(Guid callId);
    Task<Call> AcceptCallAsync(Guid callId);
    Task<Call> RejectCallAsync(Guid callId, string reason = null);
    Task<Call> EndCallAsync(Guid callId, string reason = null);
    Task<Call> MarkCallConnectedAsync(Guid callId);
    Task<Call> MarkCallFailedAsync(Guid callId, string errorMessage);
    
    Task<IEnumerable<Call>> GetCallHistoryAsync(Guid userId, int limit = 50);
    Task<CallStatistics> GetCallStatisticsAsync(Guid userId);
    
    Task LogCallEventAsync(Guid callId, Guid userId, string eventType, string details = null);
    Task<bool> IsUserAvailableAsync(Guid userId);
}
```

**Tasks:**
- [ ] Create ICallService interface
- [ ] Implement CallService with database operations
- [ ] Add validation for call state transitions
- [ ] Add error handling and logging
- [ ] Create unit tests

### 1.4 Call Controller

**Location:** `Controllers/CallController.cs`

**Endpoints:**

```
POST   /api/calls/initiate              - Initiate a call
GET    /api/calls/{callId}              - Get call details
POST   /api/calls/{callId}/accept       - Accept incoming call
POST   /api/calls/{callId}/reject       - Reject incoming call
POST   /api/calls/{callId}/end          - End active call
GET    /api/calls/history               - Get call history
GET    /api/calls/statistics            - Get call statistics
GET    /api/calls/active                - Get active calls for user
```

**Request/Response DTOs:**
```csharp
public class InitiateCallRequest
{
    public Guid RecipientId { get; set; }
    public Guid? BookingId { get; set; }
}

public class CallDto
{
    public Guid Id { get; set; }
    public Guid InitiatorId { get; set; }
    public string InitiatorName { get; set; }
    public Guid RecipientId { get; set; }
    public string RecipientName { get; set; }
    public CallStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
}

public class CallStatistics
{
    public int TotalCalls { get; set; }
    public int CompletedCalls { get; set; }
    public int MissedCalls { get; set; }
    public int RejectedCalls { get; set; }
    public double AverageDurationSeconds { get; set; }
    public double SuccessRate { get; set; }
}
```

**Tasks:**
- [ ] Create CallController with all endpoints
- [ ] Add authorization checks (JWT)
- [ ] Add input validation
- [ ] Add error handling
- [ ] Create integration tests

### 1.5 Configuration & Dependency Injection

**Location:** `Configurations/CallServiceConfiguration.cs`

**Tasks:**
- [ ] Register ICallService in DI container
- [ ] Register SignalR hub
- [ ] Add TURN server configuration to appsettings.json
- [ ] Create IceServer configuration class

**appsettings.json additions:**
```json
{
  "WebRTC": {
    "TurnServer": {
      "Urls": ["turn:quocdk.id.vn:3478"],
      "Username": "testuser",
      "Credential": "testpass"
    },
    "StunServers": [
      "stun:stun.l.google.com:19302"
    ],
    "CallTimeoutSeconds": 60,
    "MaxCallDurationSeconds": 3600
  }
}
```

**Tasks:**
- [ ] Create WebRTC configuration class
- [ ] Update appsettings.json
- [ ] Register configuration in DI

### 1.6 Notifications Service Integration

**Location:** Extend existing `INotificationService`

**New Methods:**
```csharp
Task SendIncomingCallNotificationAsync(string userId, string callerId, string callerName);
Task SendCallRejectedNotificationAsync(string userId, string reason);
Task SendCallMissedNotificationAsync(string userId, string callerId);
```

**Tasks:**
- [ ] Extend notification service
- [ ] Implement email/push notifications for incoming calls
- [ ] Add notification preferences to user settings

---

## Phase 2: Frontend WebRTC Integration

### 2.1 WebRTC Hook

**Location:** `frontend/src/hooks/useWebRTC.ts`

**Responsibilities:**
- Manage RTCPeerConnection
- Handle local/remote streams
- Manage ICE candidates
- Handle connection state changes

**Hook Interface:**
```typescript
interface UseWebRTCConfig {
  iceServers: RTCIceServer[];
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onStateChange?: (state: WebRTCState) => void;
  onError?: (error: Error) => void;
}

type WebRTCState = 'idle' | 'initializing' | 'ready' | 'connecting' | 'connected' | 'disconnected' | 'failed';

const useWebRTC = (config: UseWebRTCConfig) => {
  const [state, setState] = useState<WebRTCState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const initializeConnection = async (remoteDescription?: RTCSessionDescription) => { }
  const createOffer = async () => { }
  const createAnswer = async (offer: RTCSessionDescription) => { }
  const addIceCandidate = async (candidate: RTCIceCandidateInit) => { }
  const getLocalStream = async (constraints?: MediaStreamConstraints) => { }
  const closeConnection = async () => { }
  
  return { state, localStream, remoteStream, initializeConnection, createOffer, createAnswer, addIceCandidate, getLocalStream, closeConnection };
};
```

**Tasks:**
- [ ] Create useWebRTC hook
- [ ] Implement peer connection setup
- [ ] Handle ICE candidate gathering
- [ ] Implement stream management
- [ ] Add error handling
- [ ] Create unit tests

### 2.2 SignalR Hook

**Location:** `frontend/src/hooks/useCallSignaling.ts`

**Responsibilities:**
- Connect to SignalR hub
- Handle signaling messages
- Manage call state

**Hook Interface:**
```typescript
const useCallSignaling = (userId: string) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  
  const initiateCall = async (recipientId: string, bookingId?: string) => { }
  const acceptCall = async (callId: string) => { }
  const rejectCall = async (callId: string, reason?: string) => { }
  const sendOffer = async (callId: string, sdpOffer: string) => { }
  const sendAnswer = async (callId: string, sdpAnswer: string) => { }
  const sendIceCandidate = async (callId: string, candidate: RTCIceCandidate) => { }
  const endCall = async (callId: string, reason?: string) => { }
  
  return { connection, incomingCall, activeCall, initiateCall, acceptCall, rejectCall, sendOffer, sendAnswer, sendIceCandidate, endCall };
};
```

**Tasks:**
- [ ] Create useCallSignaling hook
- [ ] Implement SignalR connection
- [ ] Handle incoming call events
- [ ] Implement call state management
- [ ] Add reconnection logic
- [ ] Create unit tests

### 2.3 Call Components

**Location:** `frontend/src/components/features/call/`

**Components:**

1. **IncomingCallDialog.tsx**
   - Display incoming call notification
   - Show caller info (avatar, name)
   - Accept/Reject buttons
   - Auto-dismiss after timeout

2. **CallWindow.tsx**
   - Main call interface
   - Local video preview
   - Remote video display
   - Call timer
   - Control buttons (mute audio, toggle video, end call)
   - Participant info

3. **CallControls.tsx**
   - Mute/unmute audio
   - Toggle video on/off
   - End call button
   - Call duration timer
   - Network quality indicator

4. **VideoGrid.tsx**
   - Display local and remote video streams
   - Handle layout (picture-in-picture or side-by-side)
   - Responsive design

5. **CallHistory.tsx**
   - List of past calls
   - Call duration, date, participant
   - Call status badge
   - Ability to view call details

**Tasks:**
- [ ] Create IncomingCallDialog component
- [ ] Create CallWindow component
- [ ] Create CallControls component
- [ ] Create VideoGrid component
- [ ] Create CallHistory component
- [ ] Add styling with Tailwind CSS
- [ ] Add animations with Framer Motion
- [ ] Create component tests

### 2.4 Call State Management

**Location:** `frontend/src/store/callSlice.ts`

**Redux Slice:**
```typescript
interface CallState {
  activeCall: Call | null;
  incomingCall: IncomingCall | null;
  callHistory: Call[];
  isLoading: boolean;
  error: string | null;
  callDuration: number;
}

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setActiveCall,
    setIncomingCall,
    clearIncomingCall,
    addToCallHistory,
    setCallDuration,
    setError,
    resetCallState
  }
});
```

**Tasks:**
- [ ] Create Redux call slice
- [ ] Implement call state actions
- [ ] Add selectors for call state
- [ ] Create tests

### 2.5 API Integration

**Location:** `frontend/src/api/callApi.ts`

**API Methods:**
```typescript
export const callApi = {
  initiateCall: (recipientId: string, bookingId?: string) => { },
  getCallHistory: (limit?: number) => { },
  getCallStatistics: () => { },
  getActiveCall: (callId: string) => { }
};
```

**Tasks:**
- [ ] Create call API client
- [ ] Implement API methods
- [ ] Add error handling
- [ ] Create tests

---

## Phase 3: Integration Points

### 3.1 Booking System Integration

**Location:** Extend booking-related components

**Changes:**
- Add "Start Call" button to confirmed bookings
- Update booking status when call starts/ends
- Link calls to bookings in database

**Tasks:**
- [ ] Add call button to booking details
- [ ] Update booking model with call reference
- [ ] Create migration for booking-call relationship
- [ ] Update booking controller

### 3.2 User Availability Status

**Location:** Update user model and services

**Changes:**
- Add `IsInCall` property to User model
- Update status when call starts/ends
- Show availability status in UI

**Tasks:**
- [ ] Add IsInCall property to User model
- [ ] Create migration
- [ ] Update user service
- [ ] Update UI to show status

### 3.3 Session Completion

**Location:** Extend booking completion logic

**Changes:**
- Mark booking as completed when call ends
- Store call duration in booking
- Trigger review notification after call

**Tasks:**
- [ ] Update booking completion logic
- [ ] Add call duration to booking
- [ ] Trigger post-call notifications

---

## Phase 4: Testing & Deployment

### 4.1 Unit Tests

**Backend:**
- [ ] CallService tests
- [ ] CallController tests
- [ ] Call state machine tests
- [ ] SignalR hub tests

**Frontend:**
- [ ] useWebRTC hook tests
- [ ] useCallSignaling hook tests
- [ ] Component tests (IncomingCallDialog, CallWindow, etc.)
- [ ] Redux slice tests

### 4.2 Integration Tests

**Backend:**
- [ ] End-to-end call flow (initiate → accept → connect → end)
- [ ] Call rejection flow
- [ ] Call timeout handling
- [ ] Database operations

**Frontend:**
- [ ] Call initiation flow
- [ ] Incoming call acceptance
- [ ] Video stream connection
- [ ] Call termination

### 4.3 E2E Tests (Playwright)

**Test Scenarios:**
- [ ] Mentor initiates call to mentee
- [ ] Mentee accepts call
- [ ] Video/audio streams connect
- [ ] Both parties can see/hear each other
- [ ] Call ends properly
- [ ] Call history is recorded

### 4.4 Network Testing

**Tasks:**
- [ ] Test TURN server fallback
- [ ] Test ICE candidate gathering
- [ ] Test connection with poor network
- [ ] Test reconnection logic
- [ ] Monitor TURN relay usage

### 4.5 Production Deployment

**Tasks:**
- [ ] Replace test TURN credentials in appsettings.json
- [ ] Update TURN server configuration for production
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting for call endpoints
- [ ] Set up backup TURN servers
- [ ] Test with production environment
- [ ] Create deployment documentation

---

## Implementation Timeline

| Phase | Tasks | Estimated Duration |
|-------|-------|-------------------|
| 1.1 | Database Models | 1-2 days |
| 1.2 | SignalR Hub | 2-3 days |
| 1.3 | Call Service | 2-3 days |
| 1.4 | Call Controller | 1-2 days |
| 1.5 | Configuration | 1 day |
| 1.6 | Notifications | 1-2 days |
| **Phase 1 Total** | | **8-13 days** |
| 2.1 | WebRTC Hook | 2-3 days |
| 2.2 | SignalR Hook | 2-3 days |
| 2.3 | Call Components | 3-4 days |
| 2.4 | State Management | 1-2 days |
| 2.5 | API Integration | 1 day |
| **Phase 2 Total** | | **9-13 days** |
| 3 | Integration Points | 3-5 days |
| 4 | Testing & Deployment | 5-7 days |
| **Total** | | **25-38 days** |

---

## Key Considerations

### Security
- Validate all call requests (authorization, rate limiting)
- Sanitize user input in call logs
- Use HTTPS/WSS for all connections
- Implement call encryption (DTLS-SRTP)
- Validate TURN credentials

### Performance
- Implement connection pooling for database
- Cache ICE server configuration
- Optimize SignalR message size
- Monitor WebRTC connection quality
- Implement call timeout mechanisms

### Reliability
- Implement automatic reconnection logic
- Handle network failures gracefully
- Log all call events for debugging
- Implement call state recovery
- Set up monitoring and alerting

### User Experience
- Show clear call status indicators
- Provide helpful error messages
- Implement call quality indicators
- Add loading states
- Smooth transitions between call states

---

## Dependencies

### Backend
- SignalR (already in ASP.NET Core)
- Entity Framework Core (already in project)
- Existing notification service

### Frontend
- React 19 (already in project)
- TypeScript (already in project)
- Redux Toolkit (already in project)
- TanStack React Query (already in project)
- Framer Motion (already in project)
- Lucide React (already in project)
- Tailwind CSS (already in project)

### External
- TURN Server: `quocdk.id.vn:3478` (already configured)
- STUN Server: `stun.l.google.com:19302` (public)

---

## Success Criteria

- [ ] Users can initiate calls to other users
- [ ] Incoming calls trigger notifications
- [ ] Users can accept/reject calls
- [ ] Video and audio streams connect successfully
- [ ] Call duration is tracked accurately
- [ ] Call history is stored and retrievable
- [ ] Users can end calls cleanly
- [ ] System handles network failures gracefully
- [ ] Call quality is acceptable (>90% success rate)
- [ ] No memory leaks in WebRTC connections
- [ ] All tests pass (unit, integration, E2E)
- [ ] Production deployment successful
