"use client";

import { LABELS } from "@/config";
import { Select } from "@/components/Select";
import { PlusIcon } from "@/icons/PlusIcon";
import { useState } from "react";

export function IssueLabels({
  storageFallback,
}: {
  storageFallback?: any;
}) {
  // For now, use local state for labels since database doesn't have labels column yet
  // TODO: Connect to database when labels column is added to issues table
  const [labels, setLabels] = useState<string[]>([]);

  const addLabel = (labelId: string) => {
    if (!labels.includes(labelId)) {
      setLabels(prev => [...prev, labelId]);
      // TODO: Save to database when labels column is available
    }
  };

  const removeLabel = (labelId: string) => {
    setLabels(prev => prev.filter(id => id !== labelId));
    // TODO: Remove from database when labels column is available
  };

  const LABEL_LIST = LABELS.map((label) => ({
    ...label,
    disabled: labels.includes(label.id),
  }));

  return (
    <div className="text-sm flex gap-1.5 justify-start items-start font-medium max-w-full flex-wrap min-h-[26px]">
      {LABELS.filter((label) => labels.includes(label.id)).map(
        ({ id, text }) => (
          <div
            key={id}
            className="text-sm font-medium rounded-full px-2 py-0.5 border shadow-xs flex items-center gap-1.5 select-none text-neutral-700"
          >
            <div className="bg-neutral-400/60 rounded-full w-2 h-2" />
            {text}{" "}
            <button
              className="text-base leading-none pb-0.5 text-neutral-400 hover:text-neutral-600 transition-colors"
              onClick={() => removeLabel(id)}
            >
              ×
            </button>
          </div>
        )
      )}
      <div className="overflow-hidden bg-transparent rounded-full transition-colors h-[26px]">
        <Select
          id="add1-label"
          value={"add"}
          items={[
            {
              id: "add",
              jsx: <PlusIcon className="w-4 h-4 -mt-0.5" />,
            },
            ...LABEL_LIST,
          ]}
          adjustFirstItem="hide"
          onValueChange={(value) => {
            addLabel(value);
          }}
        />
      </div>
    </div>
  );
}