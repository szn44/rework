"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useUsers } from "@/components/UserContext";

interface TypingUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function useTypingIndicator(spaceId: string | null, currentUser: User) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const supabase = createClient();
  const { getUserById } = useUsers();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Clean up typing indicator when user stops typing
  const stopTyping = useCallback(async () => {
    if (!spaceId || !isTypingRef.current) return;

    try {
      await supabase
        .from("typing_indicators")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("channel_id", spaceId);

      isTypingRef.current = false;
    } catch (error) {
      console.error("Error stopping typing indicator:", error);
    }
  }, [spaceId, currentUser.id, supabase]);

  // Set typing indicator
  const handleTyping = useCallback(async () => {
    if (!spaceId) return;

    try {
      // Upsert typing indicator
      await supabase
        .from("typing_indicators")
        .upsert({
          user_id: currentUser.id,
          channel_id: spaceId,
          is_typing: true,
          last_activity: new Date().toISOString()
        }, {
          onConflict: "user_id,channel_id"
        });

      isTypingRef.current = true;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(stopTyping, 3000);
    } catch (error) {
      console.error("Error setting typing indicator:", error);
    }
  }, [spaceId, currentUser.id, supabase, stopTyping]);

  // Subscribe to typing indicators for this space
  useEffect(() => {
    if (!spaceId) return;

    const fetchTypingUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("typing_indicators")
          .select("user_id, last_activity")
          .eq("channel_id", spaceId)
          .eq("is_typing", true)
          .neq("user_id", currentUser.id)
          .gte("last_activity", new Date(Date.now() - 5000).toISOString()); // Only show if active within 5 seconds

        if (!error && data) {
          const users: TypingUser[] = data.map((item: any) => {
            const user = getUserById(item.user_id);
            return {
              id: item.user_id,
              name: user?.name || user?.email?.split('@')[0] || 'User',
              email: user?.email || '',
              avatar: user?.avatar
            };
          });
          setTypingUsers(users);
        }
      } catch (error) {
        console.error("Error fetching typing users:", error);
      }
    };

    // Initial fetch
    fetchTypingUsers();

    // Set up real-time subscription
    const channel = supabase
      .channel(`typing:${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `channel_id=eq.${spaceId}`
        },
        () => {
          // Refetch typing users when changes occur
          fetchTypingUsers();
        }
      )
      .subscribe();

    // Clean up old typing indicators every 10 seconds
    const cleanupInterval = setInterval(async () => {
      try {
        await supabase
          .from("typing_indicators")
          .delete()
          .eq("channel_id", spaceId)
          .lt("last_activity", new Date(Date.now() - 10000).toISOString());
      } catch (error) {
        console.error("Error cleaning up typing indicators:", error);
      }
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [spaceId, currentUser.id, supabase, getUserById]);

  // Clean up typing indicator when component unmounts or space changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return {
    typingUsers,
    handleTyping,
    stopTyping
  };
}