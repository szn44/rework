"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentHeader, DocumentHeaderSkeleton } from "@/components/Document";
import { NoteEditor } from "@/components/NoteEditor";
import { DocumentLayout, DocumentProviders } from "@/layouts/Document";
import { ErrorLayout } from "@/layouts/Error";
import { Document, ErrorData } from "@/types";

type Props = {
  initialDocument: Document | null;
  initialError: ErrorData | null;
};

export function NoteDocumentView({ initialDocument, initialError }: Props) {
  const params = useParams<{ id?: string; error?: string }>();
  const [error, setError] = useState<ErrorData | null>(initialError);

  // If error object in params, retrieve it
  useEffect(() => {
    if (params.error) {
      setError(JSON.parse(decodeURIComponent(params.error as string)));
    }
  }, [params.error]);

  if (error) {
    return <ErrorLayout error={error} />;
  }

  if (!initialDocument) {
    return (
      <DocumentLayout header={<DocumentHeaderSkeleton />}>
        <div className="text-neutral-500">Loading document...</div>
      </DocumentLayout>
    );
  }

  // Use the id from params if available, otherwise use the document id
  const roomId = params.id || initialDocument.id;

  return (
    <DocumentProviders roomId={roomId} initialDocument={initialDocument}>
      <DocumentLayout
        header={
          <DocumentHeader documentId={initialDocument.id} showTitle={false} />
        }
      >
        <NoteEditor />
      </DocumentLayout>
    </DocumentProviders>
  );
} 