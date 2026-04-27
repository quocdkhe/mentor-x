# WebRTC TURN Server Configuration
## For .NET Project Integration

**Domain:** `quocdk.id.vn`  
**Status:** ✅ Tested and working

---

## 🔌 Ports

| Port        | Protocol   | Purpose         |
|-------------|-----------|-----------------|
| 3478        | UDP + TCP | TURN listening  |
| 5349        | TCP       | TURN TLS        |
| 50000-50100 | UDP       | TURN relay      |

---

## 🔐 Credentials

```
Username: testuser
Password: testpass
```

---

## 🎯 WebRTC Client Configuration

### JavaScript
```javascript
const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:quocdk.id.vn:3478",
    username: "testuser",
    credential: "testpass",
  },
];

const pc = new RTCPeerConnection({ iceServers });
```

### .NET
```csharp
public class IceServer
{
    public string[] Urls { get; set; }
    public string Username { get; set; }
    public string Credential { get; set; }
}

var iceServers = new List<IceServer>
{
    new() { Urls = new[] { "stun:stun.l.google.com:19302" } },
    new()
    {
        Urls = new[] { "turn:quocdk.id.vn:3478" },
        Username = "testuser",
        Credential = "testpass"
    }
};
```

---

## 📝 Notes

- **P2P (Direct):** 80-95% of calls
- **TURN Relay:** 5-20% (fallback only)
- Replace credentials before production
