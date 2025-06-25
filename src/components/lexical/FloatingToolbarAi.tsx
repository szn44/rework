"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CoreMessage } from "ai";
import { useSelection } from "../hooks/useSelection";
import { continueConversation } from "./actions/ai";
import { readStreamableValue } from "ai/rsc";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  TextNode,
} from "lexical";
import * as React from "react";
import { Command } from "cmdk";
import { motion } from "framer-motion";

// Import all the icons - for now using simple spans
const ReplaceIcon = ({ className }: { className?: string }) => <span className={className}>🔄</span>;
const InsertInlineIcon = ({ className }: { className?: string }) => <span className={className}>➕</span>;
const BackIcon = ({ className }: { className?: string }) => <span className={className}>←</span>;
const RestartIcon = ({ className }: { className?: string }) => <span className={className}>🔄</span>;
const OptionsIcon = ({ className }: { className?: string }) => <span className={className}>⚙️</span>;
const RubbishIcon = ({ className }: { className?: string }) => <span className={className}>🗑️</span>;
const InsertParagraphIcon = ({ className }: { className?: string }) => <span className={className}>¶</span>;
const SparklesIcon = ({ className }: { className?: string }) => <span className={className}>✨</span>;
const ContinueIcon = ({ className }: { className?: string }) => <span className={className}>→</span>;
const CopyIcon = ({ className }: { className?: string }) => <span className={className}>📋</span>;

// Preserve selection commands
const SAVE_SELECTION_COMMAND = "save-selection";
const RESTORE_SELECTION_COMMAND = "restore-selection";

// AI prompts organized by category
const optionsGroups = [
  {
    name: "Edit or review",
    options: [
      { text: "Improve writing", value: "improve" },
      { text: "Fix spelling & grammar", value: "fix" },
      { text: "Make shorter", value: "shorter" },
      { text: "Make longer", value: "longer" },
      { text: "Change tone", value: "tone" },
    ],
  },
  {
    name: "Generate",
    options: [
      { text: "Summarize", value: "summarize" },
      { text: "Explain", value: "explain" },
      { text: "Find action items", value: "actions" },
      { text: "Translate", value: "translate" },
    ],
  },
  {
    name: "Create",
    options: [
      { text: "Brainstorm ideas", value: "brainstorm" },
      { text: "Write outline", value: "outline" },
      { text: "Create pros & cons", value: "proscons" },
    ],
  },
];

export function FloatingToolbarAi({
  state,
  setState,
  onClose,
}: {
  state: "default" | "ai" | "closed";
  setState: (state: "default" | "ai" | "closed") => void;
  onClose: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const { textContent } = useSelection();
  const [input, setInput] = useState("");

  // Current state of components and
  const [aiState, setAiState] = useState<"initial" | "loading" | "complete">(
    "initial"
  );

  // Store all messages to and from AI
  const [messages, setMessages] = useState<CoreMessage[]>([]);

  // Get the last message sent from AI
  const lastAiMessage = useMemo(() => {
    const lastMessage = messages.filter((m) => m.role === "assistant")[0];
    return lastMessage
      ? { role: "assistant", content: `${lastMessage.content}` }
      : null;
  }, [messages]);

  // Store each "page" in the command panel
  const [pages, setPages] = React.useState<string[]>([]);
  const page = pages[pages.length - 1];

  // Get currently selected page
  const selectedOption = useMemo(() => {
    return optionsGroups
      .flatMap((group) => group.options)
      .find((option) => option.text === page);
  }, [page]);

  // Remember previous prompt for continuing and regenerating
  const [previousPrompt, setPreviousPrompt] = useState("");

  // Send prompt to AI
  const submitPrompt = useCallback(
    async (prompt: string) => {
      setAiState("loading");
      setInput("");
      setPreviousPrompt(prompt);

      // Send on the user's text
      const systemMessage = `Do not surround your answer in quote marks. Only return the answer, nothing else. The user is selecting this text: 
            
"""
${textContent || ""}
"""
`;

      // Create new messages with selected text and prompt from user or command panel
      const newMessages: CoreMessage[] = [
        ...messages,
        { content: systemMessage, role: "system" },
        { content: prompt, role: "user" },
      ];
      setMessages(newMessages);

      // Stream in results
      const result = await continueConversation(newMessages);
      for await (const content of readStreamableValue(result)) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: content as string,
          },
        ]);
      }
      setAiState("complete");
    },
    [textContent, setAiState, messages]
  );

  // Focus command panel on load and page change
  const commandRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state === "ai" && commandRef.current) {
      commandRef.current.focus();
    }
  }, [state, aiState, page]);

  return (
    <>
      <motion.div
        layoutId="floating-toolbar-main"
        layout="size"
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          type: "spring",
          duration: 0.25,
        }}
        className="isolate rounded-lg border shadow-xl border-gray-300/75 bg-card pointer-events-auto overflow-hidden origin-top-left"
        onMouseDown={() => {
          // Prevent clicks outside of input from removing selection
          // editor.dispatchCommand(SAVE_SELECTION_COMMAND, null);
        }}
        onMouseUp={() => {
          // editor.dispatchCommand(RESTORE_SELECTION_COMMAND, null);
        }}
      >
        {lastAiMessage ? (
          // If the AI has streamed in content, show it
          <motion.div
            layout="position"
            transition={{ duration: 0 }}
            className="flex items-start border-b border-gray-300  gap-1.5"
          >
            <div className="flex-grow whitespace-pre-wrap max-h-[130px] overflow-y-auto select-none relative px-3 py-2 pr-10">
              <div className="sticky w-full top-1 right-0">
                <button
                  className="opacity-30 transition-opacity hover:opacity-60 absolute top-0 -right-8"
                  onClick={async () => {
                    if (!lastAiMessage.content) {
                      return;
                    }
                    // Copy generated text to clipboard
                    try {
                      await navigator.clipboard.writeText(
                        lastAiMessage.content
                      );
                    } catch (err) {
                      console.error("Failed to copy: ", err);
                    }
                  }}
                >
                  <CopyIcon className="h-4" />
                </button>
              </div>
              {lastAiMessage.content}
            </div>
          </motion.div>
        ) : null}

        <motion.form
          layout="position"
          transition={{ duration: 0 }}
          onSubmit={async (e) => {
            // Submit a custom prompt typed into the input
            e.preventDefault();
            submitPrompt(input);
            setInput("");

            // Restore text editor selection when prompt submitted
            // editor.dispatchCommand(RESTORE_SELECTION_COMMAND, null);
          }}
          className="w-full"
        >
          <Command ref={commandRef} shouldFilter={false} className="bg-transparent">
            <div className="flex items-center gap-1.5 px-2 py-2 border-b border-gray-300">
              {pages.length > 0 ? (
                <button
                  type="button"
                  className="hover:bg-gray-100 rounded p-1 h-8 w-8 flex items-center justify-center transition-colors"
                  onClick={() => setPages((pages) => pages.slice(0, -1))}
                >
                  <BackIcon className="h-4" />
                </button>
              ) : (
                <div className="flex items-center justify-center h-8 w-8">
                  <SparklesIcon className="h-4 text-purple-500" />
                </div>
              )}
              <Command.Input
                placeholder={
                  selectedOption ? selectedOption.text : "Ask AI to edit or generate..."
                }
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-500"
                value={input}
                onValueChange={setInput}
                disabled={aiState === "loading"}
              />
            </div>

            <Command.List className="max-h-52 overflow-y-auto">
              {/* Show loading state */}
              {aiState === "loading" ? (
                <div className="px-2 py-1.5">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border border-gray-300 border-t-purple-500 rounded-full" />
                    Generating...
                  </div>
                </div>
              ) : null}

              {/* Show custom input when typing */}
              {input && pages.length === 0 ? (
                <CommandItem onSelect={() => submitPrompt(input)}>
                  <SparklesIcon className="h-4 text-purple-500" />
                  {input}
                </CommandItem>
              ) : null}

              {/* Show options groups when no pages selected */}
              {pages.length === 0 && !input
                ? optionsGroups.map((group) => (
                    <Fragment key={group.name}>
                      <Command.Separator />
                      <Command.Group
                        heading={group.name}
                        className="text-xs text-gray-500 px-2 py-1 uppercase tracking-wide"
                      >
                        {group.options.map((option) => (
                          <CommandItem
                            key={option.value}
                            onSelect={() => {
                              submitPrompt(option.text);
                            }}
                          >
                            {option.text}
                          </CommandItem>
                        ))}
                      </Command.Group>
                    </Fragment>
                  ))
                : null}
            </Command.List>
          </Command>
        </motion.form>

        {/* Action buttons when AI response is complete */}
        {aiState === "complete" && lastAiMessage ? (
          <motion.div
            layout="position"
            transition={{ duration: 0 }}
            className="flex justify-between items-center px-2 py-1.5 border-t border-gray-300 bg-gray-50/50"
          >
            <div className="flex gap-1">
              <button
                type="button"
                className="hover:bg-gray-100 rounded p-1.5 transition-colors"
                onClick={() => {
                  // Replace selected text with AI response
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) && lastAiMessage.content) {
                      selection.insertText(lastAiMessage.content);
                    }
                  });
                  onClose();
                }}
              >
                <ReplaceIcon className="h-4" />
              </button>
              <button
                type="button"
                className="hover:bg-gray-100 rounded p-1.5 transition-colors"
                onClick={() => {
                  // Insert AI response below selection
                  editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection) && lastAiMessage.content) {
                      const paragraph = $createParagraphNode();
                      paragraph.append($createTextNode(lastAiMessage.content));
                      selection.insertNodes([paragraph]);
                    }
                  });
                  onClose();
                }}
              >
                <InsertParagraphIcon className="h-4" />
              </button>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                className="hover:bg-gray-100 rounded p-1.5 transition-colors"
                onClick={() => {
                  if (previousPrompt) {
                    submitPrompt(previousPrompt);
                  }
                }}
              >
                <RestartIcon className="h-4" />
              </button>
              <button
                type="button"
                className="hover:bg-gray-100 rounded p-1.5 transition-colors"
                onClick={() => {
                  setMessages([]);
                  setAiState("initial");
                }}
              >
                <RubbishIcon className="h-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </motion.div>
    </>
  );
}

function CommandItem({
  children,
  icon,
  onSelect,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onSelect: ((value: string) => void) | undefined;
}) {
  return (
    <Command.Item
      className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer transition-colors data-[selected=true]:bg-gray-100"
      onSelect={onSelect}
    >
      {icon}
      {children}
    </Command.Item>
  );
} 