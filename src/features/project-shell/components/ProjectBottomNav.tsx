import Link from "next/link";
import {
  BottomNavProjectsIcon,
  BottomNavEpicsIcon,
  BottomNavTasksIcon,
  BottomNavMembersIcon,
  BottomNavDetailsIcon,
} from "../assets/project-shell-assets";

interface ProjectBottomNavProps {
  isDrawerOpen?: boolean;
}

export function ProjectBottomNav({
  isDrawerOpen = false,
}: ProjectBottomNavProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      aria-hidden={isDrawerOpen}
      className={`fixed right-0 bottom-0 left-0 z-30 flex h-16 items-center justify-around border-t border-[rgba(0,0,0,0.05)] bg-[#f1f3ff] px-4 lg:hidden ${
        isDrawerOpen ? "pointer-events-none" : ""
      }`}
    >
      {/* Active destination: Projects is the sole verified navigation Link */}
      <Link
        href="/project"
        className="flex flex-col items-center gap-0.5 text-[#0052cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]"
        aria-label="Projects (active)"
        aria-current="page"
        tabIndex={isDrawerOpen ? -1 : 0}
      >
        <div className="flex size-[18px] items-center justify-center">
          <BottomNavProjectsIcon aria-hidden="true" />
        </div>
        <span className="text-[10px] leading-[15px] font-semibold">
          Projects
        </span>
      </Link>

      {/* Accessible non-link items: No fake hrefs, honest presentation */}
      <div className="flex cursor-default flex-col items-center gap-0.5 text-[#041b3c]/70 select-none">
        <div className="flex h-[18px] w-[20px] items-center justify-center">
          <BottomNavEpicsIcon aria-hidden="true" />
        </div>
        <span className="text-[10px] leading-[15px] font-normal">Epics</span>
      </div>

      <div className="flex cursor-default flex-col items-center gap-0.5 text-[#041b3c]/70 select-none">
        <div className="flex h-[15.075px] w-[20px] items-center justify-center">
          <BottomNavTasksIcon aria-hidden="true" />
        </div>
        <span className="text-[10px] leading-[15px] font-normal">Tasks</span>
      </div>

      <div className="flex cursor-default flex-col items-center gap-0.5 text-[#041b3c]/70 select-none">
        <div className="flex h-[16px] w-[22px] items-center justify-center">
          <BottomNavMembersIcon aria-hidden="true" />
        </div>
        <span className="text-[10px] leading-[15px] font-normal">Members</span>
      </div>

      <div className="flex cursor-default flex-col items-center gap-0.5 text-[#041b3c]/70 select-none">
        <div className="flex size-[20px] items-center justify-center">
          <BottomNavDetailsIcon aria-hidden="true" />
        </div>
        <span className="text-[10px] leading-[15px] font-normal">Details</span>
      </div>
    </nav>
  );
}
