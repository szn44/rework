import { getUser } from "@/database";

interface StackedAvatarsProps {
  assigneeIds: string[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
}

export function StackedAvatars({ 
  assigneeIds, 
  maxVisible = 3, 
  size = "md" 
}: StackedAvatarsProps) {
  if (!assigneeIds || assigneeIds.length === 0) {
    return (
      <div className={`rounded-full bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center ${getSizeClasses(size)}`}>
        <svg className={`text-neutral-400 ${getIconSizeClasses(size)}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  const visibleAssignees = assigneeIds.slice(0, maxVisible);
  const remainingCount = assigneeIds.length - maxVisible;

  return (
    <div className="flex items-center">
      {visibleAssignees.map((assigneeId, index) => {
        const user = getUser(assigneeId);
        if (!user) return null;

        return (
          <div
            key={assigneeId}
            className="relative"
            style={{ 
              marginLeft: index > 0 ? '-8px' : '0',
              zIndex: visibleAssignees.length - index 
            }}
            title={user.info.name}
          >
            <img
              className={`rounded-full border-2 border-white shadow-sm ${getSizeClasses(size)}`}
              src={user.info.avatar}
              alt={user.info.name}
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