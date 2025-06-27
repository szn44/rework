"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  sender_id: string | null;
  agent_id: string | null;
  channel_id: string;
  content: string;
  message_type: string;
  created_at: string;
  user_email?: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const isAgent = message.message_type === "agent" || message.agent_id !== null;
  
  const getDisplayName = () => {
    if (isAgent) return "Zero";
    if (isCurrentUser) return "You";
    return message.user_email?.split("@")[0] || "User";
  };

  const getAvatarContent = () => {
    if (isAgent) return "🤖";
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex gap-3 group hover:bg-muted/50 -mx-3 px-3 py-1.5 rounded-md transition-colors">
      {/* Avatar */}
      <Avatar className="h-8 w-8 mt-0.5">
        <AvatarImage src={isAgent ? undefined : `https://api.dicebear.com/7.x/initials/svg?seed=${getDisplayName()}`} />
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isAgent ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
        )}>
          {getAvatarContent()}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-sm font-medium",
            isAgent ? "text-blue-600" : "text-foreground"
          )}>
            {getDisplayName()}
            {isAgent && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">
                BOT
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Message Text */}
        <div className={cn(
          "text-sm text-foreground whitespace-pre-wrap",
          isAgent && "italic text-muted-foreground"
        )}>
          {message.content}
        </div>
      </div>
    </div>
  );
}