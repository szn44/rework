"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";
import { GripVertical } from "lucide-react";

// Simplified DraggableBlockPlugin - just provides drag handles
export default function DraggableBlockPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isEditable] = useState(true);

  return (
    <div className="draggable-block-menu opacity-0 hover:opacity-100 transition-opacity duration-200">
      <div className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600">
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
} 