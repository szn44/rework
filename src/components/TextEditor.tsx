"use client";

import { NoteEditor } from "@/components/NoteEditor";
import { AIComments } from "@/components/AIComments";

export function TextEditor() {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <NoteEditor />
      </div>

      {/* AI Comments Section */}
      <div className="border-t bg-neutral-50 p-4">
        <div className="max-w-4xl mx-auto">
          <AIComments />
        </div>
      </div>
    </div>
  );
} 