"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { PRIORITY_STATES, LABELS, PROJECTS, RoomWithMetadata } from "@/config";
import { StackedAvatars } from "./StackedAvatars";
import { useNavigation } from "./NavigationContext";

interface KanbanCardProps {
  room: RoomWithMetadata;
  metadata: {
    issueId: string;
    title: string;
    priority: string;
    progress: string;
    assignedTo: string[];
    labels: string[];
    project?: string;
  };
  type: "issue" | "project";
}

export function KanbanCard({ room, metadata, type }: KanbanCardProps) {
  const { navigateToIssue } = useNavigation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: room.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const date = (() => {
    const createdAt = room.createdAt;
    if (typeof createdAt === 'string') {
      return new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (createdAt instanceof Date) {
      return createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  })();

  const priorityState = PRIORITY_STATES.find((p) => p.id === metadata.priority);

  const cardStyle = {
    ...style,
    boxShadow: isDragging 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      : '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 1px rgba(0, 0, 0, 0.06)',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Determine the source context based on current URL
    const currentPath = window.location.pathname;
    let sourceContext = 'kanban';
    
    if (currentPath.startsWith('/spaces/')) {
      const spaceId = currentPath.split('/spaces/')[1];
      sourceContext = `space-${spaceId}`;
    }
    
    navigateToIssue(metadata.issueId, sourceContext);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={cardStyle}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -1, boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 2px 2px -1px rgba(0, 0, 0, 0.06)' }}
      className={`group relative bg-white rounded-xl border-0 transition-all duration-200 cursor-pointer ${
        isDragging ? "opacity-50 scale-105 rotate-2 z-50" : ""
      }`}
    >
      {/* Drag Handle Indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-4 h-4 rounded-md bg-gray-50 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </div>

      <button
        onClick={handleCardClick}
        className="block p-3.5 space-y-3 w-full text-left"
      >
        {/* Header with Priority and ID */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {priorityState && (
              <div className="flex-shrink-0 w-3.5 h-3.5 opacity-70">
                {priorityState.icon}
              </div>
            )}
            <span className="text-xs font-mono text-gray-500 tracking-wide font-medium">
              {metadata.issueId}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">{date}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {metadata.title}
        </h3>

        {/* Labels and Project */}
        {(metadata.labels.length > 0 || metadata.project) && (
          <div className="flex flex-wrap gap-1.5">
            {metadata.project && PROJECTS.find(p => p.id === metadata.project) && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50/80 border border-blue-100 rounded-md text-xs font-medium text-blue-700">
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: PROJECTS.find(p => p.id === metadata.project)?.color }}
                />
                {PROJECTS.find(p => p.id === metadata.project)?.name}
              </div>
            )}
            {LABELS.filter((label) => metadata.labels.includes(label.id)).slice(0, 2).map(
              ({ id, text }) => (
                <div
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50/80 border border-gray-100 rounded-md text-xs font-medium text-gray-600"
                >
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  {text}
                </div>
              )
            )}
            {metadata.labels.length > 2 && (
              <div className="inline-flex items-center px-2 py-0.5 bg-gray-50/80 border border-gray-100 rounded-md text-xs font-medium text-gray-500">
                +{metadata.labels.length - 2}
              </div>
            )}
          </div>
        )}

        {/* Footer with Assignees */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex-shrink-0">
            <StackedAvatars 
              assigneeIds={metadata.assignedTo} 
              maxVisible={3} 
              size="sm"
            />
          </div>
          
          {/* Hover Effect Indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* Dragging Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-50/60 border-2 border-blue-200 border-dashed rounded-xl pointer-events-none backdrop-blur-sm" />
      )}
    </motion.div>
  );
} 