"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function Presence() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    getCurrentUser();
  }, []);

  if (!currentUser) {
    return <div className="w-7 h-7 bg-neutral-100 animate-pulse rounded-full" />;
  }

  // For now, just show the current user. Later we can implement presence tracking
  return (
    <div className="flex">
      <div className="relative">
        <Avatar 
          src={currentUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
          name={currentUser.email || "User"} 
        />
      </div>
    </div>
  );
}

type AvatarProps = { src: string; name: string };

function Avatar({ src, name }: AvatarProps) {
  return (
    <div className="shrink-0 relative rounded-full border-2 border-neutral-50">
      <img src={src} className="w-7 h-7 rounded-full" alt={name} />
    </div>
  );
}
