"use client";

import {
  ClientSideSuspense,
  useMutation,
  useStorage,
} from "@liveblocks/react/suspense";
import { PRIORITY_STATES, PROGRESS_STATES } from "@/config";
import { getUsers } from "@/database";
import { Select } from "@/components/Select";
import { MultiAssigneeSelect } from "@/components/MultiAssigneeSelect";
import { StackedAvatars } from "@/components/StackedAvatars";
import { ImmutableStorage } from "@/liveblocks.config";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function IssueProperties({
  storageFallback,
  roomMetadata,
}: {
  storageFallback: ImmutableStorage;
  roomMetadata?: any;
}) {
  return (
    <ClientSideSuspense
      fallback={
        <div className="text-sm flex flex-col gap-3 justify-start items-start font-medium pt-1 -mb-1 pointer-events-none">
          <div className="block bg-transparent border-0 h-7 w-32 px-2 rounded-md transition-colors whitespace-nowrap">
            {
              PROGRESS_STATES.find(
                (p) => p.id === storageFallback.properties.progress
              )?.jsx
            }
          </div>
          <div className="block bg-transparent border-0 h-7 w-32 px-2 rounded-md transition-colors whitespace-nowrap">
            {
              PRIORITY_STATES.find(
                (p) => p.id === storageFallback.properties.priority
              )?.jsx
            }
          </div>
          <div className="block bg-transparent border-0 pl-2 pb-2 rounded-md transition-colors whitespace-nowrap">
            {(!storageFallback.properties.assignedTo || storageFallback.properties.assignedTo.length === 0) ? (
              <span className="text-neutral-600">Not assigned</span>
            ) : (
              <StackedAvatars 
                assigneeIds={Array.isArray(storageFallback.properties.assignedTo) 
                  ? storageFallback.properties.assignedTo 
                  : [storageFallback.properties.assignedTo]} 
                maxVisible={2} 
                size="sm" 
              />
            )}
          </div>
        </div>
      }
    >
      <Properties roomMetadata={roomMetadata} />
    </ClientSideSuspense>
  );
}

const USERS = [
  {
    id: "none",
    jsx: <div className="text-neutral-600">Not assigned</div>,
  },
];

function Properties({ roomMetadata }: { roomMetadata?: any }) {
  const properties = useStorage((root) => root.properties);
  const [users, setUsers] = useState(USERS);

  // Load workspace members as potential assignees
  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch('/api/workspace-users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        
        const userOptions = data.users.map((u: any) => ({
          id: u.id,
          jsx: (
            <div className="flex items-center gap-2">
              <img
                src={u.avatar}
                alt={u.name}
                className="w-6 h-6 rounded-full"
              />
              <span>{u.name}</span>
            </div>
          ),
        }));

        setUsers([
          {
            id: "none",
            jsx: <div className="text-neutral-600">Not assigned</div>,
          },
          ...userOptions
        ]);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    }

    loadUsers();
  }, []);

  const editProperty = useMutation(({ storage }, prop, value) => {
    storage.get("properties").set(prop, value);
  }, []);

  const editAssignees = useMutation(({ storage }, assignees) => {
    const assignedToList = storage.get("properties").get("assignedTo");
    assignedToList.clear();
    assignees.forEach((assignee: string) => {
      assignedToList.push(assignee);
    });
  }, []);

  // CRITICAL FIX: Sync storage with metadata on component mount if there's a mismatch
  React.useEffect(() => {
    if (roomMetadata) {
      console.log('PROPERTIES: Checking storage vs metadata sync');
      console.log('PROPERTIES: Storage progress:', properties.progress);
      console.log('PROPERTIES: Metadata progress:', roomMetadata.progress);
      
      // If there's a mismatch, update storage to match metadata (metadata is source of truth)
      if (properties.progress !== roomMetadata.progress && roomMetadata.progress) {
        console.log('PROPERTIES: Syncing storage progress to metadata value:', roomMetadata.progress);
        editProperty('progress', roomMetadata.progress);
      }
      
      if (properties.priority !== roomMetadata.priority && roomMetadata.priority) {
        console.log('PROPERTIES: Syncing storage priority to metadata value:', roomMetadata.priority);
        editProperty('priority', roomMetadata.priority);
      }
    }
  }, [roomMetadata, properties.progress, properties.priority, editProperty]);

  // Sync changes to room metadata whenever properties change
  const handlePropertyChange = async (prop: string, value: any) => {
    console.log(`Updating ${prop} to:`, value);
    
    // Update local storage first
    editProperty(prop, value);
    
    // Then sync to room metadata for API consistency
    try {
      const roomId = window.location.pathname.split('/').pop(); // Extract issue ID from URL
      if (roomId) {
        console.log(`Syncing ${prop} to metadata for room:`, roomId);
        
        const response = await fetch('/api/update-issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: `liveblocks:examples:nextjs-project-manager-${roomId}`,
            metadata: {
              [prop]: value,
            },
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to update issue metadata:', response.status, errorText);
        } else {
          const responseData = await response.json();
          console.log(`Successfully synced ${prop} to metadata:`, responseData);
        }
      }
    } catch (error) {
      console.error('Failed to sync property to metadata:', error);
    }
  };

  const handleAssigneesChange = async (assignees: string[]) => {
    // Update local storage first
    editAssignees(assignees);
    
    // Then sync to room metadata
    try {
      const roomId = window.location.pathname.split('/').pop();
      if (roomId) {
        const response = await fetch('/api/update-issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: `liveblocks:examples:nextjs-project-manager-${roomId}`,
            metadata: {
              assignedTo: assignees.join(',')
            },
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to update assignees');
        } else {
          console.log('Successfully updated assignees');
        }
      }
    } catch (error) {
      console.error('Failed to sync assignees to metadata:', error);
    }
  };

  return (
    <div className="text-sm flex flex-col gap-3 justify-start items-start font-medium">
      <Select
        id="progress"
        value={properties.progress}
        items={PROGRESS_STATES as any}
        adjustFirstItem="split"
        onValueChange={(val) => handlePropertyChange("progress", val)}
      />

      <Select
        id="priority"
        value={properties.priority}
        items={PRIORITY_STATES as any}
        adjustFirstItem="split"
        onValueChange={(val) => handlePropertyChange("priority", val)}
      />

      <MultiAssigneeSelect
        value={Array.from(properties.assignedTo)}
        onValueChange={(assignees) => handleAssigneesChange(assignees)}
      />
    </div>
  );
}

function AvatarAndName({ user }: { user: Liveblocks["UserMeta"] | null }) {
  if (!user) {
    return <div className="text-neutral-600">Not assigned</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="block w-4 h-4 rounded-full overflow-hidden">
        <img src={user.info.avatar} alt={user.info.name} />
      </div>
      {user.info.name}
    </div>
  );
}
