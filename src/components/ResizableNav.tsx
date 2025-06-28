"use client";

import Link from "next/link";
// Removed createIssue import to prevent server action calls
import { useInbox } from "@/components/InboxContext";
import { useNavigation } from "@/components/NavigationContext";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { CreateIcon } from "@/icons/CreateIcon";
import { InboxIcon } from "@/icons/InboxIcon";
// Removed Liveblocks imports to prevent rapid requests
import { ComponentProps, useState, useEffect, useRef } from "react";
import { Loading } from "@/components/Loading";
import { MyIssuesIcon } from "@/icons/MyIssuesIcon";
import { WikiIcon } from "@/icons/WikiIcon";
import { ProjectsIcon } from "@/icons/ProjectsIcon";
import { 
  Cog6ToothIcon,
  ChevronRightIcon as ChevronRightSmall,
  PlusIcon
} from "@heroicons/react/24/outline";
import { useWorkspace } from "./WorkspaceContext";
import { useSpace } from "./SpaceContext";
import { useUsers } from "./UserContext";
import { createClient } from "@/utils/supabase/client";
import { CreateSpaceModal } from "./CreateSpaceModal";
import { User } from "@supabase/supabase-js";

interface ResizableNavProps {
  user?: User;
}

export function ResizableNav({ user }: ResizableNavProps) {
  const { isOpen, toggleInbox } = useInbox();
  const pathname = usePathname();
  const [creating, setCreating] = useState(false);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
  const [width, setWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  
  const { workspaces, currentWorkspace } = useWorkspace();
  const { spaces, currentSpace, setCurrentSpace, refreshSpaces } = useSpace();
  const { users, getUserById, loading: usersLoading } = useUsers();
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    display_name: "",
    avatar_url: "",
    email: "",
  });

  // Reset creating state on pathname change (in case it gets stuck)
  useEffect(() => {
    setCreating(false);
  }, [pathname]);

  // Load user profile from auth
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        const currentUser = user || authUser;
        if (!currentUser) return;

        // Try to get profile from user_profiles table
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("display_name, avatar_url, email")
          .eq("user_id", currentUser.id)
          .single();

        if (profile) {
          setUserProfile({
            display_name: profile.display_name || currentUser.email?.split('@')[0] || "User",
            avatar_url: profile.avatar_url || "",
            email: currentUser.email || "",
          });
        } else {
          // Fallback to auth data
          setUserProfile({
            display_name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "User",
            avatar_url: currentUser.user_metadata?.avatar_url || "",
            email: currentUser.email || "",
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 350) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, setWidth, setIsResizing]);

  const mainNavItems = [
    {
      href: "/inbox",
      icon: InboxIcon,
      label: "Inbox",
      hasNotification: true,
      isSpecial: pathname.startsWith("/issue/"),
    },
    {
      href: "/",
      icon: MyIssuesIcon,
      label: "Issues",
      hasNotification: false,
    },
  ];

  const spacesItems = spaces.map(space => ({
    href: `/spaces/${space.slug}/chat`,
    label: space.name,
    color: space.color,
    isActive: pathname.startsWith(`/spaces/${space.slug}/chat`),
  }));

  // Update create issue handler to use workspace context
  const handleCreateIssue = async () => {
    console.log("ResizableNav CreateIssue clicked");
    console.log("Current workspace:", currentWorkspace);
    console.log("Current space:", currentSpace);
    console.log("Current pathname:", pathname);
    
    if (creating) return; // Prevent double-clicks
    
    if (!currentWorkspace) {
      console.error("No current workspace selected - using hardcoded fallback");
      // Use hardcoded workspace ID as fallback
      const fallbackWorkspaceId = 'f1725467-7a48-4a9d-91c3-c85b6d0b1db8';
      
      setCreating(true);
      try {
        const response = await fetch('/api/create-issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            workspace_id: fallbackWorkspaceId,
            space_id: null,
            status: 'todo',
            title: 'Untitled'
          }),
        });

        console.log("API response status:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("API response result:", result);
          if (result.issueId) {
            console.log("Navigating to issue:", result.issueId);
            window.location.href = `/issue/${result.issueId}`;
          }
        } else {
          const error = await response.json();
          console.error('Failed to create issue:', (error as any));
        }
      } catch (error) {
        console.error("Failed to create issue:", error);
      } finally {
        setCreating(false);
      }
      return;
    }

    // Only assign space if we're on a space page (not main issues page)
    const isOnSpacePage = pathname.startsWith('/spaces/');
    const spaceIdToAssign = isOnSpacePage ? (currentSpace?.id || null) : null;
    
    console.log("Is on space page:", isOnSpacePage);
    console.log("Space ID to assign:", spaceIdToAssign);
    
    setCreating(true);
    try {
      console.log("Making API request to create issue...");
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          workspace_id: currentWorkspace.id,
          space_id: spaceIdToAssign,
          status: 'todo',
          title: 'Untitled'
        }),
      });

      console.log("API response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("API response result:", result);
        if (result.issueId) {
          console.log("Navigating to issue:", result.issueId);
          window.location.href = `/issue/${result.issueId}`;
        }
      } else {
        const error = await response.json();
        console.error('Failed to create issue:', (error as any));
      }
    } catch (error) {
      console.error("Failed to create issue:", error);
    } finally {
      setCreating(false);
    }
  };

  // Handle space created callback
  const handleSpaceCreated = (newSpace: any) => {
    // Refresh spaces list
    refreshSpaces?.();
    // Navigate to the new space
    window.location.href = `/spaces/${newSpace.slug}/chat`;
  };

  return (
    <>
      {creating && (
        <div className="inset-0 bg-black/10 backdrop-blur-sm fixed z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl border border-gray-200">
            <Loading />
            <p className="mt-4 text-sm text-gray-600 font-medium">Creating issue...</p>
          </div>
        </div>
      )}
      
      {/* Create Space Modal */}
      {currentWorkspace && user && (
        <CreateSpaceModal
          isOpen={showCreateSpaceModal}
          onClose={() => setShowCreateSpaceModal(false)}
          onSpaceCreated={handleSpaceCreated}
          user={user}
          workspaceId={currentWorkspace.id}
        />
      )}
      
      <div
        ref={navRef}
        className={classNames(
          "relative h-full transition-all duration-300 ease-out flex flex-col bg-gray-50 dark:bg-dark-bg-nav",
          {
            "shadow-sm shadow-gray-300/20": isResizing,
          }
        )}
        style={{ width: `${width}px` }}
      >
        {/* Header */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <img 
                  src="/rework_dark.png" 
                  alt="Rework Logo" 
                  className="w-18 h-9 transition-all duration-300 group-hover:scale-110 drop-shadow-sm block dark:hidden"
                />
                <img 
                  src="/rework_light.png" 
                  alt="Rework Logo" 
                  className="w-18 h-9 transition-all duration-300 group-hover:scale-110 drop-shadow-sm hidden dark:block"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 blur-sm" />
              </div>
              <span className="text-gray-900 dark:text-dark-text-primary font-bold text-base tracking-tight group-hover:text-blue-600 transition-colors duration-300 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
              
              </span>
            </Link>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCreateIssue}
                disabled={creating}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-lg shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/25 disabled:shadow-none transition-all duration-300 ease-out transform hover:-translate-y-0.5 disabled:transform-none p-1.5 disabled:cursor-not-allowed"
                title="Create Issue"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300"></div>
                {creating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                ) : (
                  <CreateIcon className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:scale-110 group-disabled:scale-100" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 px-2 pt-2 pb-2 space-y-0.5 overflow-y-auto">
          {/* Top Nav: Inbox, Issues, Agents */}
          <div className="mb-4">
            {mainNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition group mb-1",
                    isActive
                      ? "bg-[#0F0F0F] dark:bg-dark-bg-tertiary text-white dark:text-dark-text-primary rounded-lg"
                      : "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
                  )}
                >
                  <ItemIcon className={classNames("w-5 h-5", isActive ? "text-gray-400" : "text-gray-400 group-hover:text-gray-400")}/>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
            {/* Agents link */}
            <Link
              href="/agents"
              className={classNames(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition group mb-1",
                pathname.startsWith("/agents")
                  ? "bg-[#0F0F0F] dark:bg-dark-bg-tertiary text-white dark:text-dark-text-primary"
                  : "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
              )}
            >
              <svg data-testid="geist-icon" height="20" width="20" viewBox="0 0 16 16" fill="none" style={{ color: 'currentColor' }} className="w-5 h-5 text-gray-400 group-hover:text-gray-400">
                <path fillRule="evenodd" clipRule="evenodd" d="M7.15714 0L2.33264 9.40776L1.77252 10.5H3.00001H7.00001C7.13808 10.5 7.25001 10.6119 7.25001 10.75V16H8.84288L13.6674 6.59224L14.2275 5.5H13H9.00001C8.86194 5.5 8.75001 5.38807 8.75001 5.25V0H7.15714ZM7.00001 9H4.22749L7.25001 3.1061V5.25C7.25001 6.2165 8.03351 7 9.00001 7H11.7725L8.75001 12.8939V10.75C8.75001 9.7835 7.96651 9 7.00001 9Z" fill="currentColor"></path>
              </svg>
              <span className="truncate">Agents</span>
            </Link>
          </div>

          {/* Channels Section */}
          <div className="mb-1">
            <div className="flex items-center justify-between px-4 mb-1 mt-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">Spaces</span>
              <button 
                onClick={() => setShowCreateSpaceModal(true)}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-bg-tertiary transition" 
                title="Create new space"
              >
                <PlusIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div>
              {spacesItems.map((space) => (
                <Link
                  key={space.href}
                  href={space.href}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-1 rounded-lg text-sm font-medium transition group",
                    space.isActive
                      ? "bg-[#0F0F0F] dark:bg-dark-bg-tertiary text-white dark:text-dark-text-primary"
                      : "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
                  )}
                >
                  <span className="text-lg text-gray-400">#</span>
                  <span className="truncate">{space.label}</span>
                  
                </Link>
              ))}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-4 mb-1 mt-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Direct messages</span>
              <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 transition" title="Add DM">
                <PlusIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-1">
              {/* Example DMs, replace with real data if available */}
              <Link href="#" className="flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">P</span>
                <span className="truncate">Patrick</span>
              </Link>
              <Link href="#" className="flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition">
                <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">C</span>
                <span className="truncate">Caroline</span>
              </Link>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-gray-100/40 dark:bg-dark-bg-primary">
          <Link
            href="/settings"
            className={classNames(
              "w-full flex items-center gap-2.5 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#0F0F0F] transition-all duration-200 group cursor-pointer",
              pathname.startsWith("/settings") ? "bg-[#0F0F0F] text-white" : ""
            )}
          >
            <div className="relative">
              {userProfile.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg">
                  {userProfile.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className={classNames(
                    "text-sm font-semibold truncate transition-colors duration-200",
                    pathname.startsWith("/settings") ? "text-white" : "text-gray-900 group-hover:text-[#0F0F0F]"
                  )}>
                    {userProfile.display_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Resize Handle */}
        {!isResizing && (
          <div
            className={classNames(
              "absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:w-1.5 transition-all duration-300",
              isDragging ? "bg-gradient-to-b from-blue-500 to-blue-600" : "bg-transparent hover:bg-gradient-to-b hover:from-blue-300 hover:to-blue-400"
            )}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-1/2 right-0 w-3 h-12 -translate-y-1/2 translate-x-1 rounded-l-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-sm">
              <div className="w-0.5 h-6 bg-gray-600 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </>
  );
} 