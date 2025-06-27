"use client";

import { PRIORITY_STATES, PROGRESS_STATES } from "@/config";
import { Select } from "@/components/Select";
import { MultiAssigneeSelect } from "@/components/MultiAssigneeSelect";
import { StackedAvatars } from "@/components/StackedAvatars";
import React, { useState, useEffect } from "react";
import { useIssue } from "@/app/IssueProvider";

export function IssueProperties({
  storageFallback,
  roomMetadata,
}: {
  storageFallback?: any;
  roomMetadata?: any;
}) {
  const { issue, loading, updateIssue } = useIssue();
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

  // Show loading state while issue is loading
  if (loading || !issue) {
    return (
      <div className="text-sm flex flex-col gap-3 justify-start items-start font-medium pt-1 -mb-1 pointer-events-none">
        <div className="block bg-transparent border-0 h-7 w-32 px-2 rounded-md transition-colors whitespace-nowrap">
          {
            PROGRESS_STATES.find(
              (p) => p.id === (storageFallback?.properties?.progress || "none")
            )?.jsx
          }
        </div>
        <div className="block bg-transparent border-0 h-7 w-32 px-2 rounded-md transition-colors whitespace-nowrap">
          {
            PRIORITY_STATES.find(
              (p) => p.id === (storageFallback?.properties?.priority || "none")
            )?.jsx
          }
        </div>
        <div className="block bg-transparent border-0 pl-2 pb-2 rounded-md transition-colors whitespace-nowrap">
          <span className="text-neutral-600">Not assigned</span>
        </div>
      </div>
    );
  }

  const handlePropertyChange = async (prop: string, value: any) => {
    console.log(`Updating ${prop} to:`, value);
    
    try {
      await updateIssue({ [prop]: value });
      console.log(`Successfully updated ${prop}`);
    } catch (error) {
      console.error('Failed to update property:', error);
    }
  };

  const handleAssigneesChange = async (assignees: string[]) => {
    try {
      await updateIssue({ assignee_ids: assignees });
      console.log('Successfully updated assignees');
    } catch (error) {
      console.error('Failed to update assignees:', error);
    }
  };

  // Get current assignee IDs as array
  const currentAssignees = Array.isArray(issue.assignee_ids) ? issue.assignee_ids : [];

  return (
    <div className="text-sm flex flex-col gap-3 justify-start items-start font-medium">
      <Select
        id="progress"
        value={issue.status || "none"}
        items={PROGRESS_STATES as any}
        adjustFirstItem="split"
        onValueChange={(val) => handlePropertyChange("status", val)}
      />

      <Select
        id="priority"
        value={issue.priority || "none"}
        items={PRIORITY_STATES as any}
        adjustFirstItem="split"
        onValueChange={(val) => handlePropertyChange("priority", val)}
      />

      <MultiAssigneeSelect
        value={currentAssignees}
        onValueChange={(assignees) => handleAssigneesChange(assignees)}
      />
    </div>
  );
}

const USERS = [
  {
    id: "none",
    jsx: <div className="text-neutral-600">Not assigned</div>,
  },
];