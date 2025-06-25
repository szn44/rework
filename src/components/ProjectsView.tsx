"use client";

import React, { useState, useMemo } from "react";
import { ViewSwitcher, ViewType } from "./ViewSwitcher";
import { ProjectsList } from "./ProjectsList";
import { KanbanBoard } from "./KanbanBoard";
import { CreateProjectButton } from "./CreateProjectButton";

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

export function ProjectsView() {
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [projects, setProjects] = useState<Project[]>([]);

  // Mock data for now - in a real app this would come from props or API
  const mockProjects: Project[] = [
    {
      id: "1",
      name: "Website Redesign",
      projectId: "WEB-001",
      client: "Acme Corp",
      startDate: "2024-01-15",
      endDate: "2024-03-15",
      budget: 50000,
      team: ["user1", "user2"],
      status: "in-progress",
      color: "#3B82F6",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Mobile App Development",
      projectId: "MOB-002",
      client: "Tech Startup",
      startDate: "2024-02-01",
      endDate: "2024-06-01",
      budget: 75000,
      team: ["user3", "user4"],
      status: "not-started",
      color: "#10B981",
      createdAt: new Date("2024-02-01"),
    },
  ];

  // Prepare data for board view
  const boardItems = useMemo(() => {
    return mockProjects.map(project => ({
      room: {
        id: project.id,
        metadata: {
          issueId: project.id,
          title: project.name,
          progress: project.status,
          priority: "none",
          assignedTo: project.team || [],
          labels: [],
          project: project.projectId,
        },
        createdAt: project.createdAt,
      } as any,
      metadata: {
        issueId: project.id,
        title: project.name,
        priority: "none",
        progress: project.status,
        assignedTo: project.team || [],
        labels: [],
        project: project.projectId,
      },
    }));
  }, [mockProjects]);

  const handleProgressChange = async (roomId: string, newProgress: string) => {
    // TODO: Implement project status update API call
    console.log(`Updating project ${roomId} to status ${newProgress}`);
  };

  const handleProjectAdded = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 text-sm border-b h-12 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-neutral-900">Projects</h1>
            <div className="text-xs text-neutral-500">
              {mockProjects.length} project{mockProjects.length !== 1 ? 's' : ''}
            </div>
          </div>
          <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
        </div>
        <CreateProjectButton onProjectAdded={handleProjectAdded} />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {currentView === "list" ? (
          <div className="h-full overflow-y-auto">
            <ProjectsList hideHeader={true} />
          </div>
        ) : (
          <div className="h-full">
            <KanbanBoard
              items={boardItems}
              type="project"
              onProgressChange={handleProgressChange}
            />
          </div>
        )}
      </div>
    </div>
  );
} 