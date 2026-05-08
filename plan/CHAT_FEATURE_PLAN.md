# Chat Feature Implementation Plan

> Stack: ASP.NET Core 9 · PostgreSQL 16 · EF Core 9 · SignalR · React 19 · TanStack Query · Redux Toolkit · shadcn/ui

---

## 1. Overview

Implement a real-time 1-to-1 private chat between any two platform users (mentee ↔ mentor).  
The frontend shell already exists at `frontend/src/components/features/chats/index.tsx` with mock data — this plan replaces mock data with live API + SignalR.

---

## 2. Database Design

### 2.1 New Tables

#### `conversations`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `created_at` | `timestamptz` | `now()` |
| `updated_at` | `timestamptz` | `now()` |

#### `conversation_participants` (junction)
| Column | Type | Notes |
|---|---|---|
| `conversation_id` | `uuid` FK → `conversations.id` | PK part |
| `user_id` | `uuid` FK → `users.id` | PK part |
| `joined_at` | `timestamptz` | `now()` |
| `last_read_at` | `timestamptz` | nullable, for unread count |

#### `messages`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `conversation_id` | `uuid` FK → `conversations.id` | indexed |
| `sender_id` | `uuid` FK → `users.id` | indexed |
| `content` | `text` | message body |
| `is_deleted` | `bool` | default `false`, soft-delete |
| `created_at` | `timestamptz` | `now()` |
| `updated_at` | `timestamptz` | `now()` |

### 2.2 Indexes
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id       ON messages(sender_id);
CREATE INDEX idx_conv_participants_user   ON conversation_participants(user_id);
```

### 2.3 EF Core Entity Sketch

```csharp
// Models/Conversation.cs
public class Conversation {
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<ConversationParticipant> Participants { get; set; } = [];
    public ICollection<Message> Messages { get; set; } = [];
}

// Models/ConversationParticipant.cs
public class ConversationParticipant {
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LastReadAt { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public User User { get; set; } = null!;
}

// Models/Message.cs
public class Message {
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = "";
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public User Sender { get; set; } = null!;
}
```

Add `DbSet<Conversation> Conversations`, `DbSet<ConversationParticipant> ConversationParticipants`, `DbSet<Message> Messages` to `MentorXContext`.

---

## 3. Backend — REST API

Base path: `/api/conversations`  
All endpoints require JWT `[Authorize]`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/conversations` | List current user's conversations with last message + unread count |
| `POST` | `/api/conversations` | Create or get existing 1-to-1 conversation with `targetUserId` |
| `GET` | `/api/conversations/{id}` | Get conversation info + participants |
| `GET` | `/api/conversations/{id}/messages` | Paginated messages (cursor-based, `?before=<messageId>&limit=30`) |
| `PUT` | `/api/conversations/{id}/read` | Mark all messages up to now as read (update `last_read_at`) |

### 3.1 DTOs

```csharp
// Request
public record CreateConversationRequest(Guid TargetUserId);

// Response
public record ConversationDto(
    Guid Id,
    ParticipantDto OtherUser,   // the other participant's info
    MessageDto? LastMessage,
    int UnreadCount,
    DateTime UpdatedAt
);

public record ParticipantDto(
    Guid UserId,
    string Name,
    string? Avatar
);

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    Guid SenderId,
    string SenderName,
    string? SenderAvatar,
    string Content,
    bool IsDeleted,
    DateTime CreatedAt
);

public record SendMessageRequest(string Content);

public record PagedMessagesDto(
    IEnumerable<MessageDto> Messages,
    bool HasMore,
    Guid? NextCursor
);
```

### 3.2 Service Interface

```csharp
public interface IChatService {
    Task<IEnumerable<ConversationDto>> GetConversationsAsync(Guid userId);
    Task<ConversationDto> GetOrCreateConversationAsync(Guid userId, Guid targetUserId);
    Task<PagedMessagesDto> GetMessagesAsync(Guid conversationId, Guid userId, Guid? before, int limit);
    Task<MessageDto> SaveMessageAsync(Guid conversationId, Guid senderId, string content);
    Task MarkAsReadAsync(Guid conversationId, Guid userId);
    Task<bool> IsParticipantAsync(Guid conversationId, Guid userId);
}
```

---

## 4. Backend — SignalR Hub

### 4.1 Hub: `ChatHub`

File: `backend/Hubs/ChatHub.cs`

```csharp
[Authorize]
public class ChatHub : Hub {

    // Client → Server: join a conversation group
    // Server adds connection to group "conv-{conversationId}"
    public async Task JoinConversation(string conversationId) { ... }

    // Client → Server: leave conversation group
    public async Task LeaveConversation(string conversationId) { ... }

    // Client → Server: send message
    // 1. Validate user is participant
    // 2. Save to DB via IChatService
    // 3. Broadcast MessageDto to group "conv-{conversationId}"
    public async Task SendMessage(string conversationId, string content) { ... }

    // Client → Server: typing indicator (fire-and-forget, not persisted)
    public async Task Typing(string conversationId, bool isTyping) { ... }

    // Client → Server: mark as read
    public async Task MarkAsRead(string conversationId) { ... }
}
```

### 4.2 Client-bound events (server → client)

| Event | Payload | Description |
|---|---|---|
| `ReceiveMessage` | `MessageDto` | New message in a conversation |
| `UserTyping` | `{ userId, name, isTyping }` | Typing indicator |
| `MessageRead` | `{ conversationId, userId, readAt }` | Other user read the messages |
| `ConversationUpdated` | `ConversationDto` | Unread count / last message updated |

### 4.3 Hub Registration

```csharp
// Program.cs
builder.Services.AddSignalR();
app.MapHub<ChatHub>("/hubs/chat");
```

SignalR JWT auth config:
```csharp
options.Events = new JwtBearerEvents {
    OnMessageReceived = context => {
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;
        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/chat"))
            context.Token = accessToken;
        return Task.CompletedTask;
    }
};
```

---

## 5. Frontend Integration

### 5.1 New Types (`frontend/src/types/chat.ts`)

```typescript
export interface ConversationDto {
  id: string
  otherUser: { userId: string; name: string; avatar?: string }
  lastMessage?: MessageDto
  unreadCount: number
  updatedAt: string
}

export interface MessageDto {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  isDeleted: boolean
  createdAt: string
}
```

### 5.2 API Layer (`frontend/src/api/chat.ts`)

```typescript
// GET /api/conversations
export const getConversations = (): Promise<ConversationDto[]>

// POST /api/conversations
export const createConversation = (targetUserId: string): Promise<ConversationDto>

// GET /api/conversations/:id/messages
export const getMessages = (conversationId: string, before?: string, limit = 30): Promise<PagedMessagesDto>

// PUT /api/conversations/:id/read
export const markAsRead = (conversationId: string): Promise<void>
```

### 5.3 SignalR Hook (`frontend/src/hooks/useChatSignalR.ts`)

```typescript
export function useChatSignalR() {
  // Build HubConnection with JWT token from Redux auth state
  // Expose: connection, joinConversation, leaveConversation, sendMessage, typing, markAsRead
  // Subscribe: onReceiveMessage, onUserTyping, onMessageRead
}
```

Dependencies:
```bash
bun add @microsoft/signalr
```

### 5.4 Redux Slice (`frontend/src/store/chatSlice.ts`)

**Why Redux instead of just TanStack Query?**

TanStack Query is great for server-state (fetching, caching, refetching), but chat has a second data source — **SignalR push events** — that Query has no knowledge of. The problem is:

- A `ReceiveMessage` event arrives on the WebSocket. TanStack Query's cache for `["messages", convId]` is now stale, but Query won't re-fetch until the next poll/invalidation.
- You could call `queryClient.invalidateQueries(...)` on every push event, but that triggers a full HTTP round-trip for *every* incoming message — wasteful and adds latency.
- Typing indicators and unread counts change dozens of times per minute. They are **ephemeral UI state**, not server data, so they don't belong in a server-cache at all.

Redux solves this cleanly:
- `appendMessage` action is dispatched directly from the SignalR `onReceiveMessage` handler — **zero extra HTTP calls**, instant render.
- `setTyping` / `markRead` update ephemeral state that is never persisted to the server cache.
- `upsertConversation` keeps the left-panel list in sync (last message preview, unread badge) without re-fetching the whole list.
- The slice is the **single source of truth** that both TanStack Query (initial load) and SignalR (live updates) write into, so the component only reads from one place.

State shape:
```typescript
interface ChatState {
  conversations: ConversationDto[]           // sidebar list, sorted by updatedAt
  activeConversationId: string | null        // which conv panel is open
  messages: Record<string, MessageDto[]>     // conversationId → messages (asc order)
  typingUsers: Record<string, string[]>      // conversationId → [userName] (ephemeral)
  hasMore: Record<string, boolean>           // infinite scroll — more pages available
  nextCursor: Record<string, string | undefined> // cursor for next page load
}
```

Actions: `setConversations`, `upsertConversation`, `appendMessage`, `prependMessages`, `setTyping`, `markRead`

### 5.5 Component Updates (`chats/index.tsx`)

- Replace `conversations` JSON import with `useQuery(['conversations'], getConversations)`
- Replace `ChatUser / Convo` types with `ConversationDto / MessageDto`
- Wire send button to `signalR.sendMessage(...)` (optimistic update via Redux)
- Render typing indicator in message area header
- Show unread badge on conversation list item
- Infinite scroll (load older messages) via `IntersectionObserver` at top of scroll area
- On conversation select: `joinConversation(id)`, `markAsRead(id)`

### 5.6 `NewChat` Component Update

- Replace static `users` list with `GET /api/users/searchable` (or reuse mentor listing)
- On "Chat" button click: call `createConversation(targetUserId)`, then `setActiveConversation(result.id)`

---

## 6. Implementation Order

```
Phase 1 — Database
  [ ] Add Conversation, ConversationParticipant, Message entity models
  [ ] Add DbSets to MentorXContext
  [ ] Add OnModelCreating config (indexes, FK constraints, cascade deletes)
  [ ] dotnet ef migrations add AddChatFeature && dotnet ef database update

Phase 2 — Backend REST
  [ ] ChatService + IChatService
  [ ] ConversationsController (list, create/get, messages, read)
  [ ] Register ChatService in DI

Phase 3 — SignalR
  [ ] ChatHub with all methods
  [ ] Register hub, configure JWT events for SignalR
  [ ] CORS update if needed for WS upgrade

Phase 4 — Frontend Types & API
  [ ] src/types/chat.ts
  [ ] src/api/chat.ts
  [ ] bun add @microsoft/signalr

Phase 5 — Frontend State
  [ ] src/store/chatSlice.ts
  [ ] Register slice in store

Phase 6 — Frontend SignalR Hook
  [ ] src/hooks/useChatSignalR.ts
  [ ] Connection lifecycle tied to auth state

Phase 7 — UI Wiring
  [ ] Update chats/index.tsx — real data, send, scroll, typing
  [ ] Update components/new-chat.tsx — real user search + createConversation
  [ ] Unread badge, typing indicator, message status
```

---

## 7. Access Control Rules

- Users may only start a conversation if they have a **Confirmed** appointment with the target user, **OR** if either party is a verified mentor (keep UX open for platform growth).
- A user can only read/send to conversations they are a participant of — validated in both `ChatHub` and `IChatService`.
- Admin role has no special chat privileges (chat is private).

---

## 8. Key Edge Cases

| Case | Handling |
|---|---|
| Duplicate conversation | `POST /conversations` returns existing conv if one already exists between the two users |
| Message from disconnected client | REST fallback `POST /conversations/{id}/messages` |
| Soft-deleted message | Return `content = "This message was deleted"` and `isDeleted = true` |
| Pagination | Cursor-based (`before` message id) to avoid offset drift on new messages |
| SignalR reconnect | Client re-joins conversation groups on `onreconnected` callback |
| User not in conversation | Hub rejects `SendMessage` with `HubException` |
