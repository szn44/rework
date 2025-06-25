import { liveblocks } from "@/liveblocks.server.config";
import { RoomWithMetadata } from "@/config";
import { IssuesView } from "@/components/IssuesView";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

// Disable caching completely during development to fix sync issues
export const revalidate = 0;

export default async function PageIssue() {
  const allRooms = (await liveblocks.getRooms()).data as RoomWithMetadata[];
  
  // Filter to only show valid issue rooms
  const issueRooms = allRooms.filter(room => {
    // Must start with the issue room prefix
    if (!room.id.startsWith('liveblocks:examples:nextjs-project-manager-')) {
      return false;
    }
    
    // Must not be a project room
    const basePrefix = 'liveblocks:examples:nextjs-project-manager-';
    const afterPrefix = room.id.substring(basePrefix.length);
    if (afterPrefix.startsWith('project-')) {
      return false;
    }
    
    // Must not be the wiki room
    if (room.id.includes('-wiki-')) {
      return false;
    }
    
    // Must have valid metadata with issueId
    if (!room.metadata || !room.metadata.issueId) {
      return false;
    }
    
    // Exclude obviously invalid rooms (undefined issueId, etc.)
    if (room.metadata.issueId === 'undefined' || !room.metadata.issueId.trim()) {
      return false;
    }
    
    return true;
  });
  
  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded">
        <IssuesView initialRooms={issueRooms} />
      </main>
    </ResponsiveLayout>
  );
}
