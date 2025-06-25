"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export type ViewType = "list" | "board";

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="relative inline-flex items-center bg-gray-100 rounded-lg p-0.5 shadow-inner">
      <motion.div
        className="absolute inset-y-0.5 bg-white rounded-md shadow-sm border border-gray-200/60"
        layout
        initial={false}
        animate={{
          x: currentView === "list" ? 2 : "calc(100% + 2px)",
          width: "calc(50% - 2px)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />
      
      <button
        onClick={() => onViewChange("list")}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md min-w-[90px] ${
          currentView === "list"
            ? "text-gray-900"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        <span>List</span>
      </button>
      
      <button
        onClick={() => onViewChange("board")}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md min-w-[70px] ${
          currentView === "board"
            ? "text-gray-900"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
        <span>Board</span>
      </button>
    </div>
  );
} 