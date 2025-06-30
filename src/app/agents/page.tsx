import { ArrowUpRight, Filter, MoreHorizontal, Plus } from "lucide-react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

export default function AgentsPage() {
  const agents = [
    {
      icon: "🐝",
      name: "Buzzing Your Inbox",
      description: "Sends a welcome sequence to new subscribers",
      status: "Draft",
      enrolled: 0,
      completed: 0,
      lastEdited: "just now",
      statusColor: "text-blue-400",
      statusBg: "bg-blue-400/10"
    },
    {
      icon: "👋",
      name: "First Hello Flow",
      description: "A short email sequence to greet and guide new subscribers",
      status: "Running",
      enrolled: 76,
      completed: 65,
      lastEdited: "2 minutes ago",
      statusColor: "text-green-400",
      statusBg: "bg-green-400/10"
    },
    {
      icon: "🚀",
      name: "Welcome Journey",
      description: "Full onboarding experience with delayed educational content",
      status: "Running",
      enrolled: 12,
      completed: 16,
      lastEdited: "1 hours ago",
      statusColor: "text-green-400",
      statusBg: "bg-green-400/10"
    },
    {
      icon: "🎉",
      name: "You're In!",
      description: "Instant welcome + next steps for newsletter readers",
      status: "Draft",
      enrolled: 0,
      completed: 0,
      lastEdited: "25 minutes ago",
      statusColor: "text-blue-400",
      statusBg: "bg-blue-400/10"
    },
    {
      icon: "👍",
      name: "Let's Get Started",
      description: "Kicks off engagement with next-step guidance",
      status: "Draft",
      enrolled: 0,
      completed: 0,
      lastEdited: "50 minutes ago",
      statusColor: "text-blue-400",
      statusBg: "bg-blue-400/10"
    },
    {
      icon: "💬",
      name: "Still With Us?",
      description: "Re-engagement flow for inactive new subscribers",
      status: "Paused",
      enrolled: 42,
      completed: 73,
      lastEdited: "25 minutes ago",
      statusColor: "text-red-400",
      statusBg: "bg-red-400/10"
    },
    {
      icon: "💡",
      name: "Next Steps & Tips",
      description: "Sends helpful tips and links after initial welcome",
      status: "Running",
      enrolled: 89,
      completed: 112,
      lastEdited: "1 day ago",
      statusColor: "text-green-400",
      statusBg: "bg-green-400/10"
    },
  ];

  return (
    <ResponsiveLayout>
      <main className="h-full bg-[#0a0a0a] text-gray-100">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white">Agents</h1>
            </div>
            
            <p className="text-gray-400 mb-6">
              Craft seamless automated journeys for your newsletter subscribers. Need help getting started?{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                Watch the tutorial
              </a>
            </p>

            {/* Filters and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Filter className="w-4 h-4" />
                  <span>Sorted by creation date</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  <span>All automations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                  <span>Status</span>
                </div>
              </div>

              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />
                Create New
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-900/30 sticky top-0 backdrop-blur-sm">
                <tr className="border-b border-gray-800/50">
                  <th className="text-left py-4 px-8 text-sm font-medium text-gray-400">Automations Name</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Descriptions</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Subscribers Enrolled</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Subscribers Completed</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                    Last Edited
                    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => (
                  <tr key={index} className="border-b border-gray-800/30 hover:bg-gray-900/20 group transition-colors">
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{agent.icon}</span>
                        <span className="text-white font-medium group-hover:text-purple-300 transition-colors">
                          {agent.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">
                        {agent.description}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${agent.statusBg} ${agent.statusColor}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white font-medium">{agent.enrolled}</span>
                      <span className="text-gray-400 text-sm ml-1">subscribers</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white font-medium">{agent.completed}</span>
                      <span className="text-gray-400 text-sm ml-1">subscribers</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400 text-sm">{agent.lastEdited}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-8 py-4 text-sm text-gray-500">
              Showing {agents.length} of {agents.length} Item
            </div>
          </div>
        </div>
      </main>
    </ResponsiveLayout>
  );
} 