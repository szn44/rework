"use client";

import {
  ClientSideSuspense,
  useMutation,
  useStorage,
} from "@liveblocks/react/suspense";
import { PROJECT_STATUSES, PROJECTS } from "@/config";
import { Select } from "@/components/Select";
import { ImmutableStorage } from "@/liveblocks.config";

export function ProjectProperties({
  storageFallback,
  projectId,
}: {
  storageFallback: ImmutableStorage;
  projectId: string;
}) {
  return (
    <ClientSideSuspense
      fallback={
        <div className="flex flex-col gap-4 pointer-events-none">
          <ProjectStatus storageFallback={storageFallback} />
          <ProjectClient storageFallback={storageFallback} />
          <ProjectBudget storageFallback={storageFallback} />
          <ProjectDates storageFallback={storageFallback} />
        </div>
      }
    >
      <Properties projectId={projectId} />
    </ClientSideSuspense>
  );
}

function Properties({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <ProjectStatusSelect />
      <ProjectClientField />
      <ProjectBudgetField />
      <ProjectDatesField />
    </div>
  );
}

function ProjectStatusSelect() {
  const status = useStorage((root) => root.projectStatus);

  const updateStatus = useMutation(({ storage }, newStatus) => {
    storage.set("projectStatus", newStatus);
  }, []);

  const currentStatus = PROJECT_STATUSES.find(s => s.id === status) || PROJECT_STATUSES[0];

  return (
    <div>
      <div className="text-xs font-medium text-neutral-600 mb-2">Status</div>
      <Select
        id="project-status"
        value={status || "not-started"}
        items={PROJECT_STATUSES.map((statusItem) => ({
          id: statusItem.id,
          jsx: (
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: statusItem.color }}
              />
              <span>{statusItem.text}</span>
            </div>
          ),
        }))}
        onValueChange={(value) => updateStatus(value)}
      />
    </div>
  );
}

function ProjectClientField() {
  const client = useStorage((root) => root.projectClient);

  const updateClient = useMutation(({ storage }, newClient) => {
    storage.set("projectClient", newClient);
  }, []);

  return (
    <div>
      <div className="text-xs font-medium text-neutral-600 mb-2">Client</div>
      <input
        type="text"
        value={client || ""}
        onChange={(e) => updateClient(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter client name"
      />
    </div>
  );
}

function ProjectBudgetField() {
  const budget = useStorage((root) => root.projectBudget);

  const updateBudget = useMutation(({ storage }, newBudget) => {
    storage.set("projectBudget", newBudget);
  }, []);

  return (
    <div>
      <div className="text-xs font-medium text-neutral-600 mb-2">Budget</div>
      <input
        type="number"
        value={budget || ""}
        onChange={(e) => updateBudget(parseInt(e.target.value) || 0)}
        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="0"
      />
    </div>
  );
}

function ProjectDatesField() {
  const startDate = useStorage((root) => root.projectStartDate);
  const endDate = useStorage((root) => root.projectEndDate);

  const updateStartDate = useMutation(({ storage }, newDate) => {
    storage.set("projectStartDate", newDate);
  }, []);

  const updateEndDate = useMutation(({ storage }, newDate) => {
    storage.set("projectEndDate", newDate);
  }, []);

  return (
    <div>
      <div className="text-xs font-medium text-neutral-600 mb-2">Timeline</div>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-neutral-500 mb-1 block">Start Date</label>
          <input
            type="date"
            value={startDate || ""}
            onChange={(e) => updateStartDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-500 mb-1 block">End Date</label>
          <input
            type="date"
            value={endDate || ""}
            onChange={(e) => updateEndDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

// Fallback components for loading state
function ProjectStatus({ storageFallback }: { storageFallback: ImmutableStorage }) {
  const status = PROJECT_STATUSES.find(s => s.id === (storageFallback as any).projectStatus) || PROJECT_STATUSES[0];
  
  return (
    <div>
      <div className="text-xs font-medium text-neutral-600 mb-2">Status</div>
      <div className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: status.color }}
        />
        <span>{status.text}</span>
      </div>
    </div>
  );
}

function ProjectClient({ storageFallback }: { storageFallback: ImmutableStorage }) {
  return (
    <div>
      <div className="text-xs font-medium text-neutral-600 mb-2">Client</div>
      <div className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
        {(storageFallback as any).projectClient || "No client set"}
      </div>
    </div>
  );
}

function ProjectBudget({ storageFallback }: { storageFallback: ImmutableStorage }) {
  return (
    <div>
      <div className="text-xs font-medium text-neutral-600 mb-2">Budget</div>
      <div className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
        ${(storageFallback as any).projectBudget || 0}
      </div>
    </div>
  );
}

function ProjectDates({ storageFallback }: { storageFallback: ImmutableStorage }) {
  return (
    <div>
      <div className="text-xs font-medium text-neutral-600 mb-2">Timeline</div>
      <div className="space-y-2">
        <div className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
          Start: {(storageFallback as any).projectStartDate || "Not set"}
        </div>
        <div className="px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-neutral-50">
          End: {(storageFallback as any).projectEndDate || "Not set"}
        </div>
      </div>
    </div>
  );
} 