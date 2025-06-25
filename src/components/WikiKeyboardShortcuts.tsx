"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
} from "lexical";
import { useEffect } from "react";

export function WikiKeyboardShortcuts() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, key } = event;
      const mod = ctrlKey || metaKey;

      if (!mod) return;

      switch (key.toLowerCase()) {
        case "b":
          event.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          break;
        case "i":
          event.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          break;
        case "u":
          event.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          break;
        case "`":
          event.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
          break;
      }
    };

    return editor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload: KeyboardEvent) => {
        handleKeyDown(payload);
        return false;
      },
      1
    );
  }, [editor]);

  return null;
} 