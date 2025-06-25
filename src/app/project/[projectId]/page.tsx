import { ProjectRoom } from "@/components/ProjectRoom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

export const revalidate = 0;

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded">
        <ProjectRoom projectId={params.projectId} />
      </main>
    </ResponsiveLayout>
  );
} 