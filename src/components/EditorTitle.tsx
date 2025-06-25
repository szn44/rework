"use client";

import {
  ClientSideSuspense,
  useMutation,
  useStorage,
} from "@liveblocks/react/suspense";
import {
  ChangeEvent,
  useCallback,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  KEY_ARROW_UP_COMMAND,
} from "lexical";

export function EditorTitle() {
  const title = useStorage((root) => root.meta.title);
  const [editor] = useLexicalComposerContext();
  const [localTitle, setLocalTitle] = useState(title || "Untitled");
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Sync local title with storage title
  useEffect(() => {
    setLocalTitle(title || "Untitled");
  }, [title]);

  // Update title in storage
  const updateStorageTitle = useMutation(
    ({ storage }, newTitle: string) => {
      storage.get("meta").set("title", newTitle);
    },
    []
  );

  // Get current room ID from URL
  const getCurrentRoomId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const pathname = window.location.pathname;
    if (pathname.includes('/issue/')) {
      const issueId = pathname.split('/issue/')[1];
      return `liveblocks:examples:nextjs-project-manager-${issueId}`;
    }
    return null;
  }, []);

  // Update title in room metadata (debounced)
  const updateMetadataTitle = useCallback(async (newTitle: string) => {
    const roomId = getCurrentRoomId();
    if (!roomId || !newTitle || newTitle === "Untitled") return;
    
    try {
      const response = await fetch('/api/update-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          metadata: {
            title: newTitle,
          },
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update issue title metadata');
      }
    } catch (error) {
      console.error('Error updating issue title metadata:', error);
    }
  }, [getCurrentRoomId]);

  // Handle title changes with debouncing
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value || "Untitled";
    setLocalTitle(newTitle);
    updateStorageTitle(newTitle);

    // Debounce metadata updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      updateMetadataTitle(newTitle);
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

  // Go to editor when down arrow pressed
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setTimeout(() => editor._rootElement?.focus());
    }
  }, [editor]);

  // Go to input when up arrow pressed in first position of editor
  const inputRef = useRef<HTMLInputElement | null>(null);
  useUpArrowAtTopListener(() => {
    inputRef.current?.focus();
  });

  return (
    <input
      ref={inputRef}
      type="text"
      value={localTitle}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="outline-none block w-full text-2xl font-bold bg-transparent"
      placeholder="Untitled"
    />
  );
}

function useUpArrowAtTopListener(callback: () => void) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const topElement = selection.anchor
            .getNode()
            .getTopLevelElementOrThrow();
          const firstChild = topElement.getParentOrThrow().getFirstChild();

          // Check if the anchor node is the first child and at the start
          if (topElement.is(firstChild) && selection.anchor.offset === 0) {
            callback();
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor, callback]);
}
