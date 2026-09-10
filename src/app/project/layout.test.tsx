import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import ProjectLayout from "./layout";
import { getCurrentUser } from "@/features/auth/server/auth-server";
import { redirect } from "next/navigation";

vi.mock("@/features/auth/server/auth-server", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    const error = new Error(`NEXT_REDIRECT: ${url}`);
    (error as unknown as { digest: string }).digest =
      `NEXT_REDIRECT;replace;${url};307;;`;
    throw error;
  }),
}));

vi.mock("@/features/project-shell/components/ProjectShell", () => ({
  ProjectShell: ({
    profile,
    children,
  }: {
    profile: { displayName: string; initials: string; jobTitle?: string };
    children: React.ReactNode;
  }) => (
    <div data-testid="project-shell" data-profile={JSON.stringify(profile)}>
      <div data-testid="shell-display-name">{profile.displayName}</div>
      <div data-testid="shell-initials">{profile.initials}</div>
      {profile.jobTitle && (
        <div data-testid="shell-job-title">{profile.jobTitle}</div>
      )}
      <div data-testid="shell-children">{children}</div>
    </div>
  ),
}));

import ProjectPage from "./page";

describe("ProjectLayout (T005)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ProjectPage content without calling getCurrentUser or redirect", () => {
    render(<ProjectPage />);

    expect(screen.getByText("Taskly Workspace")).toBeInTheDocument();
    expect(screen.getByText("Authentication successful.")).toBeInTheDocument();
    expect(getCurrentUser).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated visitor to /login without rendering children or identity", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);

    await expect(
      ProjectLayout({
        children: <div data-testid="child-content">Secret Content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT: /login");

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("project-shell")).not.toBeInTheDocument();
  });

  it("renders authenticated layout with minimal mapped profile and nested children", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "u-123",
      email: "ahmed@example.com",
      user_metadata: {
        name: "Ahmed Soliman",
        job_title: "Project Manager",
        secret: "super-secret",
      },
    });

    const jsx = await ProjectLayout({
      children: <div data-testid="child-content">Active Workspace Content</div>,
    });

    render(jsx);

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("project-shell")).toBeInTheDocument();
    expect(screen.getByTestId("shell-display-name")).toHaveTextContent(
      "Ahmed Soliman",
    );
    expect(screen.getByTestId("shell-initials")).toHaveTextContent("AS");
    expect(screen.getByTestId("shell-job-title")).toHaveTextContent(
      "Project Manager",
    );
    expect(screen.getByTestId("child-content")).toHaveTextContent(
      "Active Workspace Content",
    );

    const shellElement = screen.getByTestId("project-shell");
    const profileAttr = JSON.parse(
      shellElement.getAttribute("data-profile") || "{}",
    );
    expect(profileAttr).toEqual({
      displayName: "Ahmed Soliman",
      initials: "AS",
      jobTitle: "Project Manager",
    });
    expect(profileAttr).not.toHaveProperty("id");
    expect(profileAttr).not.toHaveProperty("secret");
  });

  it("safely handles fallback profile when name is missing but valid email exists", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      id: "u-456",
      email: "ahmed.dev@example.com",
      user_metadata: {},
    });

    const jsx = await ProjectLayout({
      children: <div data-testid="child-content">Page Content</div>,
    });

    render(jsx);

    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("shell-display-name")).toHaveTextContent(
      "ahmed.dev@example.com",
    );
    expect(screen.getByTestId("shell-initials")).toHaveTextContent("AD");
    expect(screen.queryByTestId("shell-job-title")).not.toBeInTheDocument();
  });
});
