"use client";

import { useNavigation } from "./NavigationContext";
import { Status } from "./Status";
import { Presence } from "./Presence";

export function IssueHeader() {
  const { goBack } = useNavigation();

  return (
    <header className="flex justify-between border-b h-10 px-4 items-center">
      <div className="flex items-center gap-3">
        <button 
          onClick={goBack}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 transition-colors text-sm font-medium group"
          title="Back"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <Status />
      </div>
      <Presence />
    </header>
  );
} 