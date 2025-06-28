"use client";

import { Select } from "@/components/Select";
import { PlusIcon } from "@/icons/PlusIcon";
import { useEffect, useState } from "react";
import { useIssue } from "@/app/IssueProvider";

interface Space {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export function IssueProject({
  storageFallback,
}: {
  storageFallback?: any;
}) {
  const { issue, updateIssue } = useIssue();
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
        <div className="text-neutral-400 dark:text-dark-text-secondary">Loading spaces...</div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-sm flex gap-1.5 justify-start items-start font-medium max-w-full flex-wrap min-h-[26px] pointer-events-none">
        <div className="text-neutral-400 dark:text-dark-text-secondary">Loading issue...</div>
      </div>
    );
  }

  const handleSetSpace = async (spaceSlug: string) => {
    try {
      // Find the space to get its ID
      const selectedSpace = spaces.find(s => s.slug === spaceSlug);
      if (selectedSpace) {
        await updateIssue({ space_id: selectedSpace.id });
        console.log('Successfully updated space');
      }
    } catch (error) {
      console.error('Error updating space:', error);
    }
  };

  const handleRemoveSpace = async () => {
    try {
      await updateIssue({ space_id: null });
      console.log('Successfully removed space');
    } catch (error) {
      console.error('Error removing space:', error);
    }
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
    disabled: issue.space_id === sp.id,
  }));

  const selectedSpace = spaces.find(s => s.id === issue.space_id);

  return (
    <div className="text-sm flex gap-1.5 justify-start items-start font-medium max-w-full flex-wrap min-h-[26px]">
      {selectedSpace && (
        <div className="text-sm font-medium rounded-full px-2 py-0.5 border shadow-xs flex items-center gap-1.5 select-none text-neutral-700 dark:text-neutral-300 bg-white dark:bg-dark-bg-secondary border-neutral-200 dark:border-dark-bg-tertiary">
          <div 
            className="rounded-full w-2 h-2" 
            style={{ backgroundColor: selectedSpace.color }}
          />
          {selectedSpace.name}
          <button
            className="text-base leading-none pb-0.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
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