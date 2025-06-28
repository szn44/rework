"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUsers } from "./UserContext";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { TypingIndicator } from "./TypingIndicator";

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

interface ChatInterfaceProps {
  spaceName: string;
  user: User;
}

export function ChatInterface({ spaceName, user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [spaceDisplayName, setSpaceDisplayName] = useState<string>(spaceName);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { users, getUserById } = useUsers();
  const { typingUsers, handleTyping, stopTyping } = useTypingIndicator(spaceId, user);

  // Helper function to determine if messages should be stacked
  const shouldStackMessage = (currentMessage: Message, previousMessage: Message | null): boolean => {
    if (!previousMessage) return false;
    
    // Stack if same sender and within 5 minutes
    const currentTime = new Date(currentMessage.created_at).getTime();
    const previousTime = new Date(previousMessage.created_at).getTime();
    const timeDiff = currentTime - previousTime;
    const fiveMinutes = 5 * 60 * 1000;
    
    return (
      currentMessage.sender_id === previousMessage.sender_id &&
      currentMessage.message_type === previousMessage.message_type &&
      timeDiff < fiveMinutes
    );
  };

  // Enhance messages with user information
  const enhanceMessages = (messages: Message[]): Message[] => {
    return messages.map(message => {
      if (message.sender_id) {
        const messageUser = getUserById(message.sender_id);
        return {
          ...message,
          user_email: message.user_email || messageUser?.email || user.email,
          user: messageUser || {
            id: message.sender_id,
            name: message.user_email?.split('@')[0] || 'User',
            email: message.user_email || '',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${message.user_email}`
          }
        };
      }
      return message;
    });
  };

  // Extract mentions from message content
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    console.log("ChatInterface - Extracted mentions:", mentions, "from content:", content);
    return mentions;
  };

  // Save mentions to database
  const saveMentions = async (messageId: string, mentions: string[]) => {
    try {
      const mentionData = await Promise.all(
        mentions.map(async (username) => {
          // Try to find user by username/email
          const mentionedUser = users.find(u => 
            u.email?.split('@')[0].toLowerCase() === username.toLowerCase() ||
            u.name?.toLowerCase() === username.toLowerCase()
          );

          return {
            message_id: messageId,
            mentioned_user_id: mentionedUser?.id || null,
            mentioned_username: username
          };
        })
      );

      if (mentionData.length > 0) {
        const { error } = await supabase
          .from("message_mentions")
          .insert(mentionData);

        if (error) {
          console.error("Error saving mentions:", error);
        }
      }
    } catch (error) {
      console.error("Error processing mentions:", error);
    }
  };

  // Handle emoji reactions
  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      // Check if user already reacted with this emoji
      const { data: existingReaction } = await supabase
        .from("message_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji)
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from("message_reactions")
          .delete()
          .eq("id", existingReaction.id);
      } else {
        // Add reaction
        await supabase
          .from("message_reactions")
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji: emoji
          });
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  // Handle reply to message
  const handleReply = (messageId: string) => {
    setReplyToMessage(messageId);
    // Focus the input (implementation depends on ChatInput component)
  };

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

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!spaceId) return;

    const channel = supabase
      .channel(`chat:${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${spaceId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id !== user.id) {
            setMessages(prev => {
              const enhanced = enhanceMessages([newMessage]);
              return [...prev, ...enhanced];
            });
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId, user.id, supabase]);

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
        const enhanced = enhanceMessages(messagesData || []);
        setMessages(enhanced);
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
      // Extract mentions from the message
      const mentions = extractMentions(content);

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

      // Save mentions to database
      if (savedMessage && mentions.length > 0) {
        await saveMentions(savedMessage.id, mentions);
      }

      // Add to local state immediately
      if (savedMessage) {
        const currentUserData = getUserById(user.id);
        const userMessage: Message = {
          ...savedMessage,
          user_email: user.email,
          user: currentUserData || {
            id: user.id,
            name: user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
          }
        };
        setMessages(prev => [...prev, userMessage]);
        setTimeout(scrollToBottom, 100);
      }

      // Check if message mentions @zero or other agents (case-insensitive)
      if (mentions.some(mention => mention.toLowerCase() === "zero")) {
        console.log("ChatInterface - Zero mention detected, triggering AI response...");
        setIsAgentThinking(true);
        
        // Remove timeout delay to see if that helps
        (async () => {
          try {
            console.log("ChatInterface - Making AI API call...");
            // Call AI API for context-aware response
            const response = await fetch("/api/ai", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Ensure cookies are sent
              body: JSON.stringify({
                message: content,
                spaceId: spaceId,
                spaceName: spaceDisplayName,
                userId: user.id,
                userEmail: user.email,
                recentMessages: messages.slice(-10).map(m => ({
                  role: m.message_type === 'ai' ? 'assistant' : 'user',
                  content: m.content,
                  timestamp: m.created_at
                }))
              }),
            });

            console.log("ChatInterface - AI API response status:", response.status);
            if (response.ok) {
              const { content: aiResponse } = await response.json();
              console.log("ChatInterface - AI response received:", aiResponse.substring(0, 100) + "...");
              
              const { data: agentMessage, error: agentError } = await supabase
                .from("chat_messages")
                .insert({
                  sender_id: null,
                  agent_id: "00000000-0000-0000-0000-000000000000", // Zero agent UUID
                  channel_id: spaceId,
                  content: aiResponse,
                  message_type: "ai",
                  metadata: { agent_name: "zero" }
                })
                .select()
                .single();

              if (!agentError && agentMessage) {
                setMessages(prev => [...prev, agentMessage]);
                setTimeout(scrollToBottom, 100);
              } else {
                console.error("Agent message insert error:", agentError);
                setMessages(prev => [...prev, {
                  id: `error-${Date.now()}`,
                  sender_id: null,
                  agent_id: "00000000-0000-0000-0000-000000000000",
                  channel_id: spaceId,
                  content: "Sorry, I encountered an error while responding. Please try again.",
                  message_type: "ai",
                  created_at: new Date().toISOString(),
                }]);
              }
            } else {
              const errorText = await response.text();
              console.error("AI API error:", response.status, response.statusText, errorText);
              console.error("AI API request details:", {
                url: "/api/ai",
                method: "POST",
                spaceId,
                spaceName: spaceDisplayName,
                userId: user.id,
                userEmail: user.email
              });
              
              // Specific error message based on status
              let errorMessage = "I'm having trouble connecting to my AI services right now. Please try again in a moment!";
              if (response.status === 401) {
                errorMessage = "Authentication error. Please try refreshing the page and logging in again.";
              } else if (response.status === 500) {
                errorMessage = "I'm experiencing technical difficulties. Please try again in a moment.";
              }
              
              // Fallback response
              const { data: agentMessage, error: agentError } = await supabase
                .from("chat_messages")
                .insert({
                  sender_id: null,
                  agent_id: "00000000-0000-0000-0000-000000000000", // Zero agent UUID
                  channel_id: spaceId,
                  content: errorMessage,
                  message_type: "ai",
                  metadata: { agent_name: "zero" }
                })
                .select()
                .single();
                
              if (!agentError && agentMessage) {
                setMessages(prev => [...prev, agentMessage]);
                setTimeout(scrollToBottom, 100);
              } else {
                setMessages(prev => [...prev, {
                  id: `error-${Date.now()}`,
                  sender_id: null,
                  agent_id: "00000000-0000-0000-0000-000000000000",
                  channel_id: spaceId,
                  content: "I'm currently unavailable. Please try again later.",
                  message_type: "ai",
                  created_at: new Date().toISOString(),
                }]);
              }
            }
          } catch (error) {
            console.error("Error generating AI response:", error);
            console.error("Error details:", {
              name: error instanceof Error ? error.name : 'Unknown',
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            });
            setMessages(prev => [...prev, {
              id: `error-${Date.now()}`,
              sender_id: null,
              agent_id: "00000000-0000-0000-0000-000000000000",
              channel_id: spaceId,
              content: "I encountered an unexpected error. Please try again.",
              message_type: "ai",
              created_at: new Date().toISOString(),
            }]);
          } finally {
            setIsAgentThinking(false);
          }
        })();
      } else {
        console.log("ChatInterface - No zero mention found in:", mentions);
      }

      // Clear reply state
      setReplyToMessage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-bg-primary">
      {/* Chat Header */}
      <div className="w-full flex items-center h-12 px-8 border-b border-gray-200 dark:border-dark-bg-tertiary bg-white dark:bg-dark-bg-primary" style={{ minHeight: '48px' }}>
        <span className="text-lg text-gray-400 dark:text-dark-text-tertiary font-bold mr-2">#</span>
        <span className="text-base text-gray-800 dark:text-dark-text-primary font-medium">{spaceDisplayName}</span>
        <div className="ml-auto text-xs text-gray-500 dark:text-dark-text-secondary">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 w-full bg-white dark:bg-dark-bg-primary" ref={scrollAreaRef}>
        <div className="flex flex-col p-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <div className="text-4xl mb-4">💬</div>
              <div className="text-lg font-medium mb-2">Welcome to #{spaceDisplayName}</div>
              <div className="text-sm">This is the beginning of your conversation.</div>
            </div>
          ) : (
            messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const isStacked = shouldStackMessage(message, previousMessage);
              const isCurrentUser = message.sender_id === user.id;
              
              return (
                <ChatMessage 
                  key={message.id} 
                  message={message}
                  isCurrentUser={isCurrentUser}
                  isStacked={isStacked}
                  showAvatar={!isStacked}
                  previousMessage={previousMessage}
                  onReaction={handleReaction}
                  onReply={handleReply}
                />
              );
            })
          )}
        </div>
        
        {/* Typing Indicators */}
        <TypingIndicator 
          typingUsers={typingUsers} 
          isAgentThinking={isAgentThinking}
        />
      </ScrollArea>

      {/* Chat Input */}
      <div className="w-full px-0 py-8 bg-white flex items-end justify-center" style={{ minHeight: '80px' }}>
        <div className="w-[96%] max-w-3xl">
          <ChatInput 
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onStopTyping={stopTyping}
            placeholder={`Message #${spaceDisplayName}`}
            replyToMessage={replyToMessage}
            onClearReply={() => setReplyToMessage(null)}
          />
        </div>
      </div>
    </div>
  );
}