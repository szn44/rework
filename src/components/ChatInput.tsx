"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import { useUsers } from "./UserContext";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onTyping?: () => void;
  onStopTyping?: () => Promise<void>;
  placeholder?: string;
  replyToMessage?: string | null;
  onClearReply?: () => void;
}

export function ChatInput({ 
  onSendMessage, 
  onTyping, 
  onStopTyping, 
  placeholder = "Type a message...",
  replyToMessage,
  onClearReply
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { users } = useUsers();

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim() && onTyping) {
      onTyping();
    }
  }, [message, onTyping]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const messageToSend = message.trim();
    setMessage("");
    setIsLoading(true);
    setShowMentions(false);

    try {
      await onSendMessage(messageToSend);
      if (onStopTyping) {
        await onStopTyping();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally restore the message on error
      setMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }

    // Focus back to input
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape") {
      if (showMentions) {
        setShowMentions(false);
        setMentionQuery("");
      } else if (replyToMessage && onClearReply) {
        onClearReply();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Check for @mentions
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(mentionMatch.index || 0);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const insertMention = (username: string) => {
    const beforeMention = message.slice(0, mentionPosition);
    const afterMention = message.slice(mentionPosition + mentionQuery.length + 1);
    const newMessage = `${beforeMention}@${username} ${afterMention}`;
    
    setMessage(newMessage);
    setShowMentions(false);
    setMentionQuery("");
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newPosition = mentionPosition + username.length + 2;
      inputRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Filter users for mention autocomplete
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  // Add @zero as a special mention
  const mentionOptions = [
    { id: "zero", name: "Zero", email: "zero@ai", isAgent: true },
    ...filteredUsers.map(user => ({ 
      id: user.id, 
      name: user.name || user.email?.split('@')[0] || 'User', 
      email: user.email || '',
      isAgent: false 
    }))
  ].filter(option => 
    option.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    option.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Reply indicator */}
      {replyToMessage && (
        <div className="mb-2 p-2 bg-gray-50 dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-bg-tertiary rounded-lg flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
            <span className="font-medium">Replying to message</span>
          </div>
          {onClearReply && (
            <button
              onClick={onClearReply}
              className="p-1 hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary rounded transition-colors"
              aria-label="Cancel reply"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-dark-text-tertiary" />
            </button>
          )}
        </div>
      )}

      {/* Mention autocomplete */}
      {showMentions && mentionOptions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-bg-tertiary rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
          {mentionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => insertMention(option.name)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                option.isAgent 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {option.isAgent ? '🤖' : option.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-dark-text-primary">{option.name}</div>
                {!option.isAgent && (
                                      <div className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">{option.email}</div>
                )}
                {option.isAgent && (
                  <div className="text-xs text-blue-600">AI Assistant</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="w-full flex items-center bg-[#FAFAFA] dark:bg-dark-bg-secondary border border-[#D0D5DD] dark:border-dark-bg-tertiary rounded-2xl px-6 py-2 focus-within:border-[#bdbdbd] dark:focus-within:border-dark-text-tertiary focus-within:shadow-[0_0_0_2px_#ededed] dark:focus-within:shadow-[0_0_0_2px_rgba(130,131,139,0.2)] transition" style={{ minHeight: '56px' }}>
        {/* Plus button */}
        <button
          type="button"
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mr-5"
          tabIndex={-1}
          aria-label="Add attachment"
          style={{ boxShadow: 'none' }}
        >
          <svg data-testid="geist-icon" height="22" width="22" viewBox="0 0 16 16" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 0 0 8 0C12.4183 0 16 3.58172 16 8ZM8.75 4.25V5V7.25H11H11.75V8.75H11H8.75V11V11.75L7.25 11.75V11V8.75H5H4.25V7.25H5H7.25V5V4.25H8.75Z" fill="#0F0F0F"/>
          </svg>
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-dark-text-primary text-base placeholder-[#7E7E81] dark:placeholder-dark-text-tertiary py-0"
          disabled={isLoading}
          style={{ minHeight: 0 }}
          autoComplete="off"
          spellCheck="true"
        />

        {/* Send button */}
        {message.trim() && (
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="ml-3 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary">
        Press Enter to send • Type @ to mention someone • ESC to cancel
      </div>
    </div>
  );
}