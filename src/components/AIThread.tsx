"use client";

import { ThreadData } from "@liveblocks/client";
import { Thread } from "@liveblocks/react-ui";
import { useState } from "react";
import { AIService } from "@/services/aiService";

interface AIThreadProps {
  thread: ThreadData;
}

export function AIThread({ thread }: AIThreadProps) {
  const [open, setOpen] = useState(!thread.resolved);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const generateAISuggestion = async () => {
    setIsGeneratingSuggestion(true);
    try {
      // Use AI service to analyze thread content
      const threadContent = `Thread ID: ${thread.id}`;
      const aiResponse = await AIService.analyzeThread(threadContent);
      
      setAiSuggestion(`${aiResponse.suggestion} (Confidence: ${Math.round(aiResponse.confidence * 100)}%)`);
    } catch (error) {
      console.error("Failed to generate AI suggestion:", error);
      setAiSuggestion("Sorry, I couldn't analyze this thread at the moment. Please try again later.");
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border border-neutral-200 my-4 rounded-lg overflow-hidden shadow-sm bg-white w-full text-sm text-left flex items-center h-10 px-3 hover:bg-neutral-50 transition-colors"
      >
        <span className="text-green-600 mr-2">✓</span>
        Thread resolved
      </button>
    );
  }

  return (
    <div className="border border-neutral-200 my-4 rounded-lg overflow-hidden shadow-sm bg-white">
      <Thread
        thread={thread}
        onResolvedChange={(resolved) => {
          if (resolved) {
            setOpen(false);
          }
        }}
        className="border-none shadow-none"
      />
      
      {/* AI Enhancement Section */}
      <div className="border-t border-neutral-100 bg-gradient-to-r from-purple-50 to-blue-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-purple-700">AI Assistant</span>
          </div>
          
          {!aiSuggestion && (
            <button
              onClick={generateAISuggestion}
              disabled={isGeneratingSuggestion}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-purple-200 text-purple-700 rounded hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingSuggestion ? (
                <>
                  <div className="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Get Suggestion
                </>
              )}
            </button>
          )}
        </div>
        
        {aiSuggestion && (
          <div className="mt-2 p-2 bg-white rounded border border-purple-200">
            <p className="text-sm text-neutral-700">💡 {aiSuggestion}</p>
            <button
              onClick={() => setAiSuggestion(null)}
              className="mt-1 text-xs text-purple-600 hover:text-purple-700"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 