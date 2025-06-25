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

export function ResizableNav() {
  const { width, isResizing, setIsResizing, setWidth } = useNavigation();
  const { isOpen, toggleInbox } = useInbox();
  const pathname = usePathname();
  const [creating, setCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Reset creating state on pathname change (in case it gets stuck)
  useEffect(() => {
    setCreating(false);
  }, [pathname]);

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

  const spacesItems = [
    {
      href: "/spaces/all-rework",
      label: "all-rework",
      isActive: pathname.startsWith("/spaces/all-rework") || pathname === "/wiki",
    },
    {
      href: "/spaces/new-channel",
      label: "new-channel",
      isActive: pathname === "/spaces/new-channel",
    },
    {
      href: "/spaces/social",
      label: "social", 
      isActive: pathname === "/spaces/social",
    },
  ];

  const integrationItems = [
    {
      label: "Zero",
      icon: "Z",
      badge: "1",
      disabled: true,
    },
  ];

  // Mock user data - replace with actual user context/auth
  const user = {
    name: "John Dominos",
    email: "johndoe@gmail.com",
    avatar: "/api/placeholder/32/32", // Replace with actual avatar URL
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
      
      <div
        ref={navRef}
        className={classNames(
          "relative h-full transition-all duration-300 ease-out flex flex-col",
          {
            "shadow-sm shadow-gray-300/20": isResizing,
          }
        )}
        style={{ width: `${width}px`, backgroundColor: '#F8F8F8' }}
      >
        {/* Header */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <img 
                  src="/rework_dark.png" 
                  alt="Play Logo" 
                  className="w-18 h-9 transition-all duration-300 group-hover:scale-110 drop-shadow-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 blur-sm" />
              </div>
              <span className="text-gray-900 font-bold text-base tracking-tight group-hover:text-blue-600 transition-colors duration-300 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
              
              </span>
            </Link>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={async () => {
                  if (creating) return; // Prevent double-clicks
                  
                  setCreating(true);
                  try {
                    // Generate issue ID on client side
                    const { nanoid } = await import("nanoid");
                    const issueId = nanoid();
                    
                    // Use API route instead of server action
                    const response = await fetch('/api/create-issue', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ 
                        issueId,
                        progress: 'none' 
                      }),
                    });

                    if (response.ok) {
                      // Navigate on client side
                      window.location.href = `/issue/${issueId}`;
                    } else {
                      console.error('Failed to create issue:', response.statusText);
                    }
                  } catch (error) {
                    console.error("Failed to create issue:", error);
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={creating}
                className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg p-1.5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Create Issue"
              >
                {creating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CreateIcon className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Items */}
        <div className="flex-1 px-3 pt-1 pb-2 space-y-0.5 overflow-y-auto">
          {/* Inbox and Issues */}
          {mainNavItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const ItemIcon = item.icon;
            
            if (item.isSpecial && pathname.startsWith("/issue/")) {
              // Special inbox behavior for issue pages
              return (
                <button
                  key={item.href}
                  onClick={toggleInbox}
                  className={classNames(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    isOpen
                      ? "bg-gray-800 text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="relative">
                    <ItemIcon className={classNames(
                      "transition-all duration-200 w-4 h-4",
                      isOpen ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                    )} />
                  </div>
                  <span className="truncate transition-colors duration-200">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="relative">
                  <ItemIcon className={classNames(
                    "transition-all duration-200 w-4 h-4",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                  )} />
                </div>
                <span className="truncate transition-colors duration-200">{item.label}</span>
              </Link>
            );
          })}

          {/* Agents - now an active link */}
          <Link
            href="/agents"
            className={classNames(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden mb-4",
              pathname.startsWith("/agents")
                ? "bg-gray-800 text-white"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <svg data-testid="geist-icon" height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" style={{color: 'currentcolor'}}>
                <path d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z" fill="currentColor"></path>
                <path d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z" fill="currentColor"></path>
                <path d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="truncate">Agents</span>
          </Link>

          {/* Spaces Section with enhanced hover states */}
          <div className="mt-6 mb-2">
            <div className="text-sm font-medium text-gray-500 tracking-wide px-3 mb-3 mt-3 flex items-center justify-between">
              <span>Spaces</span>
              <button className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 w-6 h-6 flex items-center justify-center rounded transition-colors duration-200">
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {spacesItems.map((space) => (
              <Link
                key={space.href}
                href={space.href}
                className={classNames(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  space.isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className={classNames(
                  "transition-colors duration-200",
                  space.isActive ? "text-gray-300" : "text-gray-500 group-hover:text-gray-700"
                )}>#</span>
                <span className="truncate transition-colors duration-200">{space.label}</span>
              </Link>
            ))}
          </div>

          {/* Integrations Section */}
          <div className="mt-6 mb-2">
            <div className="text-sm font-medium text-gray-500 tracking-wide px-3 mb-3 mt-3 flex items-center justify-between">
              <span>Integrations</span>
              <button className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 w-6 h-6 flex items-center justify-center rounded transition-colors duration-200">
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {integrationItems.map((integration, index) => (
              <div
                key={index}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium opacity-75 cursor-not-allowed text-gray-700"
              >
                <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{integration.icon}</span>
                </div>
                <span className="truncate flex-1">{integration.label}</span>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {integration.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - Settings */}
        <div className="border-t border-gray-200/60 bg-gray-50/30">
          <div className="px-3 pt-2 pb-1">
            <Link
              href="/settings"
              className={classNames(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                pathname.startsWith("/settings")
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Cog6ToothIcon className={classNames(
                "transition-all duration-200 w-4 h-4",
                pathname.startsWith("/settings") ? "text-white" : "text-gray-500 group-hover:text-gray-700"
              )} />
              <span className="truncate transition-colors duration-200">Settings</span>
            </Link>
          </div>

          {/* User Profile */}
          <div className="border-t border-gray-200/60 bg-gray-100/40">
            <Link
              href="/profile"
              className="w-full flex items-center gap-2.5 p-3 text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg">
                  JD
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronRightSmall className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 flex-shrink-0" />
                </div>
              </div>
            </Link>
          </div>
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
            <div className="absolute top-1/2 right-0 w-3 h-12 -translate-y-1/2 translate-x-1 bg-gradient-to-b from-gray-300 to-gray-400 rounded-l-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-sm">
              <div className="w-0.5 h-6 bg-gray-600 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Badge functions removed to prevent Liveblocks connections 