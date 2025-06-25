"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_UP_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, TextNode } from "lexical";
import { useCallback, useEffect, useState } from "react";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createCodeNode } from "@lexical/code";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { createPortal } from "react-dom";
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Minus,
  CheckSquare 
} from "lucide-react";

interface SlashCommand {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export function SlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const commands: SlashCommand[] = [
    {
      key: "paragraph",
      title: "Text",
      description: "Just start typing with plain text",
      icon: <Type className="w-4 h-4" />,
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
      },
    },
    {
      key: "h1",
      title: "Heading 1",
      description: "Big section heading",
      icon: <Heading1 className="w-4 h-4" />,
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h1"));
          }
        });
      },
    },
    {
      key: "h2",
      title: "Heading 2",
      description: "Medium section heading",
      icon: <Heading2 className="w-4 h-4" />,
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h2"));
          }
        });
      },
    },
    {
      key: "h3",
      title: "Heading 3",
      description: "Small section heading",
      icon: <Heading3 className="w-4 h-4" />,
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h3"));
          }
        });
      },
    },
    {
      key: "bullet",
      title: "Bullet List",
      description: "Create a simple bullet list",
      icon: <List className="w-4 h-4" />,
      onSelect: () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      },
    },
    {
      key: "numbered",
      title: "Numbered List",
      description: "Create a list with numbering",
      icon: <ListOrdered className="w-4 h-4" />,
      onSelect: () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      },
    },
    {
      key: "quote",
      title: "Quote",
      description: "Capture a quote",
      icon: <Quote className="w-4 h-4" />,
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        });
      },
    },
    {
      key: "code",
      title: "Code",
      description: "Capture a code snippet",
      icon: <Code className="w-4 h-4" />,
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createCodeNode());
          }
        });
      },
    },
    {
      key: "divider",
      title: "Divider",
      description: "Visually divide blocks",
      icon: <Minus className="w-4 h-4" />,
      onSelect: () => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
      },
    },
  ];

  const filteredCommands = commands.filter((command) =>
    command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const executeCommand = useCallback((command: SlashCommand) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Remove the slash and search term
        const textContent = selection.getTextContent();
        const slashIndex = textContent.lastIndexOf("/");
        if (slashIndex !== -1) {
          const beforeSlash = textContent.substring(0, slashIndex);
          selection.insertText(beforeSlash);
        }
      }
    });
    
    command.onSelect();
    setIsOpen(false);
    setSearchTerm("");
    setSelectedIndex(0);
  }, [editor]);

  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const anchorNode = selection.anchor.getNode();
            
            if (anchorNode instanceof TextNode) {
              const textContent = anchorNode.getTextContent();
              const slashIndex = textContent.lastIndexOf("/");
              
              if (slashIndex !== -1) {
                const searchText = textContent.substring(slashIndex + 1);
                setSearchTerm(searchText);
                setIsOpen(true);
                
                // Calculate position
                const domSelection = window.getSelection();
                if (domSelection && domSelection.rangeCount > 0) {
                  const range = domSelection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  setPosition({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX,
                  });
                }
              } else {
                setIsOpen(false);
                setSearchTerm("");
              }
            } else {
              setIsOpen(false);
              setSearchTerm("");
            }
          } else {
            setIsOpen(false);
            setSearchTerm("");
          }
        });
      }
    );

    return removeUpdateListener;
  }, [editor]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const removeKeyDownListener = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      () => {
        setSelectedIndex((prev) => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    const removeKeyUpListener = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      () => {
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    const removeEnterListener = editor.registerCommand(
      KEY_ENTER_COMMAND,
      () => {
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const removeEscapeListener = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        setIsOpen(false);
        setSearchTerm("");
        setSelectedIndex(0);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeKeyDownListener();
      removeKeyUpListener();
      removeEnterListener();
      removeEscapeListener();
    };
  }, [isOpen, filteredCommands, selectedIndex, executeCommand, editor]);

  if (!isOpen || filteredCommands.length === 0) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 1000,
      }}
      className="bg-white border rounded-lg shadow-lg p-2 min-w-[280px] max-h-80 overflow-y-auto"
    >
      {filteredCommands.map((command, index) => (
        <button
          key={command.key}
          onClick={() => executeCommand(command)}
          className={`w-full text-left p-2 rounded-md flex items-center gap-3 transition-colors ${
            index === selectedIndex
              ? "bg-blue-50 text-blue-700"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex-shrink-0 text-gray-400">
            {command.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{command.title}</div>
            <div className="text-xs text-gray-500 truncate">
              {command.description}
            </div>
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
} 