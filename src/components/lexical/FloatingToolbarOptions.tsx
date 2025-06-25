"use client";

import { Sparkles, Bold, Italic, Underline, Strikethrough, Code } from "lucide-react";
import {
  $createParagraphNode,
  $getSelection,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { motion } from "framer-motion";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MouseEventHandler, ReactNode, useCallback } from "react";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { useActiveBlock } from "../hooks/useActiveBlock";

// Options in the toolbar's dropdown
const DROPDOWN_OPTIONS = [
  {
    id: "paragraph",
    text: "Paragraph",
  },
  {
    id: "quote",
    text: "Quote",
  },
  {
    id: "h1",
    text: "Heading 1",
  },
  {
    id: "h2",
    text: "Heading 2",
  },
  {
    id: "h3",
    text: "Heading 3",
  },
  {
    id: "h4",
    text: "Heading 4",
  },
  {
    id: "h5",
    text: "Heading 5",
  },
  {
    id: "h6",
    text: "Heading 6",
  },
];

type DropdownIds = (typeof DROPDOWN_OPTIONS)[number]["id"];

export function FloatingToolbarOptions({
  state,
  setState,
  onOpenAi,
}: {
  state: "default" | "ai" | "closed";
  setState: (state: "default" | "ai" | "closed") => void;
  onOpenAi: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const activeBlock = useActiveBlock();

  // Change between block types
  const toggleBlock = useCallback(
    (type: DropdownIds) => {
      const selection = $getSelection();

      if (activeBlock === type || type === "paragraph") {
        return $setBlocksType(selection, () => $createParagraphNode());
      }

      if (type === "h1") {
        return $setBlocksType(selection, () => $createHeadingNode("h1"));
      }

      if (type === "h2") {
        return $setBlocksType(selection, () => $createHeadingNode("h2"));
      }

      if (type === "h3") {
        return $setBlocksType(selection, () => $createHeadingNode("h3"));
      }

      if (type === "h4") {
        return $setBlocksType(selection, () => $createHeadingNode("h4"));
      }

      if (type === "h5") {
        return $setBlocksType(selection, () => $createHeadingNode("h5"));
      }

      if (type === "h6") {
        return $setBlocksType(selection, () => $createHeadingNode("h6"));
      }

      if (type === "quote") {
        return $setBlocksType(selection, () => $createQuoteNode());
      }
    },
    [activeBlock]
  );

  return (
    <motion.div
      layoutId="floating-toolbar-main"
      layout="size"
      style={{ display: state !== "ai" ? "block" : "none" }}
      className="p-1 rounded-lg border shadow-lg border-gray-200 bg-white pointer-events-auto origin-top text-gray-600"
      initial={{ x: 0, y: 0, opacity: 0, scale: 0.93 }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: "spring",
        duration: 0.25,
      }}
    >
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => {
            setState("ai");
            onOpenAi();
          }}
          className="px-3 py-1.5 inline-flex relative items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 h-8"
        >
          <div className="flex items-center text-indigo-600 font-semibold">
            <Sparkles className="h-4 w-4 mr-1" /> AI
          </div>
        </button>

        <span className="w-[1px] py-3.5 bg-gray-200" />

        <label htmlFor="select-block" className="h-8 items-center align-top">
          <span className="sr-only">Select block type</span>
          <select
            id="select-block"
            onChange={(e) => {
              editor.update(() => toggleBlock(e.currentTarget.value as DropdownIds));
            }}
            className="bg-transparent border-0 h-8 pl-2 pr-6 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-gray-100 text-sm"
            value={activeBlock || "paragraph"}
          >
            {DROPDOWN_OPTIONS.map(({ id, text }) => (
              <option key={id} value={id}>
                {text}
              </option>
            ))}
          </select>
        </label>

        <span className="w-[1px] py-3.5 bg-gray-200" />

        <ToolbarButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            setState("default");
          }}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            setState("default");
          }}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            setState("default");
          }}
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            setState("default");
          }}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            setState("default");
          }}
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </motion.div>
  );
}

function ToolbarButton({
  onClick,
  children,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 hover:text-gray-900 h-8 w-8"
    >
      {children}
    </button>
  );
} 