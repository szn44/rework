"use client";

import {
  ClientSideSuspense,
  useMutation,
  useStorage,
} from "@liveblocks/react/suspense";
import { Select } from "@/components/Select";
import { PlusIcon } from "@/icons/PlusIcon";
import { ImmutableStorage } from "@/liveblocks.config";
import { useEffect, useState } from "react";

interface Space {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export function IssueProject({
  storageFallback,
}: {
  storageFallback: ImmutableStorage;
}) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/spaces')
      .then(res => res.json())
      .then(data => {
        setSpaces(data.spaces || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch spaces:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-sm flex gap-1.5 justify-start items-start font-medium max-w-full flex-wrap min-h-[26px] pointer-events-none">
        <div className="text-neutral-400">Loading spaces...</div>
      </div>
    );
  }

  return (
    <ClientSideSuspense
      fallback={
        <div className="text-sm flex gap-1.5 justify-start items-start font-medium max-w-full flex-wrap min-h-[26px] pointer-events-none">
          {(storageFallback.space || storageFallback.project) && spaces.find(s => s.slug === (storageFallback.space || storageFallback.project)) && (
            <div className="text-sm font-medium rounded-full px-2 py-0.5 border shadow-xs flex items-center gap-1.5 select-none text-neutral-700">
              <div 
                className="rounded-full w-2 h-2" 
                style={{ backgroundColor: spaces.find(s => s.slug === (storageFallback.space || storageFallback.project))?.color || "#6B7280" }}
              />
              {spaces.find(s => s.slug === (storageFallback.space || storageFallback.project))?.name}
              <div className="text-base leading-none pb-0.5 text-neutral-400">
                ×
              </div>
            </div>
          )}
        </div>
      }
    >
      <Space spaces={spaces} />
    </ClientSideSuspense>
  );
}

function Space({ spaces }: { spaces: Space[] }) {
  const space = useStorage((root) => root.space);
  const project = useStorage((root) => root.project); // For backward compatibility

  const setSpace = useMutation(({ storage }, spaceSlug) => {
    storage.set("space", spaceSlug);
    // Also update project for backward compatibility
    storage.set("project", spaceSlug);
  }, []);

  const removeSpace = useMutation(({ storage }) => {
    storage.delete("space");
    storage.delete("project");
  }, []);

  // Handle API call separately from mutation
  const updateSpaceMetadata = async (spaceSlug: string) => {
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
            space: spaceSlug,
            project: spaceSlug, // For backward compatibility
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

  const handleSetSpace = (spaceSlug: string) => {
    setSpace(spaceSlug);
    updateSpaceMetadata(spaceSlug);
  };

  const handleRemoveSpace = () => {
    removeSpace();
    // Also update API metadata to remove space
    updateSpaceMetadata("");
  };

  const SPACE_LIST = spaces.map((sp) => ({
    id: sp.slug,
    jsx: (
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: sp.color }}
        />
        <span>{sp.name}</span>
      </div>
    ),
    disabled: (space || project) === sp.slug,
  }));

  const selectedSpace = spaces.find(s => s.slug === (space || project));

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