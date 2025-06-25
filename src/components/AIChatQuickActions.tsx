"use client";

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

interface AIChatQuickActionsProps {
  onQuickAction: (prompt: string) => void;
}

const quickActions: QuickAction[] = [
  {
    id: "code-review",
    label: "Code Review",
    prompt: "Help me review my code for best practices and potential issues",
    icon: "🔍"
  },
  {
    id: "debug-help",
    label: "Debug Issue",
    prompt: "I'm having trouble with a bug, can you help me debug it?",
    icon: "🐛"
  },
  {
    id: "performance",
    label: "Performance",
    prompt: "How can I improve the performance of my code?",
    icon: "⚡"
  },
  {
    id: "security",
    label: "Security",
    prompt: "What security considerations should I be aware of?",
    icon: "🔒"
  },
  {
    id: "testing",
    label: "Testing",
    prompt: "Help me write better tests for my code",
    icon: "🧪"
  },
  {
    id: "architecture",
    label: "Architecture",
    prompt: "I need advice on code architecture and design patterns",
    icon: "🏗️"
  }
];

export function AIChatQuickActions({ onQuickAction }: AIChatQuickActionsProps) {
  return (
    <div className="p-3 border-t border-neutral-200 bg-neutral-50">
      <p className="text-xs text-neutral-600 mb-2">Quick Actions:</p>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onQuickAction(action.prompt)}
            className="flex items-center gap-2 p-2 text-xs bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors text-left"
          >
            <span className="text-sm">{action.icon}</span>
            <span className="font-medium text-neutral-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 