"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { ShellUserProfile } from "../profile";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectProfile } from "./ProjectProfile";
import { ProjectBottomNav } from "./ProjectBottomNav";
import { BurgerIcon, LogoIcon } from "../assets/project-shell-assets";

export interface ProjectShellProps {
  profile: ShellUserProfile;
  children: React.ReactNode;
}

export function ProjectShell({ profile, children }: ProjectShellProps) {
  const router = useRouter();

  // Desktop sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compact drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Logout state
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Focus management
  const burgerButtonRef = useRef<HTMLButtonElement>(null);
  const drawerContainerRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  // Handle escape key and focus restoration for compact drawer
  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    // Lock page scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const burgerButton = burgerButtonRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Focus the first focusable element inside drawer or the drawer container
    const focusTimer = setTimeout(() => {
      if (drawerContainerRef.current) {
        const firstFocusable =
          drawerContainerRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
        firstFocusable?.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      // Restore focus to burger button
      burgerButton?.focus();
    };
  }, [isDrawerOpen, closeDrawer]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login" as Route);
        return;
      }

      setLogoutError("Unable to log out. Please try again.");
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      data-testid="project-shell"
      data-profile={JSON.stringify(profile)}
      className="relative min-h-screen bg-[#f9f9ff] text-[#041b3c]"
    >
      {/* Desktop Sidebar (>=1024px) */}
      <ProjectNavigation
        variant={isCollapsed ? "collapsed" : "expanded"}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
        onToggleCollapse={toggleCollapse}
      />

      {/* Compact Drawer & Overlay (<1024px) */}
      {isDrawerOpen && (
        <div ref={drawerContainerRef}>
          {/* Dimmed & Blurred Overlay */}
          <div
            data-testid="drawer-overlay"
            aria-hidden="true"
            onClick={closeDrawer}
            className="fixed inset-0 z-40 bg-[rgba(4,27,60,0.4)] backdrop-blur-[2px] lg:hidden"
          />

          {/* 288px Drawer */}
          <ProjectNavigation
            variant="drawer"
            isLoggingOut={isLoggingOut}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Main Container */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-200 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Header - TopNavBar */}
        <header
          data-testid="shell-header"
          className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-[rgba(0,0,0,0.1)] bg-[#f9f9ff] px-6 py-3"
        >
          {/* Left Area */}
          <div className="flex items-center gap-4">
            {/* Burger control for compact viewports (<1024px) */}
            <button
              ref={burgerButtonRef}
              type="button"
              onClick={openDrawer}
              aria-label="Open navigation menu"
              aria-expanded={isDrawerOpen}
              aria-controls="compact-drawer"
              className="flex size-10 items-center justify-center rounded p-2 text-[#041b3c] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003d9b] lg:hidden"
            >
              <BurgerIcon aria-hidden="true" />
            </button>

            {/* Mobile brand text */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-5 w-[18px] items-center justify-center">
                <LogoIcon aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-[-0.5px] text-[#041b3c]">
                TASKLY
              </span>
            </div>
          </div>

          {/* Right Area: Profile Presentation */}
          <div className="flex items-center">
            {/* Desktop profile (>=1024px) */}
            <div className="hidden lg:block">
              <ProjectProfile profile={profile} compact={false} />
            </div>

            {/* Compact profile avatar (<1024px) */}
            <div className="block lg:hidden">
              <ProjectProfile profile={profile} compact={true} />
            </div>
          </div>
        </header>

        {/* Safe Logout Error Feedback */}
        {logoutError && (
          <div
            role="alert"
            aria-live="polite"
            className="border-semantic-error/30 bg-semantic-error/10 text-semantic-error mx-6 mt-4 flex items-center justify-between rounded border p-3 text-sm"
          >
            <span>{logoutError}</span>
            <button
              type="button"
              onClick={() => setLogoutError(null)}
              aria-label="Dismiss alert"
              className="text-xs font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Nested Page Content Slot (Reserves 64px on mobile for bottom navigation) */}
        <main
          id="main-content"
          data-testid="shell-main-content"
          className="flex-1 pb-16 lg:pb-0"
        >
          {children}
        </main>
      </div>

      {/* Persistent Compact Bottom Navigation (<1024px) */}
      <ProjectBottomNav isDrawerOpen={isDrawerOpen} />
    </div>
  );
}
