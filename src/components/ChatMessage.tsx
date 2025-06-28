"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isToday, isYesterday, isSameDay } from "date-fns";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUsers } from "./UserContext";

interface Message {
  id: string;
  sender_id: string | null;
  agent_id: string | null;
  channel_id: string;
  content: string;
  message_type: string;
  created_at: string;
  user_email?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  count: number;
  users: string[];
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser?: boolean;
  isStacked?: boolean;
  showAvatar?: boolean;
  previousMessage?: Message | null;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
}

export function ChatMessage({ 
  message, 
  isCurrentUser = false, 
  isStacked = false, 
  showAvatar = true,
  previousMessage,
  onReaction,
  onReply
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loadingReaction, setLoadingReaction] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();
  const { getUserById } = useUsers();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, [supabase]);
  
  const isAgent = message.message_type === "ai" || message.agent_id === "00000000-0000-0000-0000-000000000000";
  const messageDate = new Date(message.created_at);
  
  const getDisplayName = () => {
    if (isAgent) return "Zero";
    if (message.user?.name) return message.user.name;
    if (isCurrentUser) return "You";
    return message.user_email?.split("@")[0] || "User";
  };

  const getAvatarContent = () => {
    if (isAgent) return "🤖";
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getAvatarUrl = () => {
    if (isAgent) return undefined;
    if (message.user?.avatar) return message.user.avatar;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${getDisplayName()}`;
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm");
  };

  // Load reactions for this message
  useEffect(() => {
    loadReactions();
  }, [message.id]);

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from("message_reactions")
        .select("id, emoji, user_id")
        .eq("message_id", message.id);

      if (!error && data) {
        // Group reactions by emoji
        const grouped = data.reduce((acc: Record<string, Reaction>, reaction: any) => {
          const emoji = reaction.emoji;
          if (!acc[emoji]) {
            acc[emoji] = {
              id: emoji,
              emoji,
              user_id: reaction.user_id,
              count: 0,
              users: []
            };
          }
          acc[emoji].count++;
          acc[emoji].users.push(reaction.user_id);
          return acc;
        }, {});

        setReactions(Object.values(grouped));
      }
    } catch (error) {
      console.error("Error loading reactions:", error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (loadingReaction || !currentUserId) return;
    setLoadingReaction(emoji);

    try {
      // Check if current user already reacted with this emoji
      const existingReaction = reactions.find(r => 
        r.emoji === emoji && r.users.includes(currentUserId)
      );

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", message.id)
          .eq("emoji", emoji)
          .eq("user_id", currentUserId);
      } else {
        // Add reaction
        await supabase
          .from("message_reactions")
          .insert({
            message_id: message.id,
            emoji: emoji,
            user_id: currentUserId
          });
      }

      // Reload reactions
      await loadReactions();
      onReaction?.(message.id, emoji);
    } catch (error) {
      console.error("Error handling reaction:", error);
    } finally {
      setLoadingReaction(null);
    }
  };

  const parseMessageContent = (content: string) => {
    // Parse @mentions and highlight them
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        return (
          <span
            key={index}
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold px-1 rounded"
            aria-label="mention"
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  // Check if we need a day separator
  const needsDaySeparator = () => {
    if (!previousMessage) return false;
    const prevDate = new Date(previousMessage.created_at);
    return !isSameDay(messageDate, prevDate);
  };

  const getDaySeparatorText = () => {
    if (isToday(messageDate)) return "Today";
    if (isYesterday(messageDate)) return "Yesterday";
    return format(messageDate, "EEEE, MMMM d");
  };

  return (
    <>
      {/* Day Separator */}
      {needsDaySeparator() && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-dark-text-secondary">
            <div className="h-px bg-gray-200 dark:bg-dark-bg-tertiary flex-1"></div>
            <span className="bg-white dark:bg-dark-bg-secondary px-3 py-1 rounded-full border border-gray-200 dark:border-dark-bg-tertiary font-medium">
              {getDaySeparatorText()}
            </span>
            <div className="h-px bg-gray-200 dark:bg-dark-bg-tertiary flex-1"></div>
          </div>
        </div>
      )}

      {/* Message */}
      <div 
        className={cn(
          "group relative",
          isStacked ? "py-0.5 mt-1" : "py-2"
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex gap-3 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary -mx-4 px-4 py-1 rounded-md transition-colors">
          {/* Avatar or spacer */}
          <div className="w-8 flex justify-center mt-0.5">
            {showAvatar && !isStacked ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarUrl()} />
                <AvatarFallback className={cn(
                  "text-xs font-medium",
                  isAgent ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                )}>
                  {getAvatarContent()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="text-xs text-gray-400 dark:text-dark-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(messageDate)}
              </span>
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* Header - only show for non-stacked messages */}
            {!isStacked && (
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-sm font-semibold",
                  isAgent ? "text-blue-600" : "text-gray-900 dark:text-dark-text-primary"
                )}>
                  {getDisplayName()}
                  {isAgent && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-medium">
                      BOT
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  {formatTime(messageDate)}
                </span>
              </div>
            )}

            {/* Message Text */}
            <div className={cn(
              "text-sm text-gray-900 dark:text-dark-text-primary whitespace-pre-wrap leading-relaxed",
              isAgent && "text-gray-700 dark:text-dark-text-secondary"
            )}>
              {parseMessageContent(message.content)}
            </div>

            {/* Reactions */}
            {reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {reactions.map((reaction) => (
                  <button
                    key={reaction.emoji}
                    onClick={() => handleReaction(reaction.emoji)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors",
                      reaction.users.includes(currentUserId || "")
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400"
                        : "bg-gray-50 dark:bg-dark-bg-secondary border-gray-200 dark:border-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                    )}
                    disabled={loadingReaction === reaction.emoji}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="font-medium">{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar - shows on hover */}
        {showActions && (
          <div className="absolute top-0 right-4 bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-bg-tertiary rounded-lg shadow-lg p-1 flex items-center gap-1 z-10">
            <button
              onClick={() => handleReaction("❤️")}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded text-sm transition-colors"
              title="React with heart"
            >
              ❤️
            </button>
            <button
              onClick={() => handleReaction("👍")}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded text-sm transition-colors"
              title="React with thumbs up"
            >
              👍
            </button>
            <button
              onClick={() => handleReaction("🚀")}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded text-sm transition-colors"
              title="React with rocket"
            >
              🚀
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-dark-bg-tertiary mx-1"></div>
            <button
              onClick={() => onReply?.(message.id)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded text-xs font-medium text-gray-600 dark:text-dark-text-secondary transition-colors"
              title="Reply to message"
            >
              💬 Reply
            </button>
          </div>
        )}
      </div>
    </>
  );
}