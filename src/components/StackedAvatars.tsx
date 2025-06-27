"use client";

import { useUsers } from "./UserContext";

interface StackedAvatarsProps {
  assigneeIds: string[] | string | null | undefined;
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
}

export function StackedAvatars({ 
  assigneeIds, 
  maxVisible = 3, 
  size = "md" 
}: StackedAvatarsProps) {
  const { getUserById, users, loading } = useUsers();
  
  // Ensure assigneeIds is always an array
  const normalizedAssigneeIds = Array.isArray(assigneeIds) 
    ? assigneeIds 
    : (assigneeIds ? [String(assigneeIds)] : []);


  if (!normalizedAssigneeIds || normalizedAssigneeIds.length === 0) {
    return (
      <div className={`rounded-full bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center ${getSizeClasses(size)}`}>
        <svg className={`text-neutral-400 ${getIconSizeClasses(size)}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  const visibleAssignees = normalizedAssigneeIds.slice(0, maxVisible);
  const remainingCount = normalizedAssigneeIds.length - maxVisible;

  return (
    <div className="flex items-center">
      {visibleAssignees.map((assigneeId, index) => {
        const user = getUserById(assigneeId);
        if (!user) {
          // Fallback avatar for unknown users
          return (
            <div
              key={assigneeId}
              className={`relative rounded-full bg-neutral-300 border-2 border-white shadow-sm flex items-center justify-center ${getSizeClasses(size)}`}
              style={{ 
                marginLeft: index > 0 ? '-8px' : '0',
                zIndex: visibleAssignees.length - index 
              }}
              title="Unknown User"
            >
              <svg className={`text-neutral-500 ${getIconSizeClasses(size)}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          );
        }

        return (
          <div
            key={assigneeId}
            className="relative"
            style={{ 
              marginLeft: index > 0 ? '-8px' : '0',
              zIndex: visibleAssignees.length - index 
            }}
            title={user.name}
          >
            <img
              className={`rounded-full border-2 border-white shadow-sm ${getSizeClasses(size)}`}
              src={user.avatar}
              alt={user.name}
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="rounded-full border-2 border-white shadow-sm flex items-center justify-center ${getSizeClasses(size)} bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs">
                      ${user.name.charAt(0).toUpperCase()}
                    </div>
                  `;
                }
              }}
            />
          </div>
        );
      })}
      
      {remainingCount > 0 && (
        <div
          className={`relative rounded-full bg-neutral-300 border-2 border-white shadow-sm flex items-center justify-center text-neutral-600 font-medium text-xs ${getSizeClasses(size)}`}
          style={{ 
            marginLeft: '-8px',
            zIndex: 0 
          }}
          title={`+${remainingCount} more`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

function getSizeClasses(size: "sm" | "md" | "lg"): string {
  switch (size) {
    case "sm":
      return "w-6 h-6";
    case "md":
      return "w-7 h-7";
    case "lg":
      return "w-8 h-8";
    default:
      return "w-7 h-7";
  }
}

function getIconSizeClasses(size: "sm" | "md" | "lg"): string {
  switch (size) {
    case "sm":
      return "w-3 h-3";
    case "md":
      return "w-3 h-3";
    case "lg":
      return "w-4 h-4";
    default:
      return "w-3 h-3";
  }
} 