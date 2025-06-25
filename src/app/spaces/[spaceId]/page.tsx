import { WikiEditor } from "@/components/WikiEditor";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { liveblocks } from "@/liveblocks.server.config";
import { RoomWithMetadata } from "@/config";

// Cache for 5 seconds to allow faster updates during development
export const revalidate = 5;

export default async function SpacePage({ params }: { params: { spaceId: string } }) {
  // Fetch all rooms
  const allRooms = (await liveblocks.getRooms()).data as RoomWithMetadata[];
  
  // Filter to only show issues that belong to this space
  const spaceIssues = allRooms.filter(room => {
    // Must start with the issue room prefix
    if (!room.id.startsWith('liveblocks:examples:nextjs-project-manager-')) {
      return false;
    }
    
    // Must not be a project room or wiki room
    if (room.id.startsWith('project-') || room.id.includes('-wiki-')) {
      return false;
    }
    
    // Must have valid metadata with issueId
    if (!room.metadata || !room.metadata.issueId) {
      return false;
    }
    
    // Exclude obviously invalid rooms
    if (room.metadata.issueId === 'undefined' || !room.metadata.issueId.trim()) {
      return false;
    }
    
    // Must belong to this space (check both space and project fields for compatibility)
    return room.metadata.space === params.spaceId || room.metadata.project === params.spaceId;
  });

  // Convert to kanban format
  const kanbanItems = spaceIssues.map(room => ({
    room,
    metadata: {
      issueId: room.metadata.issueId,
      title: room.metadata.title || "Untitled",
      priority: room.metadata.priority || "none",
      progress: room.metadata.progress || "none",
      assignedTo: Array.isArray(room.metadata.assignedTo) 
        ? room.metadata.assignedTo 
        : (room.metadata.assignedTo && room.metadata.assignedTo !== "none" ? [room.metadata.assignedTo] : []),
      labels: room.metadata.labels || [],
      project: room.metadata.project,
      space: room.metadata.space,
    },
  }));

  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded">
        <WikiEditor roomId={params.spaceId} kanbanItems={kanbanItems} />
      </main>
    </ResponsiveLayout>
  );
} 