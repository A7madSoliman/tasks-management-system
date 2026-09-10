import type { ComponentType, SVGProps } from "react";

import LogoIcon from "./svg/logo.svg";
import ProjectsIcon from "./svg/projects.svg";
import ProjectsCollapsedIcon from "./svg/projects-collapsed.svg";
import EpicsIcon from "./svg/epics.svg";
import TasksIcon from "./svg/tasks.svg";
import MembersIcon from "./svg/members.svg";
import DetailsIcon from "./svg/details.svg";
import CollapseIcon from "./svg/collapse.svg";
import ExpandIcon from "./svg/expand.svg";
import BurgerIcon from "./svg/burger.svg";
import LogoutIcon from "./svg/logout.svg";

import BottomNavProjectsIcon from "./svg/bottom-nav-projects.svg";
import BottomNavEpicsIcon from "./svg/bottom-nav-epics.svg";
import BottomNavTasksIcon from "./svg/bottom-nav-tasks.svg";
import BottomNavMembersIcon from "./svg/bottom-nav-members.svg";
import BottomNavDetailsIcon from "./svg/bottom-nav-details.svg";

export type ShellSvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const shellIcons = {
  logo: LogoIcon,
  projects: ProjectsIcon,
  projectsCollapsed: ProjectsCollapsedIcon,
  epics: EpicsIcon,
  tasks: TasksIcon,
  members: MembersIcon,
  details: DetailsIcon,
  collapse: CollapseIcon,
  expand: ExpandIcon,
  burger: BurgerIcon,
  logout: LogoutIcon,
  bottomNav: {
    projects: BottomNavProjectsIcon,
    epics: BottomNavEpicsIcon,
    tasks: BottomNavTasksIcon,
    members: BottomNavMembersIcon,
    details: BottomNavDetailsIcon,
  },
} as const;

export {
  LogoIcon,
  ProjectsIcon,
  ProjectsCollapsedIcon,
  EpicsIcon,
  TasksIcon,
  MembersIcon,
  DetailsIcon,
  CollapseIcon,
  ExpandIcon,
  BurgerIcon,
  LogoutIcon,
  BottomNavProjectsIcon,
  BottomNavEpicsIcon,
  BottomNavTasksIcon,
  BottomNavMembersIcon,
  BottomNavDetailsIcon,
};
