"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { KanbanCard } from "./KanbanCard";
import { IssueItem } from "@/config";
import { useWorkspace } from "./WorkspaceContext";
import { useSpace } from "./SpaceContext";
import { useState } from "react";

interface KanbanColumnProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  items: IssueItem[];
  type: "issue" | "project";
}

export function KanbanColumn({ id, title, icon, color, items, type }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [isCreating, setIsCreating] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const { currentSpace } = useSpace();

  const handleCreateItem = async () => {
    if (isCreating) return; // Prevent multiple clicks
    
    if (type === "issue") {
      setIsCreating(true);
      try {
        const response = await fetch('/api/create-issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            workspace_id: currentWorkspace?.id,
            space_id: currentSpace?.id || null,
            status: id,
            title: 'Untitled'
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.issueId) {
            // Redirect to the new issue
            window.location.href = `/issue/${result.issueId}`;
          }
        } else {
          console.error('Failed to create issue:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating issue:', error);
      } finally {
        setIsCreating(false);
      }
    }
    // TODO: Add project creation logic
  };

  return (
    <div className="flex flex-col w-64 sm:w-72 lg:w-80 h-full">
      {/* Column Header - Compact styling to match image */}
      <div className="flex-shrink-0 mb-3">
        <div 
          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm transition-all duration-200 hover:bg-white/80"
          style={{ 
            backgroundColor: `${color}06`,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0 p-1 rounded-lg" style={{ backgroundColor: `${color}15` }}>
              <div style={{ color }} className="w-4 h-4 flex items-center justify-center">
                {icon}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800 text-sm">{title}</span>
              <span 
                className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                {items.length}
              </span>
            </div>
          </div>
          
          {/* Add Item Button - Smaller to match image */}
          <button
            onClick={handleCreateItem}
            disabled={isCreating}
            className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
            title={`Add ${type}`}
          >
            {isCreating ? (
              <div className="w-2.5 h-2.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Drop Zone with colored background that extends based on cards */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 flex flex-col transition-all duration-200 rounded-xl relative ${
          isOver 
            ? "border-2 border-blue-200/50 border-dashed shadow-inner" 
            : "border-0"
        }`}
        style={{
          backgroundColor: `${color}08`,
          boxShadow: isOver 
            ? 'inset 0 1px 2px rgba(59, 130, 246, 0.08)' 
            : 'none',
        }}
      >
        {/* Colored background that extends based on content */}
        <div 
          className="absolute inset-0 rounded-xl transition-all duration-300"
          style={{
            backgroundColor: `${color}05`,
            height: items.length > 0 ? '100%' : '60px'
          }}
        />
        
        <SortableContext items={items.map(item => item.metadata.issueId)} strategy={verticalListSortingStrategy}>
          <div className="relative z-10 p-2.5 space-y-2.5 overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}>
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.metadata.issueId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    layout: { type: "spring", stiffness: 400, damping: 30 },
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 }
                  }}
                >
                  <KanbanCard
                    issue={item}
                    type={type}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State - More compact */}
            {items.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="text-gray-300 mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400 font-medium mb-1">No {type}s yet</p>
                <p className="text-xs text-gray-400">
                  Drop {type}s here or click + to create
                </p>
              </motion.div>
            )}

            {/* Drop Indicator - More subtle */}
            {isOver && items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-16 border-2 border-blue-200/50 border-dashed rounded-xl bg-blue-50/40 flex items-center justify-center mx-1 mb-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-600 text-xs font-medium">Drop here</span>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </motion.div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
} 