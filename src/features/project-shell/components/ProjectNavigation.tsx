import type React from "react";
import Link from "next/link";
import {
  LogoIcon,
  ProjectsIcon,
  ProjectsCollapsedIcon,
  EpicsIcon,
  TasksIcon,
  MembersIcon,
  DetailsIcon,
  CollapseIcon,
  ExpandIcon,
  LogoutIcon,
} from "../assets/project-shell-assets";

export interface ProjectNavigationProps {
  variant: "expanded" | "collapsed" | "drawer";
  isLoggingOut?: boolean;
  onLogout?: () => void;
  onToggleCollapse?: () => void;
}

export function ProjectNavigation({
  variant,
  isLoggingOut = false,
  onLogout,
  onToggleCollapse,
}: ProjectNavigationProps) {
  if (variant === "collapsed") {
    return (
      <aside
        data-testid="desktop-sidebar-collapsed"
        aria-label="Sidebar navigation"
        className="fixed inset-y-0 left-0 z-20 hidden w-20 flex-col items-center justify-between border-r border-[rgba(0,0,0,0.05)] bg-[#f1f3ff] py-4 lg:flex"
      >
        {/* Top: Brand Mark */}
        <div className="flex flex-col items-center gap-6">
          <div
            className="flex size-12 items-center justify-center"
            aria-label="Taskly"
          >
            <LogoIcon aria-hidden="true" />
          </div>

          {/* Navigation items (icon-only) */}
          <nav
            aria-label="Desktop primary navigation"
            className="flex flex-col items-center gap-4"
          >
            {/* Real link: Projects */}
            <Link
              href="/project"
              className="flex size-12 items-center justify-center rounded bg-white text-[#003d9b] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003d9b]"
              aria-label="Projects (active)"
              aria-current="page"
            >
              <div className="flex size-[18px] items-center justify-center">
                <ProjectsCollapsedIcon aria-hidden="true" />
              </div>
            </Link>

            {/* Non-link items */}
            <div
              aria-label="Project Epics"
              className="flex size-12 cursor-default items-center justify-center rounded text-[#041b3c] select-none"
            >
              <div className="flex h-[18px] w-[20px] items-center justify-center">
                <EpicsIcon aria-hidden="true" />
              </div>
            </div>

            <div
              aria-label="Project Tasks"
              className="flex size-12 cursor-default items-center justify-center rounded text-[#041b3c] select-none"
            >
              <div className="flex h-[15.075px] w-[20px] items-center justify-center">
                <TasksIcon aria-hidden="true" />
              </div>
            </div>

            <div
              aria-label="Project Members"
              className="flex size-12 cursor-default items-center justify-center rounded text-[#041b3c] select-none"
            >
              <div className="flex h-[16px] w-[22px] items-center justify-center">
                <MembersIcon aria-hidden="true" />
              </div>
            </div>

            <div
              aria-label="Project Details"
              className="flex size-12 cursor-default items-center justify-center rounded text-[#041b3c] select-none"
            >
              <div className="flex size-[20px] items-center justify-center">
                <DetailsIcon aria-hidden="true" />
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="flex flex-col items-center gap-4 border-t border-[rgba(195,198,214,0.3)] pt-4">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="flex size-10 items-center justify-center rounded text-[#041b3c] transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003d9b]"
          >
            <span className="rotate-180" aria-hidden="true">
              <ExpandIcon />
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-label="Log out"
            aria-busy={isLoggingOut}
            className="flex size-10 items-center justify-center rounded text-[#ba1a1a] transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ba1a1a] disabled:opacity-50"
          >
            <LogoutIcon aria-hidden="true" />
          </button>
        </div>
      </aside>
    );
  }

  if (variant === "drawer") {
    return (
      <aside
        id="compact-drawer"
        data-testid="compact-drawer"
        aria-label="Navigation drawer"
        className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between bg-[#f1f3ff] p-4 shadow-2xl transition-transform duration-200 ease-in-out"
      >
        <div className="flex flex-col gap-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-2 px-2 pt-2">
            <div className="flex h-5 w-[18px] items-center justify-center">
              <LogoIcon aria-hidden="true" />
            </div>
            <span className="text-xl font-bold tracking-[-0.5px] text-[#041b3c]">
              TASKLY
            </span>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Drawer primary navigation"
            className="flex flex-col gap-1"
          >
            {/* Real Link: Projects */}
            <Link
              href="/project"
              className="flex items-center gap-3 rounded bg-white px-4 py-3 text-sm font-medium text-[#0052cc] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]"
              aria-label="Projects (active)"
              aria-current="page"
            >
              <div className="flex size-[18px] items-center justify-center">
                <ProjectsIcon aria-hidden="true" />
              </div>
              <span>Projects</span>
            </Link>

            {/* Non-link items */}
            <div className="flex cursor-default items-center gap-3 px-4 py-3 text-sm font-medium text-[#041b3c]/60 select-none">
              <div className="flex h-[18px] w-[20px] items-center justify-center">
                <EpicsIcon aria-hidden="true" />
              </div>
              <span>Project Epics</span>
            </div>

            <div className="flex cursor-default items-center gap-3 px-4 py-3 text-sm font-medium text-[#041b3c]/60 select-none">
              <div className="flex h-[15.075px] w-[20px] items-center justify-center">
                <TasksIcon aria-hidden="true" />
              </div>
              <span>Project Tasks</span>
            </div>

            <div className="flex cursor-default items-center gap-3 px-4 py-3 text-sm font-medium text-[#041b3c]/60 select-none">
              <div className="flex h-[16px] w-[22px] items-center justify-center">
                <MembersIcon aria-hidden="true" />
              </div>
              <span>Project Members</span>
            </div>

            <div className="flex cursor-default items-center gap-3 px-4 py-3 text-sm font-medium text-[#041b3c]/60 select-none">
              <div className="flex size-[20px] items-center justify-center">
                <DetailsIcon aria-hidden="true" />
              </div>
              <span>Project Details</span>
            </div>
          </nav>
        </div>

        {/* Drawer Bottom: Profile & Logout */}
        <div className="flex flex-col gap-2 border-t border-[rgba(195,198,214,0.2)] pt-4">
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            aria-label="Log out"
            aria-busy={isLoggingOut}
            className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-[#ba1a1a] transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ba1a1a] disabled:opacity-50"
          >
            <div className="flex size-[18px] items-center justify-center">
              <LogoutIcon aria-hidden="true" />
            </div>
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    );
  }

  // Expanded variant (default desktop >=1024px)
  return (
    <aside
      data-testid="desktop-sidebar-expanded"
      aria-label="Sidebar navigation"
      className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col justify-between border-r border-[rgba(0,0,0,0.05)] bg-[#f1f3ff] p-4 lg:flex"
    >
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2 px-2 pt-2">
          <div className="flex h-5 w-[18px] items-center justify-center">
            <LogoIcon aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-[-0.5px] text-[#041b3c]">
            TASKLY
          </span>
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Desktop primary navigation"
          className="flex flex-col gap-1"
        >
          {/* Real Link: Projects */}
          <Link
            href="/project"
            className="flex items-center gap-3 rounded bg-white px-3 py-2.5 text-sm font-medium text-[#003d9b] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003d9b]"
            aria-label="Projects (active)"
            aria-current="page"
          >
            <div className="flex size-[18px] items-center justify-center">
              <ProjectsIcon aria-hidden="true" />
            </div>
            <span>Projects</span>
          </Link>

          {/* Non-link items */}
          <div className="flex cursor-default items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#041b3c] select-none">
            <div className="flex h-[18px] w-[20px] items-center justify-center">
              <EpicsIcon aria-hidden="true" />
            </div>
            <span>Project Epics</span>
          </div>

          <div className="flex cursor-default items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#041b3c] select-none">
            <div className="flex h-[15.075px] w-[20px] items-center justify-center">
              <TasksIcon aria-hidden="true" />
            </div>
            <span>Project Tasks</span>
          </div>

          <div className="flex cursor-default items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#041b3c] select-none">
            <div className="flex h-[16px] w-[22px] items-center justify-center">
              <MembersIcon aria-hidden="true" />
            </div>
            <span>Project Members</span>
          </div>

          <div className="flex cursor-default items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#041b3c] select-none">
            <div className="flex size-[20px] items-center justify-center">
              <DetailsIcon aria-hidden="true" />
            </div>
            <span>Project Details</span>
          </div>
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-1 border-t border-[rgba(195,198,214,0.2)] pt-6">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-[#041b3c] transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003d9b]"
        >
          <div className="flex h-5 w-[11.775px] items-center justify-center">
            <CollapseIcon aria-hidden="true" />
          </div>
          <span>Collapse</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          aria-label="Log out"
          aria-busy={isLoggingOut}
          className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-[#ba1a1a] transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ba1a1a] disabled:opacity-50"
        >
          <div className="flex size-[18px] items-center justify-center">
            <LogoutIcon aria-hidden="true" />
          </div>
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
