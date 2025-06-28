import { ArrowUpRight } from "lucide-react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";

export default function AgentsPage() {
  const agents = [
    {
      category: "CUSTOMER SERVICE",
      subcategories: ["CRM", "SUPPORT"],
      title: "Full Receptionist",
      rating: 21,
      conversations: 2504,
      bgColor: "bg-blue-50",
    },
    {
      category: "SALES",
      subcategories: ["BOOKING", "LEAD QUALIFICATION"],
      title: "Appointment Setter",
      rating: 14,
      conversations: 135,
      bgColor: "bg-green-50",
    },
    {
      category: "SALES",
      subcategories: ["AI"],
      title: "Rangers Ticket Sales",
      rating: 7,
      conversations: 24,
      bgColor: "bg-purple-50",
    },
    {
      category: "PRODUCTIVITY",
      subcategories: ["AUTOMATION", "WORKFLOW"],
      title: "Task Manager",
      rating: 18,
      conversations: 892,
      bgColor: "bg-orange-50",
    },
    {
      category: "MARKETING",
      subcategories: ["CONTENT", "SOCIAL MEDIA"],
      title: "Content Creator",
      rating: 12,
      conversations: 567,
      bgColor: "bg-pink-50",
    },
    {
      category: "ANALYTICS",
      subcategories: ["REPORTING", "INSIGHTS"],
      title: "Data Analyst",
      rating: 9,
      conversations: 234,
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <ResponsiveLayout>
      <main className="m-2 border dark:border-dark-bg-tertiary flex-grow bg-white dark:bg-dark-bg-primary rounded overflow-hidden">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header matching other pages */}
          <div className="flex items-center justify-between px-4 text-sm border-b dark:border-dark-bg-tertiary h-12 bg-white dark:bg-dark-bg-primary flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h1 className="font-semibold text-neutral-900 dark:text-dark-text-primary">Agents</h1>
                <div className="text-xs text-neutral-500 dark:text-dark-text-secondary">
                  {agents.length} agents
                </div>
              </div>
            </div>
            <button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/25 transition-all duration-300 ease-out transform hover:-translate-y-0.5 flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="relative z-10">New Agent</span>
            </button>
          </div>

          {/* Content with proper grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-bg-primary">
            <div className="grid grid-cols-4 gap-6">
              {agents.map((agent, index) => (
                <div
                  key={index}
                  className="group relative bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-bg-tertiary overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  {/* Colored header */}
                  <div className={`${agent.bgColor} p-4 h-32 relative overflow-hidden`}>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 w-12 h-12 border border-current rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-8 h-8 border border-current rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-current rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-gray-700 tracking-wider uppercase bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm">
                            {agent.category}
                          </div>
                          <div className="space-y-1">
                            {agent.subcategories.map((sub, subIndex) => (
                              <div
                                key={subIndex}
                                className="text-xs text-gray-600 font-medium bg-white/30 px-2 py-0.5 rounded-md backdrop-blur-sm inline-block mr-1"
                              >
                                {sub}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <ArrowUpRight className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary group-hover:text-gray-700 dark:group-hover:text-dark-text-secondary transition-colors mb-2">
                      {agent.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-3">AI-powered conversational agent ready for deployment</p>

                    {/* Status indicators */}
                    <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-dark-text-tertiary">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Active</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state if no agents */}
            {agents.length === 0 && (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No agents yet</h3>
                <p className="text-gray-500 mb-4">Create your first AI agent to get started</p>
                <button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/25 transition-all duration-300 ease-out transform hover:-translate-y-0.5 flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="relative z-10">New Agent</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </ResponsiveLayout>
  );
} 