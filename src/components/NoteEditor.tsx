"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import {
  FloatingComposer,
  FloatingThreads,
  liveblocksConfig,
  LiveblocksPlugin,
  useIsEditorReady,
} from "@liveblocks/react-lexical";
import { EditorTitle } from "@/components/EditorTitle";
import { WikiToolbar } from "@/components/WikiToolbar";
import { WikiKeyboardShortcuts } from "@/components/WikiKeyboardShortcuts";
import { AIComments } from "@/components/AIComments";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { ClientSideSuspense, useThreads } from "@liveblocks/react/suspense";
import { ReactNode } from "react";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";

// Wrap your Lexical config with `liveblocksConfig`
const initialConfig = liveblocksConfig({
  namespace: "NoteEditor",
  nodes: [
    HorizontalRuleNode,
    CodeNode,
    LinkNode,
    ListNode,
    ListItemNode,
    HeadingNode,
    QuoteNode,
  ],
  onError: (error: unknown) => {
    console.error(error);
    throw error;
  },
  theme: {
    text: {
      bold: "lexical-bold",
      italic: "lexical-italic",
      underline: "lexical-underline",
      strikethrough: "lexical-strikethrough",
      code: "lexical-code",
    },
    heading: {
      h1: "lexical-h1",
      h2: "lexical-h2", 
      h3: "lexical-h3",
    },
    list: {
      nested: {
        listitem: "lexical-nested-listitem",
      },
      ol: "lexical-list-ol",
      ul: "lexical-list-ul",
      listitem: "lexical-listitem",
    },
    quote: "lexical-quote",
    code: "lexical-code-block",
  },
});

export function NoteEditor() {
  const ready = useIsEditorReady();

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="">
        <div className="my-6">
          <ClientSideSuspense
            fallback={
              <div className="block w-full text-2xl font-bold my-6">
                Untitled Note
              </div>
            }
          >
            <EditorTitle />
          </ClientSideSuspense>
        </div>
        
        {/* Enhanced Wiki Toolbar */}
        <WikiToolbar />
        
        <div className="relative">
          <LiveblocksPlugin>
            {!ready ? (
              <div className="select-none cursor-wait editor-styles">
                <div className="text-neutral-500">Loading note editor...</div>
              </div>
            ) : (
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="outline-none editor-styles min-h-[300px] focus:bg-white" />
                }
                placeholder={
                  <div className="absolute top-0 left-0 pointer-events-none text-neutral-500 whitespace-nowrap">
                    Start writing your note here…
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            )}
            
            {/* Essential Plugins */}
            <HistoryPlugin />
            <ListPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <WikiKeyboardShortcuts />
            
            <ClientSideSuspense fallback={null}>
              <NoteEditorThreads />
            </ClientSideSuspense>
            <FloatingComposer />
          </LiveblocksPlugin>
        </div>
        
        {/* AI Comments Section */}
        <div className="border-t my-6" />
        <AIComments />
      </div>
    </LexicalComposer>
  );
}

function NoteEditorThreads() {
  const { threads } = useThreads({ query: { resolved: false } });
  return <FloatingThreads threads={threads} />;
} 