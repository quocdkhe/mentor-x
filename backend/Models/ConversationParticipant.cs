namespace backend.Models;

public class ConversationParticipant
{
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LastReadAt { get; set; }

    public virtual Conversation Conversation { get; set; }
    public virtual User User { get; set; }
}
