"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface ChatInterfaceProps {
  spaceName: string;
  user: User;
}

export function ChatInterface({ spaceName, user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [spaceDisplayName, setSpaceDisplayName] = useState<string>(spaceName);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Resolve space ID from spaceName (which could be ID or slug)
  useEffect(() => {
    const resolveSpaceId = async () => {
      try {
        // First try to find space by ID (if spaceName is already a UUID)
        let { data: space, error } = await supabase
          .from("spaces")
          .select("id, name")
          .eq("id", spaceName)
          .single();

        // If not found by ID, try to find by slug
        if (error || !space) {
          const { data: spaceBySlug, error: slugError } = await supabase
            .from("spaces")
            .select("id, name")
            .eq("slug", spaceName)
            .single();

          if (!slugError && spaceBySlug) {
            space = spaceBySlug;
          }
        }

        if (space) {
          setSpaceId(space.id);
          setSpaceDisplayName(space.name);
        } else {
          console.error("Space not found:", spaceName);
          setSpaceId(null);
        }
      } catch (error) {
        console.error("Error resolving space:", error);
        setSpaceId(null);
      }
    };

    resolveSpaceId();
  }, [spaceName, supabase]);

  // Fetch initial messages
  useEffect(() => {
    if (spaceId) {
      fetchMessages();
    }
  }, [spaceId]);

  // Disable realtime subscription for now due to database permissions
  // This will be re-enabled once database is properly configured
  useEffect(() => {
    // const channel = supabase
    //   .channel(`chat:${spaceName}`)
    //   .on("postgres_changes", ...)
    //   .subscribe();
    // return () => supabase.removeChannel(channel);
  }, [spaceName, supabase]);

  const fetchMessages = async () => {
    if (!spaceId) {
      setLoading(false);
      return;
    }

    try {
      const { data: messagesData, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("channel_id", spaceId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } else {
        setMessages(messagesData || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!spaceId) {
      console.error("Space ID not resolved yet");
      return;
    }

    try {
      // Save message to database
      const { data: savedMessage, error } = await supabase
        .from("chat_messages")
        .insert({
          sender_id: user.id,
          agent_id: null,
          channel_id: spaceId,
          content,
          message_type: "user",
          metadata: {}
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving message:", error);
        return;
      }

      // Add to local state
      if (savedMessage) {
        const userMessage: Message = {
          ...savedMessage,
          user_email: user.email,
        };
        setMessages(prev => [...prev, userMessage]);
        setTimeout(scrollToBottom, 100);
      }

      // Check if message mentions @zero
      if (content.includes("@zero")) {
        setTimeout(async () => {
          const { data: agentMessage, error: agentError } = await supabase
            .from("chat_messages")
            .insert({
              sender_id: null,
              agent_id: "zero",
              channel_id: spaceId,
              content: "Hello! I'm @zero, your AI assistant. I'm ready to help!",
              message_type: "agent",
              metadata: {}
            })
            .select()
            .single();

          if (!agentError && agentMessage) {
            setMessages(prev => [...prev, agentMessage]);
            setTimeout(scrollToBottom, 100);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="w-full flex items-center h-12 px-8 border-b border-gray-200 bg-white" style={{ minHeight: '48px' }}>
        <span className="text-lg text-gray-400 font-bold mr-2">#</span>
        <span className="text-base text-gray-800 font-medium">{spaceDisplayName}</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 w-full bg-white" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4 p-6">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start a conversation!
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="w-full px-0 py-8 bg-white flex items-end justify-center" style={{ minHeight: '80px' }}>
        <div className="w-[96%] max-w-3xl">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}