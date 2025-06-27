"use client";

import { useIssue } from "@/app/IssueProvider";
import { useState, useEffect, useRef, useCallback, ChangeEvent, KeyboardEvent } from "react";

export function EditorTitle() {
  const { issue, updateIssue } = useIssue();
  const [localTitle, setLocalTitle] = useState(issue?.title || "Untitled");
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Sync local title with issue title
  useEffect(() => {
    setLocalTitle(issue?.title || "Untitled");
  }, [issue?.title]);

  // Handle title changes with debouncing
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value || "Untitled";
    setLocalTitle(newTitle);

    // Debounce database updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        await updateIssue({ title: newTitle });
      } catch (error) {
        console.error('Failed to update issue title:', error);
      }
    }, 1000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      // Focus on editor content area
      const editorElement = document.querySelector('.editor-styles [contenteditable="true"]') as HTMLElement;
      if (editorElement) {
        setTimeout(() => editorElement.focus());
      }
    }
  }, []);

  return (
    <input
      type="text"
      value={localTitle}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="outline-none block w-full text-2xl font-bold bg-transparent"
      placeholder="Untitled"
    />
  );
}