"use client";

import { useState, Suspense } from "react";
import { Room } from "@/app/Room";
import { WikiEditor } from "@/components/WikiEditor";
import { ErrorData } from "@/types";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

type Props = {
  initialDocument: any | null;
  initialError: ErrorData | null;
};

export function TextDocumentView({ initialDocument, initialError }: Props) {
  const [error, setError] = useState<ErrorData | null>(initialError);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-red-600">Error</h1>
        <p className="text-red-600">{error.message}</p>
        <p className="text-neutral-600">Code: {error.code}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-4">Loading wiki...</div>}>
      <Room issueId="wiki-main">
        <ResponsiveLayout>
          <WikiEditor roomId="wiki-main" />
        </ResponsiveLayout>
      </Room>
    </Suspense>
  );
} 