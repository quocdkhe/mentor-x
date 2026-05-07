# WebRTC P2P Call — Implementation Plan (Updated)

**Project:** MentorX  
**Feature:** Real-time video/audio call between mentor and mentee  
**Stack:** ASP.NET Core 9 · SignalR · React 19 · TypeScript · WebRTC  
**TURN server:** coturn @ `171.224.76.34:3478` (already running)

---

## Current status

| Stage | Description | Status |
|---|---|---|
| 1 | Backend: SignalR hub + TURN credential API | ✅ Complete |
| 2 | coturn config hardening (use-auth-secret) | ✅ Config deployed; ICE verification pending |
| 3 | Frontend: types, API client, SignalR hook | ✅ Complete |
| 4 | Frontend: `useWebRTC` hook (media + screen share) | ✅ Complete |
| 5 | Frontend: call room page and UI components | ✅ Complete |
| 6 | Integration tests (backend + E2E) | 🔄 Pending |
| 7 | Polish and hardening | 🔄 Partially complete |

---

## Architecture summary

```
Mentor client  ←──── P2P media (WebRTC) ────→  Mentee client
      │                                               │
      └────── SignalR (SDP + ICE exchange) ───────────┘
                          │
                   ASP.NET Core Hub
                          │
              TURN relay fallback (coturn)
              (only when P2P is blocked)
```

Call entry point: a confirmed `Appointment` session. Each session maps to exactly one call room via its `sessionId` (appointment `Id`).

---

## Stage 1 — Backend: SignalR hub + TURN credential API

### Status: ✅ Implemented

### Files created / modified

```
backend/
├── Hubs/
│   └── CallHub.cs                  ← CREATED
├── Controllers/
│   └── CallController.cs           ← CREATED
├── Models/
│   └── DTOs/
│       └── TurnCredentialDto.cs    ← CREATED
├── Services/
│   ├── ICallService.cs             ← CREATED
│   └── CallService.cs              ← CREATED
└── Program.cs                      ← MODIFIED (AddSignalR + MapHub)
```

### Implementation details

**`appsettings.json`** — requires section:
```json
"Turn": {
  "Host": "171.224.76.34",
  "Port": 3478,
  "Secret": "<shared-secret-replace-testpass>",
  "CredentialTtlSeconds": 86400
}
```

**`CallHub.cs`** `@/backend/Hubs/CallHub.cs:1-120` — SignalR hub:
- `[Authorize]` on the hub class.
- `JoinRoom(string roomId)` — validates participant, adds to group, tracks occupancy via `ConcurrentDictionary`, broadcasts `UserJoined`. If room already occupied, also notifies the new joiner so the initiator can create an offer regardless of join order.
- `LeaveRoom(string roomId)` — removes from group, broadcasts `UserLeft`.
- `SendOffer(string roomId, string sdp)` — relays SDP offer via `Clients.OthersInGroup`.
- `SendAnswer(string roomId, string sdp)` — relays SDP answer.
- `SendIceCandidate(string roomId, string candidate)` — relays ICE candidate.
- `OnDisconnectedAsync` — cleans up room tracking and broadcasts `UserLeft` on unexpected disconnect.
- `EnsureParticipant` — private helper validating JWT and participant status via `ICallService`, throwing `HubException` on any failure.

**`CallController.cs`** `@/backend/Controllers/CallController.cs:1-54` — REST endpoint:
- `GET /call/{sessionId}/token` — requires JWT auth. Validates participant and `Confirmed` session status. Returns `TurnCredentialDto` with `RoomId`, `TurnHost`, `TurnPort`, `TurnUsername`, `TurnCredential`, and `ExpiresAt`.

**`CallService.cs`** `@/backend/Services/CallService.cs:1-80`:
- `ValidateParticipant(string sessionId, string userId)` — queries DB via `MentorXContext` to confirm the user is `MentorId` or `MenteeId` of the appointment and status is `Confirmed`. Throws `BadRequestException`, `ForbiddenException`, `NotFoundException`, or `UnauthorizedException` as appropriate.
- `GenerateTurnCredential(string userId)` — generates time-limited TURN credentials using HMAC-SHA1. Username format: `{unixTimestamp}:{userId}`. Credential: `Base64(HMAC-SHA1(secret, username))`.

**`Program.cs`** `@/backend/Program.cs:21,55`:
- `builder.Services.AddSignalR()`
- `app.MapHub<CallHub>("/hubs/call")`
- `ICallService` / `CallService` registered via `AddProjectServices()` in `ServiceCollectionExtensions`

### Acceptance criteria

- [ ] `GET /api/call/{sessionId}/token` returns HTTP 200 with a JSON body containing `roomId`, `turnHost`, `turnPort`, `turnUsername`, `turnCredential`, and `expiresAt` when called by an authenticated participant of a confirmed session.
- [ ] The same endpoint returns HTTP 403 when called by a user who is not a participant of the session.
- [ ] The same endpoint returns HTTP 400 when the session status is not `Confirmed`.
- [ ] The generated TURN `username` and `credential` are accepted by coturn. Verify by running: `turnutils_uclient -u <username> -w <credential> 171.224.76.34` or via the trickle-ice test page showing `typ relay`.
- [ ] A WebSocket client can connect to `/hubs/call` with a valid JWT Bearer token.
- [ ] An unauthenticated WebSocket connection to `/hubs/call` is rejected with 401.
- [ ] `JoinRoom` adds the caller to a SignalR group and a second client joining the same room receives a `UserJoined` event.
- [ ] `SendOffer` relayed from client A is received only by other members of the same room, not other rooms.
- [ ] `LeaveRoom` broadcasts `UserLeft` to remaining group members.
- [ ] Hub is covered by at least one integration test using `TestServer` + `HubConnection`.

---

## Stage 2 — Backend: coturn config hardening (use-auth-secret)

### Status: ✅ Implemented (server-side)

### Goal
Switch coturn from the static `user=testuser:testpass` config to the HMAC-SHA1 `use-auth-secret` scheme so the backend can generate short-lived credentials without storing passwords.

### Files to modify (on the server running coturn)

```
/etc/turnserver.conf
```

### Implementation details

Replace the `user=` line with:

```ini
use-auth-secret
static-auth-secret=<same-secret-as-appsettings-Turn:Secret>
```

Remove:
```ini
user=testuser:testpass
```

Keep everything else the same. Restart coturn:
```bash
sudo systemctl restart coturn
```

The `static-auth-secret` value must exactly match `Turn:Secret` in `appsettings.json`.

### Acceptance criteria

- [x] coturn restarts without errors (`sudo systemctl status coturn` shows `active (running)`).
- [ ] A credential pair generated by `CallService.GenerateTurnCredential` is accepted by coturn — the trickle-ice test page at `https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/` shows a `typ relay` candidate using the generated username/credential.
- [ ] The old static credentials `testuser / testpass` are rejected by coturn.
- [ ] Credentials generated with an expired timestamp (older than `CredentialTtlSeconds`) are rejected by coturn.

---

## Stage 3 — Frontend: types, API client, SignalR connection hook

### Status: ✅ Implemented

### Goal
Lay the plumbing: TypeScript types, the API call to fetch TURN credentials, and a reusable SignalR connection hook. No UI yet.

### Files created / modified

```
frontend/src/
├── types/
│   └── call.ts                     ← CREATED
├── api/
│   └── call.ts                     ← CREATED (not callApi.ts)
└── hooks/
    └── useSignalR.ts               ← CREATED
```

### Implementation details

**`types/call.ts`** `@/frontend/src/types/call.ts:1-23`:
```ts
export interface TurnCredential {
  roomId: string;
  turnHost: string;
  turnPort: number;
  turnUsername: string;
  turnCredential: string;
  expiresAt: string;
}

export interface CallParticipant {
  userId: string;
  displayName: string;
  role: "mentor" | "user";
}

export type CallStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "ended"
  | "error";
```

**`call.ts`** `@/frontend/src/api/call.ts:1-10`:
- `fetchCallToken(sessionId: string): Promise<TurnCredential>` — `GET /call/{sessionId}/token` via the shared `api` axios instance.

**`useSignalR.ts`** `@/frontend/src/hooks/useSignalR.ts:1-78`:
- Accepts `hubUrl: string`.
- Manages a `HubConnection` instance using `@microsoft/signalr`.
- Returns `{ connection, connectionRef, status }` where `connectionRef` is a `MutableRefObject<HubConnection | null>` for stable access inside other hooks (e.g. `useWebRTC`).
- Maps `HubConnectionState` to `CallStatus` (`connected`, `connecting`, `reconnecting`, `ended`, `error`).
- Handles reconnection with `withAutomaticReconnect()`.
- Cleans up on unmount (sets cancellation flag, stops connection, nulls ref).

### Dependencies installed

```bash
bun add @microsoft/signalr
```

### Acceptance criteria

- [x] `@microsoft/signalr` is in `package.json` dependencies.
- [x] `fetchCallToken` returns a typed `TurnCredential` object when called with a valid `sessionId`.
- [x] `fetchCallToken` throws on 403 or 400 responses (axios interceptors propagate errors).
- [x] `useSignalR` successfully connects to `/hubs/call` in a running dev environment.
- [x] `useSignalR` returns `status: 'connected'` after the handshake completes.
- [x] Unmounting the component that uses `useSignalR` stops the connection.
- [x] TypeScript strict mode: zero `any` types in `call.ts`, `call.ts`, and `useSignalR.ts`.

---

## Stage 4 — Frontend: `useWebRTC` hook

### Status: ✅ Implemented

### Goal
Encapsulate the full `RTCPeerConnection` lifecycle — offer/answer, ICE exchange, media tracks, and screen sharing — in a single reusable hook. This is the core WebRTC logic.

### Files created

```
frontend/src/hooks/
└── useWebRTC.ts                    ← CREATED
```

### Implementation details

**`useWebRTC(params)` interface** `@/frontend/src/hooks/useWebRTC.ts:1-25`:

```ts
interface UseWebRTCParams {
  roomId: string;
  credential: TurnCredential;
  connectionRef: RefObject<HubConnection | null>; // stable ref from useSignalR
  isInitiator: boolean;                             // true = sends the offer
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: CallStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  endCall: () => void;
}
```

**Internal logic** `@/frontend/src/hooks/useWebRTC.ts:104-575`:

1. On mount: call `getUserMedia({ video: true, audio: true })` → store as `localStream`.
2. Create `RTCPeerConnection` with:
   ```ts
   {
     iceServers: [
       { urls: "stun:stun.l.google.com:19302" },
       {
         urls: `turn:${credential.turnHost}:${credential.turnPort}`,
         username: credential.turnUsername,
         credential: credential.turnCredential,
       },
     ],
   }
   ```
3. Add local tracks to the peer connection.
4. Listen on `pc.ontrack` → set `remoteStream`.
5. Listen on `pc.onicecandidate` → send via `connection.invoke('SendIceCandidate', roomId, JSON.stringify(e.candidate.toJSON()))`.
6. If `isInitiator`:
   - Wait for `UserJoined` event → create offer → `pc.setLocalDescription(offer)` → `connection.invoke('SendOffer', roomId, offer.sdp)`.
7. SignalR event handlers:
   - `ReceiveOffer`: `setRemoteDescription` → create answer → `setLocalDescription` → `SendAnswer`.
   - `ReceiveAnswer`: `setRemoteDescription` → flush pending ICE candidates.
   - `ReceiveIceCandidate`: queue if no remote description yet, otherwise `addIceCandidate`.
   - `UserLeft`: set `callStatus` to `'ended'`.
8. `toggleMute`: enable/disable audio tracks on `localStream`.
9. `toggleVideo`: enable/disable video tracks on `localStream`.
10. `toggleScreenShare`: switches between camera and screen-capture via `getDisplayMedia`; replaces the video track on the peer connection sender. Handles the browser-native "Stop sharing" event to revert to camera.
11. `endCall`: close `pc`, stop all `localStream` tracks, invoke `LeaveRoom`.
12. Cleanup on unmount: same as `endCall`.

**Connection state handling**:
- `connected` → sets `callStatus: 'connected'`.
- `disconnected` → sets `callStatus: 'reconnecting'` (temporary, may self-recover).
- `failed` → finalizes call with `'error'`.
- `closed` → finalizes call with `'ended'`.

**SignalR synchronization**:
- Waits up to 30 seconds for `HubConnectionState.Connected` before invoking `JoinRoom` to avoid race conditions with cached permissions.

### Acceptance criteria

- [x] `localStream` is non-null within 2 seconds of hook mounting (camera/mic permission granted in test environment).
- [x] When two browser tabs on the same machine both mount `useWebRTC` for the same `roomId` (one with `isInitiator: true`, one `false`), `remoteStream` becomes non-null in both tabs within 5 seconds on a LAN connection.
- [x] `callStatus` transitions: `idle` → `connecting` (on offer sent) → `connected` (on `pc.connectionState === 'connected'`).
- [x] `toggleMute` sets `localStream.getAudioTracks()[0].enabled` to false; calling again re-enables it.
- [x] `toggleVideo` sets `localStream.getVideoTracks()[0].enabled` to false; calling again re-enables it.
- [x] `toggleScreenShare` replaces the video sender track with screen-capture and reverts on second click or browser stop-sharing event.
- [x] `endCall` closes the `RTCPeerConnection` and stops all local tracks.
- [x] When the remote side calls `endCall`, the local `callStatus` becomes `'ended'` within 2 seconds.
- [x] No memory leaks: peer connection and streams are fully cleaned up on unmount.
- [x] TypeScript strict mode: zero `any` types.

---

## Stage 5 — Frontend: call room page and UI components

### Status: ✅ Implemented

### Goal
Build the visible call UI: a full-screen call room page with local/remote video, controls bar, screen sharing, and entry/exit states. Wire it into TanStack Router.

### Files created / modified

```
frontend/src/
├── pages/
│   └── user/
│       └── call-room.tsx            ← CREATED (CallRoomPage, also used by mentor role)
├── components/
│   └── features/
│       └── call/
│           ├── VideoTile.tsx        ← CREATED
│           ├── ControlsBar.tsx      ← CREATED
│           └── CallStatusOverlay.tsx ← CREATED
└── routes/
    └── call.router.ts              ← CREATED
```

### Implementation details

**`call-room.tsx`** `@/frontend/src/pages/user/call-room.tsx:1-192` — composed of two components:
- **`CallRoomPage`** (outer): resolves `sessionId` from route params, fetches TURN token via `useQuery` (`fetchCallToken`), initializes `useSignalR`, determines `isInitiator` (`user.role === USER_ROLES.USER`), and renders loading, error, or active call states. Uses Vietnamese UI copy ("Đang tải thông tin cuộc gọi…", "Cuộc gọi đã kết thúc"). Query uses `staleTime: Infinity` and `refetchOnWindowFocus: false` to prevent mid-call re-fetch.
- **`CallRoom`** (inner): receives `credential`, `connectionRef`, `isInitiator`, and mounts `useWebRTC`. Watches `callStatus` for `'ended'` (toast + navigate back after 2s) and `'reconnecting'` (loading toast). Renders `VideoTile`, `CallStatusOverlay`, and `ControlsBar`.

**`VideoTile.tsx`** `@/frontend/src/components/features/call/VideoTile.tsx:1-76`:
- Props: `stream`, `label`, `isMuted`, `isVideoOff`, `size`, `objectFit` (`'cover' | 'contain'`).
- Renders `<video autoPlay playsInline muted={size === 'secondary'}>`.
- Shows `AvatarFallback` placeholder with `VideoOff` badge when `stream` has no tracks or `isVideoOff`.
- Label badge at bottom-left displays name and mute indicator.

**`ControlsBar.tsx`** `@/frontend/src/components/features/call/ControlsBar.tsx:1-83`:
- Four icon buttons: Mic (`Mic`/`MicOff`), Camera (`Video`/`VideoOff`), Screen Share (`Monitor`), End call (`PhoneOff` — red).
- Buttons are `h-12 w-12 rounded-full` with `bg-zinc-700` / `bg-red-600` / `bg-green-600` states.
- Semi-transparent bar (`bg-black/60 backdrop-blur-sm`) centered at bottom.
- Screen sharing button toggles between camera and display-capture.

**`CallStatusOverlay.tsx`** `@/frontend/src/components/features/call/CallStatusOverlay.tsx:1-38`:
- Props: `status` (`'connecting' | 'ended' | 'error'`), `onBack`.
- `connecting`: `Spinner` + "Đang kết nối…".
- `ended` / `error`: red `PhoneOff` icon + message + back button.

**`call.router.ts`** `@/frontend/src/routes/call.router.ts:1-19`:
- Defines `/call/$sessionId` as a lazy route guarded by `requireAuth()`.
- Page title: "MentorX - Cuộc gọi".

### Acceptance criteria

- [x] Navigating to `/call/:sessionId` with a valid confirmed session and a logged-in participant renders the call room page without errors.
- [x] The page shows a loading spinner while `fetchCallToken` is pending.
- [x] The page shows an error message (not a crash) when `fetchCallToken` returns 403.
- [x] Local video is visible in the secondary `VideoTile` within 3 seconds of page load (camera permission granted).
- [x] Remote video appears in the primary `VideoTile` once the other participant joins.
- [x] Clicking the mic button toggles `isMuted` state and the button icon changes between `Mic` and `MicOff`.
- [x] Clicking the camera button toggles `isVideoOff` and the `VideoTile` shows the avatar placeholder when video is off.
- [x] Clicking the screen-share button replaces local video with screen capture and reverts on second click or browser stop-sharing event.
- [x] Clicking "End call" closes the connection, shows the `ended` overlay, and navigates back to the session page after 2 seconds.
- [x] The route requires authentication — unauthenticated users are redirected to login (existing route guard applies).
- [x] Page is responsive: works on mobile viewport (390px width). Controls bar does not overflow.
- [x] No console errors during a complete call lifecycle (join → media active → end).

---

## Stage 6 — Integration test: end-to-end call flow

### Status: 🔄 Pending

### Goal
Verify the full stack works together — token generation → SignalR signaling → WebRTC negotiation → TURN relay fallback.

### Files to create

```
backend/
└── Tests/
    └── CallIntegrationTests.cs     ← NEW

frontend/
└── e2e/
    └── call.spec.ts                ← NEW (Playwright)
```

### Test cases

**Backend integration tests (`CallIntegrationTests.cs`)**:
- Token endpoint returns valid credential for confirmed session participant.
- Token endpoint returns 403 for non-participant.
- Two `HubConnection` instances can join the same room and relay offer/answer/ICE through the hub.
- Hub rejects connection without valid JWT.

**Frontend E2E tests (`call.spec.ts`)** using Playwright with two browser contexts (simulating mentor + mentee):
- Both contexts authenticate, navigate to `/call/:sessionId`.
- Both see local video within 5 seconds.
- Assert that the `<video>` element in the remote tile has `readyState >= 2` (media loaded) within 10 seconds.
- One context clicks end call — both contexts show the ended state.

### Acceptance criteria

- [ ] All backend integration tests pass: `dotnet test`.
- [ ] Playwright E2E test completes the full call cycle (join → media → end) with two headed Chromium contexts on localhost.
- [ ] When one participant is behind a simulated symmetric NAT (e.g. using a network namespace or a 4G hotspot), the call still connects via the TURN relay and `typ relay` candidates are visible in `RTCPeerConnection.getStats()`.
- [ ] No errors appear in the backend logs (`/var/log/turn.log` and ASP.NET Core console) during the test run.

---

## Stage 7 — Polish and hardening

### Status: 🔄 Partially implemented

### Goal
Production-readiness: reconnection, error handling, security hardening, and observability.

### Already implemented

**Reconnection**:
- `useSignalR` handles automatic reconnection via `withAutomaticReconnect()`.
- `call-room.tsx` shows a loading toast during `'reconnecting'` status and dismisses it on restore.
- `useWebRTC` handles `pc.connectionState === 'disconnected'` by setting `callStatus: 'reconnecting'` (transient) and `failed` by finalizing with `'error'`.

**Cleanup**:
- `CallHub.OnDisconnectedAsync` removes the connection from its room and broadcasts `UserLeft` to remaining participants. Room tracking dictionaries (`_roomConnections`, `_connectionRooms`) are cleaned up.

### Remaining tasks

**Reconnection**:
- If SignalR disconnects mid-call and reconnection fails after 30 seconds, `useSignalR` currently sets `status: 'ended'`. The call room should transition to an explicit `'error'` overlay rather than silently ending.
- Handle `pc.connectionState === 'failed'` — attempt ICE restart (`pc.restartIce()`) once before giving up.

**Security**:
- TURN credentials `expiresAt` should be enforced on the frontend: if the page is open longer than `CredentialTtlSeconds`, re-fetch the token silently before ICE restart.
- Rate-limit `GET /call/{sessionId}/token` — max 10 requests per user per minute (use ASP.NET Core rate limiting middleware).
- Add `[RequireHttps]` or enforce HTTPS in production — WebRTC requires a secure context in browsers.

**Observability**:
- Add ASP.NET Core logger calls in `CallHub` for `JoinRoom`, `LeaveRoom`, and `OnDisconnectedAsync` (log `roomId` and `userId`, no PII).
- On the frontend, log ICE candidate types (`host`, `srflx`, `relay`) to the console in development mode so developers can see whether TURN is being used.

### Acceptance criteria

- [ ] Simulating a SignalR drop (kill the WS in DevTools) and restoring it within 30 seconds resumes the call without user action.
- [ ] After 30 seconds of failed reconnection, the error overlay appears.
- [x] Closing a browser tab without clicking end call causes the other participant to see the `'ended'` status within 5 seconds.
- [ ] `GET /call/{sessionId}/token` returns HTTP 429 after 10 rapid requests from the same user.
- [x] In Chrome DevTools → Application → Permissions, the call page only requests camera and microphone — no other permissions.
- [ ] ICE candidate types are logged in the browser console during a dev-mode call session.

---

## Environment variables reference

Add these to backend config (do not commit secrets):

| Key | Description |
|---|---|
| `Turn__Host` | `171.224.76.34` |
| `Turn__Port` | `3478` |
| `Turn__Secret` | Shared secret (matches `static-auth-secret` in turnserver.conf) |
| `Turn__CredentialTtlSeconds` | `86400` (24h) |

Add to frontend `.env` / `.env.local`:

| Key | Description |
|---|---|
| `VITE_API_URL` | Base API URL, e.g. `http://localhost:5000` (dev) |

SignalR hub URL is derived at runtime: `` `${import.meta.env.VITE_API_URL}/hubs/call` ``.

---

## Dependency summary

| Layer | Package | Version | Status |
|---|---|---|---|
| Backend | `Microsoft.AspNetCore.SignalR` | included in ASP.NET Core 9 | ✅ |
| Frontend | `@microsoft/signalr` | `^8.x` | ✅ |
| Frontend E2E | `@playwright/test` | `^1.x` | 🔄 |

---

## Stage order and dependencies

```
Stage 1 (backend hub + API)          ✅ COMPLETE
    ↓
Stage 2 (coturn hardening)           ✅ COMPLETE (config deployed, pending ICE verification)
    ↓
Stage 3 (frontend plumbing)          ✅ COMPLETE
    ↓
Stage 4 (useWebRTC hook)             ✅ COMPLETE
    ↓
Stage 5 (UI)                         ✅ COMPLETE
    ↓
Stage 6 (integration tests)          🔄 PENDING
    ↓
Stage 7 (hardening)                  🔄 PARTIAL
```

Stages 2 and 3 had no dependency on each other and were done in parallel.
