import { Chats } from "@/components/features/chats";
import { createLazyRoute } from "@tanstack/react-router";   

export default function MenteeChat() {
  return (
    <div className="container mx-auto px-4">
      <Chats />
    </div>
  );
}

export const Route = createLazyRoute("/user/chat")({
  component: MenteeChat,
});
