"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { IssueItem } from "@/config";
import { useNavigation } from "./NavigationContext";
import { ProgressTodoIcon } from "@/icons/ProgressTodoIcon";
import { ProgressInProgressIcon } from "@/icons/ProgressInProgressIcon";
import { ProgressInReviewIcon } from "@/icons/ProgressInReviewIcon";
import { ProgressDoneIcon } from "@/icons/ProgressDoneIcon";

interface KanbanBoardProps {
  items: IssueItem[];
  type: "issue" | "project";
  onProgressChange?: (issueId: string, newProgress: string) => void;
}

const ISSUE_COLUMNS = [
  {
    id: "todo",
    title: "Todo",
    icon: <ProgressTodoIcon className="w-4 h-4" />,
    color: "#6B7280",
    statuses: ["todo", "none"],
  },
  {
    id: "progress",
    title: "In Progress",
    icon: <ProgressInProgressIcon className="w-4 h-4" />,
    color: "#F59E0B",
    statuses: ["progress"],
  },
  {
    id: "review",
    title: "In Review",
    icon: <ProgressInReviewIcon className="w-4 h-4" />,
    color: "#10B981",
    statuses: ["review"],
  },
  {
    id: "done",
    title: "Done",
    icon: <ProgressDoneIcon className="w-4 h-4" />,
    color: "#6366F1",
    statuses: ["done"],
  },
];

const PROJECT_COLUMNS = [
  {
    id: "not-started",
    title: "Not Started",
    icon: <ProgressTodoIcon className="w-4 h-4" />,
    color: "#6B7280",
    statuses: ["not-started"],
  },
  {
    id: "in-progress",
    title: "In Progress",
    icon: <ProgressInProgressIcon className="w-4 h-4" />,
    color: "#F59E0B",
    statuses: ["in-progress"],
  },
  {
    id: "on-hold",
    title: "On Hold",
    icon: <ProgressInReviewIcon className="w-4 h-4" />,
    color: "#EF4444",
    statuses: ["on-hold"],
  },
  {
    id: "completed",
    title: "Completed",
    icon: <ProgressDoneIcon className="w-4 h-4" />,
    color: "#10B981",
    statuses: ["completed"],
  },
];

export function KanbanBoard({ items, type, onProgressChange }: KanbanBoardProps) {
  const { navigateToIssue } = useNavigation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState(items);

  const columns = type === "issue" ? ISSUE_COLUMNS : PROJECT_COLUMNS;

  // Sync localItems with items prop when it changes
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group items by column
  const columnItems = useMemo(() => {
    const grouped: Record<string, typeof items> = {};
    
    columns.forEach(column => {
      grouped[column.id] = localItems.filter(item => 
        column.statuses.includes(item.metadata.progress)
      );
    });
    
    return grouped;
  }, [localItems, columns]);

  const activeItem = useMemo(() => {
    return localItems.find(item => item.metadata.issueId === activeId);
  }, [activeId, localItems]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find which columns the active and over items belong to
    const activeColumn = columns.find(col => 
      columnItems[col.id]?.some(item => item.metadata.issueId === activeId)
    );
    const overColumn = columns.find(col => col.id === overId) || 
                      columns.find(col => 
                        columnItems[col.id]?.some(item => item.metadata.issueId === overId)
                      );
    
    if (!activeColumn || !overColumn || activeColumn === overColumn) return;
    
    // Move item between columns
    setLocalItems(prevItems => {
      const activeItem = prevItems.find(item => item.metadata.issueId === activeId);
      if (!activeItem) return prevItems;
      
      const updatedItem = {
        ...activeItem,
        metadata: {
          ...activeItem.metadata,
          progress: overColumn.statuses[0], // Use the first status from the column
        },
      };
      
      return prevItems.map(item => 
        item.metadata.issueId === activeId ? updatedItem : item
      );
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) {
      console.log('No drop target found');
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    console.log('Drag ended:', { activeId, overId });
    
    // CRITICAL FIX: Find the active item from ORIGINAL items, not local items
    // This prevents comparison against optimistically updated local state
    const activeItem = items.find(item => item.metadata.issueId === activeId);
    if (!activeItem) {
      console.log('Active item not found in original items:', activeId);
      return;
    }
    
    console.log('🚀 KANBAN: Active item found:', activeItem.metadata.title);
    console.log('🚀 KANBAN: ORIGINAL item metadata (server state):', activeItem.metadata);
    
    // Determine target column - first check if dropping directly on a column
    let targetColumn = columns.find(col => col.id === overId);
    
    if (!targetColumn) {
      // If not dropping on column, check if dropping on an item and find its column
      for (const column of columns) {
        if (columnItems[column.id]?.some(item => item.metadata.issueId === overId)) {
          targetColumn = column;
          break;
        }
      }
    }
    
    if (!targetColumn) {
      console.log('🚀 KANBAN: Target column not found for overId:', overId);
      return;
    }
    
    console.log('🚀 KANBAN: Target column found:', targetColumn.title);
    console.log('🚀 KANBAN: Target column statuses:', targetColumn.statuses);
    
    // Get the new progress value
    const newProgress = targetColumn.statuses[0];
    const currentProgress = activeItem.metadata.progress; // This is now from original server state!
    
    console.log('🚀 KANBAN: CRITICAL - Progress comparison (FIXED):');
    console.log('🚀 KANBAN: Current progress (server state):', `"${currentProgress}"`);
    console.log('🚀 KANBAN: New progress:', `"${newProgress}"`);
    console.log('🚀 KANBAN: Are they equal?', currentProgress === newProgress);
    
    // Only update if progress actually changed
    if (currentProgress !== newProgress) {
      console.log('🚀 KANBAN: Progress change detected!');
      console.log('🚀 KANBAN: activeId (room ID):', activeId);
      console.log('🚀 KANBAN: from:', currentProgress, 'to:', newProgress);
      
      // Immediately update local state for optimistic UI
      setLocalItems(prevItems => 
        prevItems.map(item => 
          item.metadata.issueId === activeId 
            ? {
                ...item,
                metadata: {
                  ...item.metadata,
                  progress: newProgress,
                },
              }
            : item
        )
      );
      
      // Call the progress change handler
      if (onProgressChange) {
        console.log('🚀 KANBAN: Calling onProgressChange with issueId:', activeId);
        onProgressChange(activeId, newProgress);
      } else {
        console.error('🚀 KANBAN: ERROR - onProgressChange handler is not provided!');
      }
    } else {
      console.log('🚀 KANBAN: No progress change needed (server state matches target)');
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Board Container - Responsive with proper overflow handling */}
        <div className="flex-1 min-h-0 overflow-x-auto p-3 sm:p-4">
          <div className="flex gap-2.5 sm:gap-3 lg:gap-4 h-full min-w-max">
            {columns.map((column) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: columns.indexOf(column) * 0.1 }}
                className="flex-shrink-0"
              >
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  icon={column.icon}
                  color={column.color}
                  items={columnItems[column.id] || []}
                  type={type}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem && (
            <div className="rotate-3 scale-105">
              <KanbanCard
                issue={activeItem}
                type={type}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
} 