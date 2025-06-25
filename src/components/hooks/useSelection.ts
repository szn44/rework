"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from "lexical";
import { useEffect, useState } from "react";

export function useSelection() {
  const [editor] = useLexicalComposerContext();
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    const updateTextContent = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const text = selection.getTextContent();
          setTextContent(text);
        } else {
          setTextContent("");
        }
      });
    };

    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateTextContent();
        return false;
      },
      1
    );

    return unregister;
  }, [editor]);

  return { textContent };
} 