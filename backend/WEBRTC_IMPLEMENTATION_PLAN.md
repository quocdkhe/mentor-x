# WebRTC P2P Call — Implementation Plan

**Project:** MentorX  
**Feature:** Real-time video/audio call between mentor and mentee  
**Stack:** ASP.NET Core 9 · SignalR · React 19 · TypeScript · WebRTC  
**TURN server:** coturn @ `171.224.76.34:3478` (already running)

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

Call entry point: a confirmed `Booking` session. Each session maps to exactly one call room via its `sessionId`.

---

## Stage 1 — Backend: SignalR hub + TURN credential API

### Goal
Stand up the real-time signaling layer and a secure endpoint that issues short-lived TURN credentials. No frontend work yet.

### Files to create / modify

```
backend/
├── Hubs/
│   └── CallHub.cs                  ← NEW
├── Controllers/
│   └── CallController.cs           ← NEW
├── Models/
│   └── DTOs/
│       └── TurnCredentialDto.cs    ← NEW
├── Services/
│   ├── ICallService.cs             ← NEW
│   └── CallService.cs              ← NEW
├── Configurations/
│   └── SignalRConfiguration.cs     ← NEW (or inline in Program.cs)
└── appsettings.json                ← MODIFY (add Turn section)
```

### Implementation details

**`appsettings.json`** — add section:
```json
"Turn": {
  "Host": "171.224.76.34",
  "Port": 3478,
  "Secret": "<shared-secret-replace-testpass>",
  "CredentialTtlSeconds": 86400
}
```

**`CallHub.cs`** — SignalR hub methods:
- `JoinRoom(string roomId)` — add caller to a SignalR group named by roomId. Validate JWT; reject if the caller's userId is not a participant of the booking that maps to roomId.
- `LeaveRoom(string roomId)` — remove from group, broadcast `UserLeft` to group.
- `SendOffer(string roomId, string sdp)` — relay SDP offer to the other participant in the group.
- `SendAnswer(string roomId, string sdp)` — relay SDP answer.
- `SendIceCandidate(string roomId, string candidate)` — relay ICE candidate.
- All hub methods must be `[Authorize]`.

**`CallController.cs`** — REST endpoint:
- `GET /api/call/{sessionId}/token` — requires JWT auth. Validates that the calling user is a participant of the session and the session status is `Confirmed`. Returns a `TurnCredentialDto` containing roomId (= sessionId), TURN host, port, username, and credential generated via HMAC-SHA1 time-based scheme (standard coturn `use-auth-secret` method).

**`CallService.cs`**:
- `GenerateTurnCredential(string userId)` — generates a time-limited TURN username/credential pair using HMAC-SHA1. Username format: `{timestamp}:{userId}`. Credential: `Base64(HMAC-SHA1(secret, username))`.
- `ValidateParticipant(string sessionId, string userId)` — queries DB to confirm the user is mentor or mentee of this session and session is `Confirmed`.

**`Program.cs`** changes:
- `builder.Services.AddSignalR()`
- `app.MapHub<CallHub>("/hubs/call")`
- Register `ICallService` / `CallService`
- Add SignalR endpoint to CORS allowed origins

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

- [ ] coturn restarts without errors (`sudo systemctl status coturn` shows `active (running)`).
- [ ] A credential pair generated by `CallService.GenerateTurnCredential` is accepted by coturn — the trickle-ice test page at `https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/` shows a `typ relay` candidate using the generated username/credential.
- [ ] The old static credentials `testuser / testpass` are rejected by coturn.
- [ ] Credentials generated with an expired timestamp (older than `CredentialTtlSeconds`) are rejected by coturn.

---

## Stage 3 — Frontend: types, API client, SignalR connection hook

### Goal
Lay the plumbing: TypeScript types, the API call to fetch TURN credentials, and a reusable SignalR connection hook. No UI yet.

### Files to create / modify

```
frontend/src/
├── types/
│   └── call.ts                     ← NEW
├── api/
│   └── callApi.ts                  ← NEW
└── hooks/
    └── useSignalR.ts               ← NEW
```

### Implementation details

**`types/call.ts`**:
```ts
export interface TurnCredential {
  roomId: string
  turnHost: string
  turnPort: number
  turnUsername: string
  turnCredential: string
  expiresAt: string
}

export interface CallParticipant {
  userId: string
  displayName: string
  role: 'mentor' | 'user'
}

export type CallStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'error'
```

**`callApi.ts`**:
- `fetchCallToken(sessionId: string): Promise<TurnCredential>` — `GET /api/call/{sessionId}/token` with axios, authenticated.

**`useSignalR.ts`**:
- Accepts `hubUrl: string` and `token: string`.
- Manages a `HubConnection` instance using `@microsoft/signalr`.
- Returns `{ connection, status }`.
- Handles reconnection with `withAutomaticReconnect()`.
- Cleans up on unmount.

### Dependencies to install

```bash
bun add @microsoft/signalr
```

### Acceptance criteria

- [ ] `@microsoft/signalr` is in `package.json` dependencies.
- [ ] `fetchCallToken` returns a typed `TurnCredential` object when called with a valid `sessionId` and an authenticated axios instance.
- [ ] `fetchCallToken` throws a typed error (not swallows) on 403 or 400 responses.
- [ ] `useSignalR` successfully connects to `/hubs/call` in a running dev environment (verify via browser DevTools → Network → WS).
- [ ] `useSignalR` returns `status: 'connected'` after the handshake completes.
- [ ] Unmounting the component that uses `useSignalR` stops the connection (no lingering WS in DevTools).
- [ ] TypeScript strict mode: zero `any` types in `call.ts`, `callApi.ts`, and `useSignalR.ts`.

---

## Stage 4 — Frontend: `useWebRTC` hook

### Goal
Encapsulate the full `RTCPeerConnection` lifecycle — offer/answer, ICE exchange, media tracks — in a single reusable hook. This is the core WebRTC logic.

### Files to create

```
frontend/src/hooks/
└── useWebRTC.ts                    ← NEW
```

### Implementation details

**`useWebRTC(params)` interface**:

```ts
interface UseWebRTCParams {
  roomId: string
  credential: TurnCredential
  connection: HubConnection         // from useSignalR
  isInitiator: boolean              // true = the side that sends the offer
}

interface UseWebRTCReturn {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  callStatus: CallStatus
  isMuted: boolean
  isVideoOff: boolean
  toggleMute: () => void
  toggleVideo: () => void
  endCall: () => void
}
```

**Internal logic**:

1. On mount: call `getUserMedia({ video: true, audio: true })` → store as `localStream`.
2. Create `RTCPeerConnection` with:
   ```ts
   {
     iceServers: [
       { urls: 'stun:stun.l.google.com:19302' },
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
5. Listen on `pc.onicecandidate` → send via `connection.invoke('SendIceCandidate', roomId, JSON.stringify(e.candidate))`.
6. If `isInitiator`:
   - Create offer → `pc.setLocalDescription(offer)` → `connection.invoke('SendOffer', roomId, offer.sdp)`.
7. SignalR event handlers:
   - `ReceiveOffer`: `setRemoteDescription` → create answer → `setLocalDescription` → `SendAnswer`.
   - `ReceiveAnswer`: `setRemoteDescription`.
   - `ReceiveIceCandidate`: `addIceCandidate`.
   - `UserLeft`: set `callStatus` to `'ended'`.
8. `toggleMute`: enable/disable audio tracks on `localStream`.
9. `toggleVideo`: enable/disable video tracks on `localStream`.
10. `endCall`: close `pc`, stop all `localStream` tracks, invoke `LeaveRoom`.
11. Cleanup on unmount: same as `endCall`.

### Acceptance criteria

- [ ] `localStream` is non-null within 2 seconds of hook mounting (camera/mic permission granted in test environment).
- [ ] When two browser tabs on the same machine both mount `useWebRTC` for the same `roomId` (one with `isInitiator: true`, one `false`), `remoteStream` becomes non-null in both tabs within 5 seconds on a LAN connection.
- [ ] `callStatus` transitions: `idle` → `connecting` (on offer sent) → `connected` (on `pc.connectionState === 'connected'`).
- [ ] `toggleMute` sets `localStream.getAudioTracks()[0].enabled` to false; calling again re-enables it.
- [ ] `toggleVideo` sets `localStream.getVideoTracks()[0].enabled` to false; calling again re-enables it.
- [ ] `endCall` closes the `RTCPeerConnection` and stops all local tracks (verify `localStream.getTracks().every(t => t.readyState === 'ended')`).
- [ ] When the remote side calls `endCall`, the local `callStatus` becomes `'ended'` within 2 seconds.
- [ ] No memory leaks: peer connection and streams are fully cleaned up on unmount (verify with Chrome Task Manager — no lingering camera indicator after component unmounts).
- [ ] TypeScript strict mode: zero `any` types.

---

## Stage 5 — Frontend: call room page and UI components

### Goal
Build the visible call UI: a full-screen call room page with local/remote video, controls bar, and entry/exit states. Wire it into TanStack Router and link from the session detail page.

### Files to create / modify

```
frontend/src/
├── pages/
│   └── user/
│       └── CallRoomPage.tsx         ← NEW (also used by mentor role)
├── components/
│   └── features/
│       └── call/
│           ├── VideoTile.tsx        ← NEW
│           ├── ControlsBar.tsx      ← NEW
│           └── CallStatusOverlay.tsx ← NEW
└── routes/
    └── (modify existing route tree to add /call/:sessionId)
```

### Implementation details

**`CallRoomPage.tsx`** responsibilities:
- Read `sessionId` from route params.
- Call `fetchCallToken(sessionId)` via React Query on mount.
- Determine `isInitiator`: the **mentee** is always the initiator (sends the offer). Compare the current user's role from Redux store.
- Compose `useSignalR` + `useWebRTC`.
- Render: loading state while token is fetching, error state on 403/400, active call UI when connected.
- On `callStatus === 'ended'`: navigate back to the session detail page with a toast notification.

**`VideoTile.tsx`**:
- Props: `stream: MediaStream | null`, `label: string`, `isMuted?: boolean`, `isVideoOff?: boolean`, `size: 'primary' | 'secondary'`.
- Renders a `<video>` element. Auto-plays. Muted for local stream (avoid echo). Shows avatar placeholder when stream is null or video is off.

**`ControlsBar.tsx`**:
- Props: callbacks from `useWebRTC` (`toggleMute`, `toggleVideo`, `endCall`, `isMuted`, `isVideoOff`).
- Three icon buttons: Mic (Lucide `Mic` / `MicOff`), Camera (`Video` / `VideoOff`), End call (`PhoneOff` — red).
- Positioned at the bottom center of the screen, semi-transparent background.

**`CallStatusOverlay.tsx`**:
- Displays a centered overlay for `connecting` and `ended` states.
- `connecting`: spinner + "Connecting…" text.
- `ended`: "Call ended" + button to go back.

**Route addition** — in the TanStack Router route tree:
```
/call/$sessionId      → CallRoomPage (requires auth, any role)
```

**Link from session detail page**:
- Add a "Join call" button on the confirmed session card that navigates to `/call/${session.id}`. Button is only visible when session status is `Confirmed` and current time is within 15 minutes of the scheduled start.

### Acceptance criteria

- [ ] Navigating to `/call/:sessionId` with a valid confirmed session and a logged-in participant renders the call room page without errors.
- [ ] The page shows a loading spinner while `fetchCallToken` is pending.
- [ ] The page shows an error message (not a crash) when `fetchCallToken` returns 403.
- [ ] Local video is visible in the secondary `VideoTile` within 3 seconds of page load (camera permission granted).
- [ ] Remote video appears in the primary `VideoTile` once the other participant joins.
- [ ] Clicking the mic button toggles `isMuted` state and the button icon changes between `Mic` and `MicOff`.
- [ ] Clicking the camera button toggles `isVideoOff` and the `VideoTile` shows the avatar placeholder when video is off.
- [ ] Clicking "End call" closes the connection, shows the `ended` overlay, and navigates back to the session page after 2 seconds.
- [ ] The "Join call" button on the session detail page is visible only for `Confirmed` sessions and only within the 15-minute pre-call window.
- [ ] The route requires authentication — unauthenticated users are redirected to login (existing route guard applies).
- [ ] Page is responsive: works on mobile viewport (390px width). Controls bar does not overflow.
- [ ] No console errors during a complete call lifecycle (join → media active → end).

---

## Stage 6 — Integration test: end-to-end call flow

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

### Goal
Production-readiness: reconnection, error handling, security hardening, and observability.

### Tasks

**Reconnection**:
- If SignalR disconnects mid-call (`useSignalR` status becomes `'reconnecting'`), show a non-blocking toast "Reconnecting…". If reconnection fails after 30 seconds, set `callStatus` to `'error'` and show the error overlay.
- Handle `pc.connectionState === 'disconnected'` / `'failed'` — attempt ICE restart (`pc.restartIce()`) once before giving up.

**Security**:
- TURN credentials `expiresAt` should be enforced on the frontend: if the page is open longer than `CredentialTtlSeconds`, re-fetch the token silently before ICE restart.
- Rate-limit `GET /api/call/{sessionId}/token` — max 10 requests per user per minute (use ASP.NET Core rate limiting middleware).
- Add `[RequireHttps]` or enforce HTTPS in production — WebRTC requires a secure context in browsers.

**Observability**:
- Log to the ASP.NET Core logger on hub events: `JoinRoom`, `LeaveRoom`, with `sessionId` and `userId` (no PII beyond that).
- On the frontend, log ICE candidate types (`host`, `srflx`, `relay`) to the console in development mode so developers can see whether TURN is being used.

**Cleanup**:
- If a user closes the browser tab without calling `endCall`, the hub's `OnDisconnectedAsync` override must call `LeaveRoom` for all rooms the user was in, broadcasting `UserLeft` to remaining participants.

### Acceptance criteria

- [ ] Simulating a SignalR drop (kill the WS in DevTools) and restoring it within 30 seconds resumes the call without user action.
- [ ] After 30 seconds of failed reconnection, the error overlay appears.
- [ ] Closing a browser tab without clicking end call causes the other participant to see the `'ended'` status within 5 seconds.
- [ ] `GET /api/call/{sessionId}/token` returns HTTP 429 after 10 rapid requests from the same user.
- [ ] In Chrome DevTools → Application → Permissions, the call page only requests camera and microphone — no other permissions.
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

Add to frontend `.env.local`:

| Key | Description |
|---|---|
| `VITE_SIGNALR_URL` | `http://localhost:5000/hubs/call` (dev) |

---

## Dependency summary

| Layer | Package | Version |
|---|---|---|
| Backend | `Microsoft.AspNetCore.SignalR` | included in ASP.NET Core 9 |
| Frontend | `@microsoft/signalr` | `^8.x` |
| Frontend E2E | `@playwright/test` | `^1.x` |

---

## Stage order and dependencies

```
Stage 1 (backend hub + API)
    ↓
Stage 2 (coturn hardening)   ← can run in parallel with Stage 3
    ↓
Stage 3 (frontend plumbing)
    ↓
Stage 4 (useWebRTC hook)
    ↓
Stage 5 (UI)
    ↓
Stage 6 (integration tests)
    ↓
Stage 7 (hardening)
```

Stages 2 and 3 have no dependency on each other and can be done simultaneously.
