import { RoomData } from "@liveblocks/node";
import { PriorityHighIcon } from "@/icons/PriorityHighIcon";
import { PriorityMediumIcon } from "@/icons/PriorityMediumIcon";
import { PriorityLowIcon } from "@/icons/PriorityLowIcon";
import { PriorityUrgentIcon } from "@/icons/PriorityUrgentIcon";
import { DashIcon } from "@/icons/DashIcon";
import { ProgressTodoIcon } from "@/icons/ProgressTodoIcon";
import { ProgressInProgressIcon } from "@/icons/ProgressInProgressIcon";
import { ProgressInReviewIcon } from "@/icons/ProgressInReviewIcon";
import { ProgressDoneIcon } from "@/icons/ProgressDoneIcon";

export const LABELS = [
  { id: "feature", text: "Feature", jsx: <>Feature</> },
  { id: "bug", text: "Bug", jsx: <>Bug</> },
  { id: "engineering", text: "Engineering", jsx: <>Engineering</> },
  { id: "design", text: "Design", jsx: <>Design</> },
  { id: "product", text: "Product", jsx: <>Product</> },
] as const;

export const SPACES = [
  { id: "all-rework", name: "all-rework", spaceId: "all-rework", color: "#8B5CF6" },
  { id: "new-channel", name: "new-channel", spaceId: "new-channel", color: "#10B981" },
  { id: "social", name: "social", spaceId: "social", color: "#F59E0B" },
] as const;

// Keep PROJECTS for backward compatibility but mark as deprecated
export const PROJECTS = [
  { id: "all-rework", name: "all-rework", projectId: "all-rework", client: "Space", color: "#8B5CF6" },
  { id: "new-channel", name: "new-channel", projectId: "new-channel", client: "Space", color: "#10B981" },
  { id: "social", name: "social", projectId: "social", client: "Space", color: "#F59E0B" },
] as const;

export const PROJECT_STATUSES = [
  { id: "not-started", text: "Not Started", color: "#6B7280", jsx: <>Not Started</> },
  { id: "in-progress", text: "In Progress", color: "#F59E0B", jsx: <>In Progress</> },
  { id: "on-hold", text: "On Hold", color: "#EF4444", jsx: <>On Hold</> },
  { id: "completed", text: "Completed", color: "#10B981", jsx: <>Completed</> },
] as const;

export const PRIORITY_STATES = [
  {
    id: "none",
    icon: <DashIcon className="w-4 h-4 text-neutral-600" />,
    jsx: (
      <div className="flex gap-2 items-center text-neutral-600">
        No priority
      </div>
    ),
  },
  {
    id: "urgent",
    icon: <PriorityUrgentIcon className="w-4 h-4 text-neutral-600" />,
    jsx: (
      <div className="flex gap-2 items-center">
        <PriorityUrgentIcon className="w-4 h-4 text-neutral-600" />
        Urgent
      </div>
    ),
  },
  {
    id: "high",
    icon: <PriorityHighIcon className="w-4 h-4 text-neutral-600" />,
    jsx: (
      <div className="flex gap-2 items-center">
        <PriorityHighIcon className="w-4 h-4 text-neutral-600" />
        High
      </div>
    ),
  },
  {
    id: "medium",
    icon: <PriorityMediumIcon className="w-4 h-4 text-neutral-600" />,
    jsx: (
      <div className="flex gap-2 items-center">
        <PriorityMediumIcon className="w-4 h-4 text-neutral-600" />
        Medium
      </div>
    ),
  },
  {
    id: "low",
    icon: <PriorityLowIcon className="w-4 h-4 text-neutral-600" />,
    jsx: (
      <div className="flex gap-2 items-center">
        <PriorityLowIcon className="w-4 h-4 text-neutral-600" />
        Low
      </div>
    ),
  },
] as const;

export const PROGRESS_STATES = [
  {
    id: "none",
    jsx: (
      <div className="flex gap-2 items-center text-neutral-600">
        No progress
      </div>
    ),
  },
  {
    id: "todo",
    jsx: (
      <div className="flex gap-2 items-center">
        <ProgressTodoIcon className="w-4 h-4 text-neutral-500" />
        Todo
      </div>
    ),
  },
  {
    id: "progress",
    jsx: (
      <div className="flex gap-2 items-center">
        <ProgressInProgressIcon className="w-4 h-4 text-yellow-500" />
        In Progress
      </div>
    ),
  },
  {
    id: "review",
    jsx: (
      <div className="flex gap-2 items-center">
        <ProgressInReviewIcon className="w-4 h-4 text-emerald-500" />
        In Review
      </div>
    ),
  },
  {
    id: "done",
    jsx: (
      <div className="flex gap-2 items-center">
        <ProgressDoneIcon className="w-4 h-4 text-indigo-500" />
        Done
      </div>
    ),
  },
] as const;

export type ProgressState = (typeof PROGRESS_STATES)[number]["id"];
export type PriorityState = (typeof PRIORITY_STATES)[number]["id"];
export type Label = (typeof LABELS)[number]["id"];
export type Space = (typeof SPACES)[number]["id"];
export type Project = (typeof PROJECTS)[number]["id"];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["id"];

export function getRoomId(issueId: string) {
  return `liveblocks:examples:nextjs-project-manager-${issueId}`;
}

export type Metadata = {
  issueId: string;
  title: string;
  progress: ProgressState;
  priority: PriorityState;
  assignedTo: string | "none"; // Keep as string for metadata, LiveList only in storage
  labels: string[];
  project?: string; // Keep for backward compatibility
  space?: string; // New space field
};

export type RoomWithMetadata = RoomData & { metadata: Metadata };
