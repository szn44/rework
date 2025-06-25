import { ProjectsView } from "@/components/ProjectsView";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

// Cache for 60 seconds to prevent rapid re-fetching
export const revalidate = 60;

export default function ProjectsPage() {
  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded">
        <ProjectsView />
      </main>
    </ResponsiveLayout>
  );
} 