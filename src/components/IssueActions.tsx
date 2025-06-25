"use client";

import { getRoomId } from "@/config";
import { useState } from "react";
import { Loading } from "@/components/Loading";
import { useRouter } from "next/navigation";

export function IssueActions({ issueId }: { issueId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (deleting) return; // Prevent double-clicks
    
    setDeleting(true);
    try {
      // Use API route instead of server action
      const response = await fetch('/api/delete-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issueId }),
      });

      if (response.ok) {
        // Navigate back to issues list
        router.push('/');
      } else {
        console.error('Failed to delete issue:', response.statusText);
      }
    } catch (error) {
      console.error("Failed to delete issue:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {deleting ? (
        <div className="inset-0 bg-neutral-100/50 fixed z-50">
          <Loading />
        </div>
      ) : null}
      <button
        className="text-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={deleting}
        onClick={handleDelete}
      >
        {deleting ? 'Deleting...' : 'Delete issue'}
      </button>
    </>
  );
}
