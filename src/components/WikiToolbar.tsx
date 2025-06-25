"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import { useCallback, useEffect, useState } from "react";
import { BoldIcon } from "@/icons/BoldIcon";
import { ItalicIcon } from "@/icons/ItalicIcon";
import { UnderlineIcon } from "@/icons/UnderlineIcon";
import { StrikethroughIcon } from "@/icons/StrikethroughIcon";
import { CodeIcon } from "@/icons/CodeIcon";

const LowPriority = 1;

export function WikiToolbar() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = element;
          const type = parentList.getListType();
          setBlockType(type);
        } else {
          const type = element.getType();
          if (type === "heading") {
            const tag = (element as any).getTag();
            setBlockType(tag);
          } else {
            setBlockType(type);
          }
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      LowPriority
    );
  }, [editor, updateToolbar]);

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 p-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Block Type Selector */}
        <div className="flex items-center gap-1 mr-4">
          <select
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            value={blockType}
            onChange={(e) => {
              const value = e.target.value;
              switch (value) {
                case "paragraph":
                  formatParagraph();
                  break;
                case "h1":
                  formatHeading("h1");
                  break;
                case "h2":
                  formatHeading("h2");
                  break;
                case "h3":
                  formatHeading("h3");
                  break;
                case "quote":
                  formatQuote();
                  break;
                case "bullet":
                  formatBulletList();
                  break;
                case "number":
                  formatNumberedList();
                  break;
              }
            }}
          >
            <option value="paragraph">Normal Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="quote">Quote</option>
            <option value="bullet">Bullet List</option>
            <option value="number">Numbered List</option>
          </select>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              isBold
                ? "bg-accent text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
            aria-label="Format Bold"
          >
            <BoldIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              isItalic
                ? "bg-accent text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
            aria-label="Format Italic"
          >
            <ItalicIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              isUnderline
                ? "bg-accent text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
            aria-label="Format Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            }}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              isStrikethrough
                ? "bg-accent text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
            aria-label="Format Strikethrough"
          >
            <StrikethroughIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            }}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              isCode
                ? "bg-accent text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
            aria-label="Format Code"
          >
            <CodeIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Quick List Buttons */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={formatBulletList}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              blockType === "bullet"
                ? "bg-accent text-white"
                : "text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            • List
          </button>
          <button
            onClick={formatNumberedList}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              blockType === "number"
                ? "bg-accent text-white"
                : "text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            1. List
          </button>
        </div>
      </div>
    </div>
  );
} 