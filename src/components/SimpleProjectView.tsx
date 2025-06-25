"use client";

import { useState } from "react";
import { PROJECT_STATUSES } from "@/config";
import Link from "next/link";

interface ProjectData {
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
  description: string;
}

const mockProjectData: Record<string, ProjectData> = {
  "1": {
    id: "1",
    name: "Software Development Project",
    projectId: "WIS-0001",
    client: "WISG",
    startDate: "2025-06-23",
    endDate: "",
    budget: 0,
    team: ["user1"],
    status: "not-started",
    color: "#8B5CF6",
    createdAt: new Date('2024-01-15'),
    description: "This is a comprehensive software development project for WISG. The project involves building a modern web application with real-time features and collaborative functionality."
  },
  "2": {
    id: "2", 
    name: "Mobile App Redesign",
    projectId: "WIS-0002",
    client: "TechCorp",
    startDate: "2025-07-01",
    endDate: "2025-09-30",
    budget: 50000,
    team: ["user1", "user2"],
    status: "in-progress",
    color: "#10B981",
    createdAt: new Date('2024-01-20'),
    description: "Complete redesign of the mobile application for TechCorp. This includes UX research, UI design, and development implementation across iOS and Android platforms."
  },
  "3": {
    id: "3",
    name: "Website Optimization",
    projectId: "WIS-0003", 
    client: "StartupXYZ",
    startDate: "2025-08-15",
    endDate: "2025-10-15",
    budget: 25000,
    team: ["user3"],
    status: "completed",
    color: "#F59E0B",
    createdAt: new Date('2024-02-01'),
    description: "Performance optimization and SEO improvements for StartupXYZ's main website. Includes speed optimization, accessibility improvements, and search engine optimization."
  }
};

export function SimpleProjectView({ projectId }: { projectId: string }) {
  const project = mockProjectData[projectId];
  const [description, setDescription] = useState(project?.description || "");
  const [isEditing, setIsEditing] = useState(false);

  if (!project) {
    return (
      <div className="max-w-[840px] mx-auto pt-20">
        <h1 className="outline-none block w-full text-2xl font-bold bg-transparent my-6">
          Project not found
        </h1>
        <div>
          This project doesn't exist. Go back to the{" "}
          <Link className="font-bold underline" href="/projects">
            project list
          </Link>
          .
        </div>
      </div>
    );
  }

  const status = PROJECT_STATUSES.find(s => s.id === project.status);

  return (
    <div className="h-full flex flex-col">
      <header className="flex justify-between border-b h-10 px-4 items-center">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: project.color }}
          />
          <span>{project.projectId}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/projects"
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            ← Back to Projects
          </Link>
        </div>
      </header>
      
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex flex-row">
          <div className="flex-grow h-full overflow-y-scroll">
            <div className="max-w-[840px] mx-auto py-6 relative">
              <div className="px-12">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  {project.name}
                </h1>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-2">Description</h2>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-32 p-3 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter project description..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setDescription(project.description);
                            setIsEditing(false);
                          }}
                          className="px-3 py-1 bg-neutral-500 text-white text-sm rounded hover:bg-neutral-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="text-neutral-700 leading-relaxed cursor-pointer hover:bg-neutral-50 p-2 rounded border border-transparent hover:border-neutral-200"
                      onClick={() => setIsEditing(true)}
                    >
                      {description || "Click to add a description..."}
                    </div>
                  )}
                </div>

                <div className="border-t my-6" />

                <div>
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Project Tasks</h2>
                  <div className="text-neutral-500 text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <p>No tasks assigned to this project yet.</p>
                    <p className="text-sm mt-1">Tasks can be assigned from the Issues page.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-l flex-grow-0 flex-shrink-0 w-[200px] lg:w-[260px] px-4 flex flex-col gap-4">
            <div>
              <div className="text-xs font-medium text-neutral-600 mb-2 h-10 flex items-center">
                Properties
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-neutral-600 mb-2">Status</div>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
                    {status && (
                      <>
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: status.color }}
                        />
                        <span>{status.text}</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-600 mb-2">Client</div>
                  <div className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
                    {project.client}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-600 mb-2">Budget</div>
                  <div className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
                    ${project.budget?.toLocaleString() || 0}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-600 mb-2">Timeline</div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-neutral-500 mb-1 block">Start Date</label>
                      <div className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 mb-1 block">End Date</label>
                      <div className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-neutral-600 mb-0 h-10 flex items-center">
                Actions
              </div>
              <div className="space-y-2">
                <Link
                  href="/projects"
                  className="block w-full text-center px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Back to Projects
                </Link>
                <button className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                  Archive Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 