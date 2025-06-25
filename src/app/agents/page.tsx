import { ResponsiveLayout } from "@/components/ResponsiveLayout";

export default function AgentsPage() {
  return (
    <ResponsiveLayout>
      <main className="m-2 border flex-grow bg-white rounded">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 text-sm border-b h-12 bg-white flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="font-semibold text-neutral-900">Agents</h1>
                <div className="text-xs text-neutral-500">
                  0 agents
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0">
            {/* Placeholder for future agent content */}
          </div>
        </div>
      </main>
    </ResponsiveLayout>
  );
} 