"use client";

import { useState, useEffect } from "react";
import { SyncCompleteIcon } from "@/icons/SyncCompleteIcon";
import { SyncSpinnerIcon } from "@/icons/SyncSpinnerIcon";

export function Status() {
  const [status, setStatus] = useState<"idle" | "synchronizing">("idle");

  // Simple status indicator - could be enhanced to show actual sync status
  useEffect(() => {
    // Listen for form submissions or other sync events
    const handleSubmit = () => {
      setStatus("synchronizing");
      setTimeout(() => setStatus("idle"), 1000);
    };

    // Listen for any form submissions in the document
    document.addEventListener("submit", handleSubmit);
    
    return () => {
      document.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return (
    <div className="flex items-center text-gray-500 font-semibold gap-1.5 text-xs">
      {status === "synchronizing" ? (
        <SyncSpinnerIcon className="w-5 h-5 opacity-80 p-[1px] animate-spin" />
      ) : (
        <SyncCompleteIcon className="w-5 h-5 opacity-80" />
      )}
    </div>
  );
}
