"use client";

import { useAISidebar } from "./AISidebarContext";

export function AIToggleButton() {
  const { isOpen, setIsOpen, setIsMinimized } = useAISidebar();

  // Only show button when chat is completely closed
  if (isOpen) {
    return null;
  }

  const handleOpenChat = () => {
    setIsMinimized(false); // Ensure chat opens in expanded mode
    setIsOpen(true);
  };

  return (
    <button
      onClick={handleOpenChat}
      className="fixed bottom-4 right-4 z-40 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white group"
      aria-label="Open AI Chat"
    >
      <div className="relative">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse group-hover:animate-none"></div>
      </div>
    </button>
  );
} 