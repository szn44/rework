"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { ChevronDown, Calendar, Clock, Play, Settings, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { KanbanBoard } from "./KanbanBoard";
import { CreateSpaceIssueButton } from "./CreateSpaceIssueButton";

interface WikiEditorProps {
  roomId: string;
  spaceName?: string;
  kanbanItems?: Array<{
    room: any;
    metadata: {
      issueId: string;
      title: string;
      priority: string;
      progress: string;
      assignedTo: string[];
      labels: string[];
      project?: string;
    };
  }>;
}

// Custom CSS to override BlockNote default spacing
const blockNoteCustomStyles = `
  .bn-editor {
    padding-left: 0 !important;
    margin-left: 0 !important;
  }
  .bn-editor .ProseMirror {
    padding-left: 0 !important;
    margin-left: 0 !important;
  }
  .bn-editor .bn-block-group {
    padding-left: 0 !important;
    margin-left: 0 !important;
  }
  .bn-editor .bn-block-content {
    padding-left: 0 !important;
    margin-left: 0 !important;
  }
`;

export function WikiEditor({ roomId, spaceName, kanbanItems = [] }: WikiEditorProps) {
  const [activeTab, setActiveTab] = useState("Space");
  const [aiInput, setAiInput] = useState("");

  // Create BlockNote editor instance with light theme
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "",
      },
    ],
  });

  const tabs = [
    { name: "Space", icon: "🏠" },
    { name: "Agent", icon: "🤖" },
    { name: "To-do list", icon: "✅" },
  ];

  // Get the display title from roomId
  const getDisplayTitle = (roomId: string) => {
    // If spaceName is provided, use it; otherwise convert roomId to display format
    if (spaceName) {
      return spaceName;
    }
    return roomId;
  };

  const renderSpaceContent = () => (
    <>
      {/* Custom CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: blockNoteCustomStyles }} />
      
      {/* Editor Header */}
      <div className="mb-8">
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none mb-6"
          style={{ fontSize: "1.75rem", lineHeight: "1.2" }}
        />
        
        {/* Schedule Section */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Run every</span>
            <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
              <span>day</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <span>at</span>
            <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <span>9:00 AM</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Play className="w-4 h-4" />
              <span>Test</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* BlockNote Editor */}
      <div className="mb-8">
        <BlockNoteView 
          editor={editor} 
          theme="light"
          className="bg-white min-h-[400px] [&_.bn-editor]:!pl-0 [&_.ProseMirror]:!pl-0"
        />
      </div>

      {/* Liveblocks AI Textbox */}
      <div className="pt-6">
        <div className="max-w-[650px] mx-auto">
          <div className="relative">
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Describe the goal of the agent."
              className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
              rows={4}
            />
            <button className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderAgentContent = () => (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🤖</span>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Agent Configuration</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Set up an intelligent agent to automate tasks and integrations for this space.
        </p>
      </div>

      {/* Agent Configuration Form */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
          <input
            type="text"
            placeholder="Enter agent name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
          <textarea
            placeholder="Describe what this agent should accomplish..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Integrations</label>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">Z</span>
                </div>
                <span className="font-medium">Zero Integration</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700">Configure</button>
            </div>
            
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700">
              + Add Integration
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );

  const renderTodoContent = () => (
    <>
      {/* Kanban Board Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Board</h2>
        <CreateSpaceIssueButton spaceId={roomId} />
      </div>

      {/* Real Kanban Board */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <KanbanBoard 
          items={kanbanItems} 
          type="issue"
          onProgressChange={async (roomId, newProgress) => {
            console.log(`Moving ${roomId} to ${newProgress}`);
            try {
              const response = await fetch('/api/update-issue', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  roomId,
                  metadata: {
                    progress: newProgress,
                  },
                }),
              });
              
              if (!response.ok) {
                console.error('Failed to update issue progress');
              } else {
                // Refresh the page to show updated data
                window.location.reload();
              }
            } catch (error) {
              console.error('Error updating issue progress:', error);
            }
          }}
        />
      </div>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Space":
        return renderSpaceContent();
      case "Agent":
        return renderAgentContent();
      case "To-do list":
        return renderTodoContent();
      default:
        return renderSpaceContent();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900"># {getDisplayTitle(roomId)}</h1>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center space-x-6 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center space-x-2 pb-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab.name
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
            <button className="flex items-center justify-center w-8 h-4 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "To-do list" ? (
          // Full-width kanban board without container constraints
          <div className="h-full px-6 py-8 flex flex-col">
            {renderTodoContent()}
          </div>
        ) : (
          // Regular container for other tabs - also left-aligned
          <div className="h-full overflow-auto px-16 py-10">
            {renderTabContent()}
          </div>
        )}
      </div>
    </div>
  );
} 