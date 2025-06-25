"use client";

import { useState } from "react";

export function WikiHelp() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-accent text-white rounded-full p-3 shadow-lg hover:bg-accent/90 transition-colors z-50"
        aria-label="Show help"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-neutral-200 rounded-lg shadow-xl p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-neutral-900">Wiki Editor Help</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-400 hover:text-neutral-600"
          aria-label="Close help"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium text-neutral-800 mb-2">Keyboard Shortcuts</h4>
          <div className="space-y-1 text-neutral-600">
            <div className="flex justify-between">
              <span>Bold</span>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">⌘/Ctrl + B</kbd>
            </div>
            <div className="flex justify-between">
              <span>Italic</span>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">⌘/Ctrl + I</kbd>
            </div>
            <div className="flex justify-between">
              <span>Underline</span>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">⌘/Ctrl + U</kbd>
            </div>
            <div className="flex justify-between">
              <span>Code</span>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs">⌘/Ctrl + `</kbd>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-neutral-800 mb-2">Markdown Shortcuts</h4>
          <div className="space-y-1 text-neutral-600">
            <div><span className="font-mono"># </span>Heading 1</div>
            <div><span className="font-mono">## </span>Heading 2</div>
            <div><span className="font-mono">### </span>Heading 3</div>
            <div><span className="font-mono">- </span>Bullet list</div>
            <div><span className="font-mono">1. </span>Numbered list</div>
            <div><span className="font-mono">&gt; </span>Quote</div>
            <div><span className="font-mono">`code`</span> Inline code</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-neutral-800 mb-2">Features</h4>
          <div className="space-y-1 text-neutral-600">
            <div>• Real-time collaboration</div>
            <div>• AI-powered comments & suggestions</div>
            <div>• Rich text formatting</div>
            <div>• Auto-save</div>
            <div>• Smart thread analysis</div>
          </div>
        </div>
      </div>
    </div>
  );
} 