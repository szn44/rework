import Link from "next/link";
import { PROJECTS, PROJECT_STATUSES } from "@/config";

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  // Find the project in our mock data - match with simple ID (1, 2, 3)
  const mockProject = {
    "1": { id: "project-1", name: "Software Development Project", projectId: "WIS-0001", client: "WISG", color: "#8B5CF6", status: "not-started" },
    "2": { id: "project-2", name: "Mobile App Redesign", projectId: "WIS-0002", client: "TechCorp", color: "#10B981", status: "in-progress" },
    "3": { id: "project-3", name: "Website Optimization", projectId: "WIS-0003", client: "StartupXYZ", color: "#F59E0B", status: "completed" }
  };

  const project = mockProject[projectId as keyof typeof mockProject];

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-4">
            The project with ID "{projectId}" could not be found.
          </p>
          <Link 
            href="/projects" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const status = PROJECT_STATUSES.find(s => s.id === project.status) || PROJECT_STATUSES[0];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex justify-between border-b h-10 px-4 items-center bg-white">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Projects
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: project.color }}
          />
          <span className="text-sm font-medium">{status.text}</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex flex-row">
          <div className="flex-grow h-full overflow-y-scroll">
            <div className="max-w-[840px] mx-auto py-6 relative">
              <div className="px-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {project.name}
                </h1>
                
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-600 mb-6">
                    Project ID: <span className="font-medium">{project.projectId}</span>
                  </p>
                  
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
                    <p className="text-gray-600">
                      This is a collaborative project workspace. Here you can manage project details, 
                      track progress, collaborate with team members, and maintain project documentation.
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Use the Properties panel to update project details</li>
                      <li>• Add team members and assign roles</li>
                      <li>• Set project milestones and deadlines</li>
                      <li>• Track progress and update status</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="border-l flex-grow-0 flex-shrink-0 w-[200px] lg:w-[260px] px-4 flex flex-col gap-4 bg-white">
            <div className="py-4">
              <div className="text-xs font-medium text-neutral-600 mb-4">
                Project Details
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Client</label>
                  <div className="text-sm font-medium">{project.client}</div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Status</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm">{status.text}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Project ID</label>
                  <div className="text-sm font-mono">{project.projectId}</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-xs font-medium text-neutral-600 mb-4">
                Actions
              </div>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Edit Project
                </button>
                <button className="w-full text-left text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Share Project
                </button>
                <button className="w-full text-left text-sm text-neutral-600 hover:text-red-600 transition-colors">
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