"use client";

import { Composer } from "@liveblocks/react-ui";
import { useCreateThread } from "@liveblocks/react/suspense";
import { useState } from "react";
import { AIService } from "@/services/aiService";

interface AIComposerProps {
  className?: string;
}

export function AIComposer({ className }: AIComposerProps) {
  const createThread = useCreateThread();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      // Use AI service to generate comment
      const aiResponse = await AIService.generateComment();
      
      // Create a thread with the AI suggestion
      createThread({ 
        body: {
          version: 1,
          content: [
            {
              type: "paragraph",
              children: [
                { 
                  text: `🤖 AI Suggestion (${Math.round(aiResponse.confidence * 100)}% confidence): ${aiResponse.suggestion}`,
                  bold: false 
                }
              ]
            }
          ]
        }
      });
    } catch (error) {
      console.error("Failed to generate AI comment:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-neutral-700">Add Comment</h4>
        <button
          type="button"
          onClick={handleAIGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              AI Suggest
            </>
          )}
        </button>
      </div>
      <Composer className={className} />
    </div>
  );
} 