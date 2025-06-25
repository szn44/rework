"use client";

import { usePathname } from "next/navigation";
import { AIChatSidebar } from "@/components/AIChatSidebar";
import { AIToggleButton } from "@/components/AIToggleButton";

export function ConditionalAIChat() {
  const pathname = usePathname();
  
  // Hide AI chat on spaces pages
  if (pathname.startsWith("/spaces")) {
    return null;
  }

  return (
    <>
      <AIChatSidebar />
      <AIToggleButton />
    </>
  );
} 