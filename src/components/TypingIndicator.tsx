"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TypingUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  isAgentThinking?: boolean;
}

export function TypingIndicator({ typingUsers, isAgentThinking }: TypingIndicatorProps) {
  const [dots, setDots] = useState("");

  // Animate typing dots
  useEffect(() => {
    if (typingUsers.length === 0 && !isAgentThinking) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "") return ".";
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return "";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length, isAgentThinking]);

  if (typingUsers.length === 0 && !isAgentThinking) {
    return null;
  }

  const getTypingText = () => {
    if (isAgentThinking) {
      return `Zero is thinking${dots}`;
    }

    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing${dots}`;
    }

    if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing${dots}`;
    }

    if (typingUsers.length > 2) {
      return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing${dots}`;
    }

    return "";
  };

  return (
    <div className="px-6 pb-4">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        {/* Show avatars for typing users */}
        <div className="flex -space-x-2">
          {isAgentThinking && (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs border-2 border-white">
              🤖
            </div>
          )}
          {typingUsers.slice(0, 3).map((user) => (
            <Avatar key={user.id} className="w-6 h-6 border-2 border-white">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Typing text */}
        <span className="animate-pulse">
          {getTypingText()}
        </span>

        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className={cn(
            "w-1 h-1 bg-gray-400 rounded-full animate-bounce",
            "[animation-delay:-0.3s]"
          )}></div>
          <div className={cn(
            "w-1 h-1 bg-gray-400 rounded-full animate-bounce",
            "[animation-delay:-0.15s]"
          )}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}