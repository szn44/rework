"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, COMMAND_PRIORITY_EDITOR, LexicalCommand, createCommand } from "lexical";
import { useEffect } from "react";

export const SAVE_SELECTION_COMMAND: LexicalCommand<null> = createCommand("SAVE_SELECTION_COMMAND");
export const RESTORE_SELECTION_COMMAND: LexicalCommand<null> = createCommand("RESTORE_SELECTION_COMMAND");

export function PreserveSelectionPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let savedSelection: null | any = null;

    const saveSelection = () => {
      editor.getEditorState().read(() => {
        savedSelection = $getSelection()?.clone() || null;
      });
      return false;
    };

    const restoreSelection = () => {
      editor.update(() => {
        if (savedSelection) {
          savedSelection.dirty = true;
          $getSelection()?.insertRawText("");
        }
      });
      return false;
    };

    return editor.registerCommand(
      SAVE_SELECTION_COMMAND,
      saveSelection,
      COMMAND_PRIORITY_EDITOR
    ) &&
    editor.registerCommand(
      RESTORE_SELECTION_COMMAND,
      restoreSelection,
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
} 