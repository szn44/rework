"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const messageToSend = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally restore the message on error
      setMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }

    // Focus back to textarea
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full flex items-center bg-[#FAFAFA] border border-[#D0D5DD] rounded-2xl px-6 py-2" style={{ minHeight: '56px' }}>
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
      <input
        ref={inputRef}
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e as unknown as React.KeyboardEvent<HTMLTextAreaElement>)}
        placeholder={`Message #team-chat`}
        className="flex-1 bg-transparent border-none outline-none text-gray-800 text-base placeholder-[#7E7E81] py-0"
        disabled={isLoading}
        style={{ minHeight: 0 }}
      />
    </div>
  );
}