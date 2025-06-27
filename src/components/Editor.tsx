"use client";

import { useState, useEffect } from "react";
import { useIssue } from "@/app/IssueProvider";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, $getRoot } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { ReactNode } from "react";
import { LinkNode } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { EditorTitle } from "@/components/EditorTitle";

// Standard Lexical config without Liveblocks
const initialConfig = {
  namespace: "IssueEditor",
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
      underline: "lexical-underline",
      strikethrough: "lexical-strikethrough",
    },
  },
};

export function Editor({
  contentFallback,
  storageFallback,
}: {
  contentFallback: ReactNode;
  storageFallback: any;
}) {
  const { issue, updateIssue } = useIssue();
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    // Simulate editor ready state
    const timer = setTimeout(() => setIsEditorReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEditorChange = async (editorState: EditorState) => {
    if (!issue) return;
    
    // Extract plain text for search indexing
    let textContent = '';
    editorState.read(() => {
      const root = $getRoot();
      textContent = root.getTextContent();
    });

    // Debounced save to database
    try {
      await updateIssue({
        content: editorState.toJSON(),
        content_text: textContent
      });
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="">
        <div className="my-6">
          <EditorTitle />
        </div>
        <div className="relative">
          {!isEditorReady ? (
            <div className="select-none cursor-wait editor-styles">
              {contentFallback}
            </div>
          ) : (
            <>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="outline-none editor-styles min-h-[200px]" />
                }
                placeholder={
                  <div className="absolute top-0 left-0 pointer-events-none text-neutral-500 whitespace-nowrap">
                    Start typing here…
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <OnChangePlugin onChange={handleEditorChange} />
            </>
          )}
        </div>
      </div>
    </LexicalComposer>
  );
}
