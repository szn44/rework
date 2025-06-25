"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from "lexical";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { useEffect, useState } from "react";

export function useActiveBlock() {
  const [editor] = useLexicalComposerContext();
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  useEffect(() => {
    const updateActiveBlock = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getKey() === "root" 
            ? anchorNode 
            : anchorNode.getTopLevelElementOrThrow();

          if ($isHeadingNode(element)) {
            setActiveBlock(`h${element.getTag().slice(1)}`);
          } else if ($isQuoteNode(element)) {
            setActiveBlock("quote");
          } else {
            setActiveBlock("paragraph");
          }
        } else {
          setActiveBlock(null);
        }
      });
    };

    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateActiveBlock();
        return false;
      },
      1
    );

    return unregister;
  }, [editor]);

  return activeBlock;
} 