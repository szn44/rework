"use client";

import { useState } from "react";
import { PROJECT_STATUSES } from "@/config";
import { CreateProjectButton } from "@/components/CreateProjectButton";
import Link from "next/link";
import { ProgressTodoIcon } from "@/icons/ProgressTodoIcon";
import { ProgressInProgressIcon } from "@/icons/ProgressInProgressIcon";
import { ProgressInReviewIcon } from "@/icons/ProgressInReviewIcon";
import { ProgressDoneIcon } from "@/icons/ProgressDoneIcon";

interface Project {
  id: string;
  name: string;
  projectId: string;
  client: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  team?: string[];
  status: string;
  color: string;
  createdAt: Date;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Software Development Project",
    projectId: "WIS-0001",
    client: "WISG",
    startDate: "Jun 23, 2025",
    endDate: undefined,
    budget: 0,
    team: ["user1"],
    status: "not-started",
    color: "#8B5CF6",
    createdAt: new Date('2024-01-15')
  },
  {
    id: "2", 
    name: "Mobile App Redesign",
    projectId: "WIS-0002",
    client: "TechCorp",
    startDate: "Jul 1, 2025",
    endDate: "Sep 30, 2025",
    budget: 50000,
    team: ["user1", "user2"],
    status: "in-progress",
    color: "#10B981",
    createdAt: new Date('2024-01-20')
  },
  {
    id: "3",
    name: "Website Optimization",
    projectId: "WIS-0003", 
    client: "StartupXYZ",
    startDate: "Aug 15, 2025",
    endDate: "Oct 15, 2025",
    budget: 25000,
    team: ["user3"],
    status: "completed",
    color: "#F59E0B",
    createdAt: new Date('2024-02-01')
  }
];

export function ProjectsList({ hideHeader = false }: { hideHeader?: boolean }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  // Group projects by status like issues
  const notStarted = projects.filter((project) => project.status === "not-started");
  const inProgress = projects.filter((project) => project.status === "in-progress");
  const onHold = projects.filter((project) => project.status === "on-hold");
  const completed = projects.filter((project) => project.status === "completed");

  return (
    <div>
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 text-sm border-b h-12 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-neutral-900">Projects</h1>
            <div className="text-xs text-neutral-500">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </div>
          </div>
          <CreateProjectButton onProjectAdded={(newProject) => setProjects([...projects, newProject])} />
        </div>
      )}

      {/* Not Started Section */}
      {notStarted.length > 0 && (
        <div className="flex items-center gap-2 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-800 w-full border-b">
          <ProgressTodoIcon className="w-4 h-4 text-neutral-500" />
          <span>Not Started</span>
          <span className="ml-auto text-xs text-neutral-500">
            {notStarted.length}
          </span>
        </div>
      )}
      {notStarted.map((project) => (
        <ProjectRow key={project.id} project={project} />
      ))}

      {/* In Progress Section */}
      {inProgress.length > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 text-sm font-medium text-neutral-800 w-full border-b">
          <ProgressInProgressIcon className="w-4 h-4 text-yellow-500" />
          <span>In Progress</span>
          <span className="ml-auto text-xs text-neutral-500">
            {inProgress.length}
          </span>
        </div>
      )}
      {inProgress.map((project) => (
        <ProjectRow key={project.id} project={project} />
      ))}

      {/* On Hold Section */}
      {onHold.length > 0 && (
        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 text-sm font-medium text-neutral-800 w-full border-b">
          <ProgressInReviewIcon className="w-4 h-4 text-red-500" />
          <span>On Hold</span>
          <span className="ml-auto text-xs text-neutral-500">
            {onHold.length}
          </span>
        </div>
      )}
      {onHold.map((project) => (
        <ProjectRow key={project.id} project={project} />
      ))}

      {/* Completed Section */}
      {completed.length > 0 && (
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 text-sm font-medium text-neutral-800 w-full border-b">
          <ProgressDoneIcon className="w-4 h-4 text-indigo-500" />
          <span>Completed</span>
          <span className="ml-auto text-xs text-neutral-500">
            {completed.length}
          </span>
        </div>
      )}
      {completed.map((project) => (
        <ProjectRow key={project.id} project={project} />
      ))}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-neutral-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900">No projects yet</h3>
          <p className="text-neutral-500 mt-1">Get started by creating your first project.</p>
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const status = PROJECT_STATUSES.find(s => s.id === project.status);

  const date = project.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/project/${project.id}`}
      className="group flex h-12 items-center justify-between px-4 text-sm transition-all duration-150 hover:bg-neutral-50 hover:shadow-sm border-b border-neutral-100 bg-white"
    >
      <div className="flex gap-3 items-center min-w-0 flex-1">
        <div className="w-5 flex-shrink-0">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: project.color }}
          />
        </div>
        <div className="font-medium text-neutral-900 truncate group-hover:text-neutral-700 transition-colors">
          {project.name}
        </div>
      </div>
      <div className="flex gap-4 items-center flex-shrink-0">
        <div className="flex gap-2 items-center">
          <div className="text-xs rounded-full px-2 py-1 bg-blue-50 border border-blue-200 flex items-center gap-1.5 select-none text-blue-700">
            <div className="bg-blue-400 rounded-full w-1.5 h-1.5" />
            {project.client}
          </div>
          {status && (
            <div className="text-xs rounded-full px-2 py-1 bg-neutral-100 border border-neutral-200 flex items-center gap-1.5 select-none text-neutral-600">
              <div 
                className="rounded-full w-1.5 h-1.5" 
                style={{ backgroundColor: status.color }}
              />
              {status.text}
            </div>
          )}
        </div>
        <div className="flex-none w-16 text-right text-xs text-neutral-500 font-medium">
          {date}
        </div>
        <div className="flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center">
            <svg className="w-3 h-3 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
} 