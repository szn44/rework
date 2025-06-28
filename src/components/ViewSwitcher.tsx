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
    <div className="relative inline-flex items-center bg-gray-100 dark:bg-dark-bg-secondary rounded-lg p-1">
      <div
        className={`absolute top-1 bottom-1 bg-white dark:bg-dark-bg-primary rounded-md shadow-sm transition-all duration-200 ease-out ${
          currentView === "list" ? "left-1 right-[50%]" : "left-[50%] right-1"
        }`}
      />
      
      <button
        onClick={() => onViewChange("list")}
        className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md min-w-[70px] ${
          currentView === "list"
            ? "text-gray-900 dark:text-dark-text-primary"
            : "text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:hover:text-dark-text-primary"
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
            ? "text-gray-900 dark:text-dark-text-primary"
            : "text-gray-600 dark:text-dark-text-secondary hover:text-gray-800 dark:hover:text-dark-text-primary"
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