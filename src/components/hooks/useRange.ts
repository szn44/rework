"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from "lexical";
import { useEffect, useRef, useState } from "react";

export function useRange() {
  const [editor] = useLexicalComposerContext();
  const [range, setRange] = useState<Range | null>(null);
  const rangeRef = useRef<Range | null>(null);

  useEffect(() => {
    const updateRange = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const newRange = domSelection.getRangeAt(0);
            setRange(newRange);
            rangeRef.current = newRange;
          } else {
            setRange(null);
            rangeRef.current = null;
          }
        } else {
          setRange(null);
          rangeRef.current = null;
        }
      });
    };

    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateRange();
        return false;
      },
      1
    );

    return unregister;
  }, [editor]);

  return { range, rangeRef };
} 