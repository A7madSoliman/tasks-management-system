import type React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/auth-server";
import { mapShellUserProfile } from "@/features/project-shell/profile";
import { ProjectShell } from "@/features/project-shell/components/ProjectShell";

export interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default async function ProjectLayout({ children }: ProjectLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = mapShellUserProfile(user);

  return <ProjectShell profile={profile}>{children}</ProjectShell>;
}
