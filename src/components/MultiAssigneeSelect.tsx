"use client";

import { useState, useRef, useEffect } from "react";
import { getUsers } from "@/database";
import { StackedAvatars } from "./StackedAvatars";

interface MultiAssigneeSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function MultiAssigneeSelect({ value, onValueChange }: MultiAssigneeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const users = getUsers();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUser = (userId: string) => {
    if (value.includes(userId)) {
      onValueChange(value.filter(id => id !== userId));
    } else {
      onValueChange([...value, userId]);
    }
  };

  const clearAll = () => {
    onValueChange([]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors text-left min-w-[140px]"
      >
        {value.length === 0 ? (
          <span className="text-neutral-600 text-sm">Not assigned</span>
        ) : (
          <div className="flex items-center gap-2">
            <StackedAvatars assigneeIds={value} maxVisible={2} size="sm" />
            <span className="text-sm text-neutral-900">
              {value.length === 1 
                ? users.find(u => u.id === value[0])?.info.name || "Unknown" 
                : `${value.length} assigned`
              }
            </span>
          </div>
        )}
        <svg 
          className="w-4 h-4 text-neutral-400 ml-auto" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-neutral-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                Assign to
              </span>
              {value.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="py-1">
            {users.map((user) => {
              const isSelected = value.includes(user.id);
              
              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <img 
                      src={user.info.avatar} 
                      alt={user.info.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-neutral-900">{user.info.name}</span>
                  </div>
                  
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-neutral-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 