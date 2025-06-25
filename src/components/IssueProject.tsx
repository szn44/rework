"use client";

import {
  ClientSideSuspense,
  useMutation,
  useStorage,
} from "@liveblocks/react/suspense";
import { SPACES } from "@/config";
import { Select } from "@/components/Select";
import { PlusIcon } from "@/icons/PlusIcon";
import { ImmutableStorage } from "@/liveblocks.config";

export function IssueProject({
  storageFallback,
}: {
  storageFallback: ImmutableStorage;
}) {
  return (
    <ClientSideSuspense
      fallback={
        <div className="text-sm flex gap-1.5 justify-start items-start font-medium max-w-full flex-wrap min-h-[26px] pointer-events-none">
          {(storageFallback.space || storageFallback.project) && SPACES.find(s => s.id === (storageFallback.space || storageFallback.project)) && (
            <div className="text-sm font-medium rounded-full px-2 py-0.5 border shadow-xs flex items-center gap-1.5 select-none text-neutral-700">
              <div 
                className="rounded-full w-2 h-2" 
                style={{ backgroundColor: SPACES.find(s => s.id === (storageFallback.space || storageFallback.project))?.color || "#6B7280" }}
              />
              {SPACES.find(s => s.id === (storageFallback.space || storageFallback.project))?.name}
              <div className="text-base leading-none pb-0.5 text-neutral-400">
                ×
              </div>
            </div>
          )}
        </div>
      }
    >
      <Space />
    </ClientSideSuspense>
  );
}

function Space() {
  const space = useStorage((root) => root.space);
  const project = useStorage((root) => root.project); // For backward compatibility

  const setSpace = useMutation(({ storage }, spaceId) => {
    storage.set("space", spaceId);
    // Also update project for backward compatibility
    storage.set("project", spaceId);
  }, []);

  const removeSpace = useMutation(({ storage }) => {
    storage.delete("space");
    storage.delete("project");
  }, []);

  // Handle API call separately from mutation
  const updateSpaceMetadata = async (spaceId: string) => {
    try {
      const response = await fetch('/api/update-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: window.location.pathname.includes('/issue/') ? 
            `liveblocks:examples:nextjs-project-manager-${window.location.pathname.split('/issue/')[1]}` :
            undefined,
          metadata: {
            space: spaceId,
            project: spaceId, // For backward compatibility
          },
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update issue metadata');
      }
    } catch (error) {
      console.error('Error updating issue metadata:', error);
    }
  };

  const handleSetSpace = (spaceId: string) => {
    setSpace(spaceId);
    updateSpaceMetadata(spaceId);
  };

  const handleRemoveSpace = () => {
    removeSpace();
    // Also update API metadata to remove space
    updateSpaceMetadata("");
  };

  const SPACE_LIST = SPACES.map((sp) => ({
    id: sp.id,
    jsx: (
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: sp.color }}
        />
        <span>{sp.name}</span>
      </div>
    ),
    disabled: (space || project) === sp.id,
  }));

  const selectedSpace = SPACES.find(s => s.id === (space || project));

  return (
    <div className="text-sm flex gap-1.5 justify-start items-start font-medium max-w-full flex-wrap">
      {selectedSpace && (
        <div className="text-sm font-medium rounded-full px-2 py-0.5 border shadow-xs flex items-center gap-1.5 select-none text-neutral-700">
          <div 
            className="rounded-full w-2 h-2" 
            style={{ backgroundColor: selectedSpace.color }}
          />
          {selectedSpace.name}
          <button
            className="text-base leading-none pb-0.5 text-neutral-400"
            onClick={handleRemoveSpace}
          >
            ×
          </button>
        </div>
      )}
      {!selectedSpace && (
        <div className="overflow-hidden bg-transparent rounded-full transition-colors h-[26px]">
          <Select
            id="add-space"
            value={"add"}
            items={[
              {
                id: "add",
                jsx: <PlusIcon className="w-4 h-4 -mt-0.5" />,
              },
              ...SPACE_LIST,
            ]}
            adjustFirstItem="hide"
            onValueChange={handleSetSpace}
          />
        </div>
      )}
    </div>
  );
} 