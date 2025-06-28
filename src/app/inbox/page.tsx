"use client";

import { useState } from "react";
import { Inbox } from "@/components/Inbox";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { IssueProvider } from "@/app/IssueProvider";
import { Issue } from "@/components/Issue";

export default function PageHome() {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  return (
    <ResponsiveLayout>
      <main className="m-2 border dark:border-dark-bg-tertiary flex-grow bg-white dark:bg-dark-bg-primary rounded flex flex-row overflow-hidden">
        <div className="border-r dark:border-dark-bg-tertiary w-[300px]">
          <Inbox onIssueSelect={setSelectedIssueId} />
        </div>
        <div className="flex-grow">
          {selectedIssueId ? (
            <IssueProvider issueId={selectedIssueId}>
              <Issue issueId={selectedIssueId} />
            </IssueProvider>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-neutral-500 dark:text-dark-text-secondary font-medium">
              Select an issue
            </div>
          )}
        </div>
      </main>
    </ResponsiveLayout>
  );
}
