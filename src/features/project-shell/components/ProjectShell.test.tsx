import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ProjectShell } from "./ProjectShell";
import type { ShellUserProfile } from "../profile";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockProfileWithNameAndTitle: ShellUserProfile = {
  displayName: "Ahmed Soliman",
  initials: "AS",
  jobTitle: "Project Manager",
};

const mockProfileWithoutTitle: ShellUserProfile = {
  displayName: "Ahmed Soliman",
  initials: "AS",
};

describe("ProjectShell Component Tests (T010, T012, T015)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  describe("Phase 3: User Story 1 - Header, Identity, and Logout (T008-T010)", () => {
    it("renders identity header with name, optional job title, and initials avatar", () => {
      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div data-testid="test-child">Child Workspace Content</div>
        </ProjectShell>,
      );

      expect(screen.getAllByText("Ahmed Soliman").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Project Manager").length).toBeGreaterThan(0);
      expect(screen.getAllByText("AS").length).toBeGreaterThan(0);
      const profileText = screen.getByTestId("desktop-profile-text");
      expect(profileText).toHaveClass("items-center", "text-center");
      expect(profileText).toHaveTextContent("Ahmed Soliman");
      expect(profileText).toHaveTextContent("Project Manager");
      expect(profileText.nextElementSibling).toHaveTextContent("AS");
      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });

    it("omits job title line without gap when jobTitle is undefined", () => {
      render(
        <ProjectShell profile={mockProfileWithoutTitle}>
          <div data-testid="test-child">Child Workspace Content</div>
        </ProjectShell>,
      );

      expect(screen.getAllByText("Ahmed Soliman").length).toBeGreaterThan(0);
      expect(screen.queryByText("Project Manager")).not.toBeInTheDocument();
      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });

    it("wires POST /api/auth/logout and redirects to /login on accepted response", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(null, { status: 204 }),
      );

      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Workspace Content</div>
        </ProjectShell>,
      );

      // Find desktop logout button inside desktop expanded sidebar
      const expandedSidebar = screen.getByTestId("desktop-sidebar-expanded");
      const logoutBtn = within(expandedSidebar).getByRole("button", {
        name: /log out/i,
      });

      fireEvent.click(logoutBtn);

      expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("prevents duplicate logout activations while pending", async () => {
      let resolveFetch!: (res: Response) => void;
      const pendingFetch = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      vi.mocked(global.fetch).mockReturnValueOnce(pendingFetch);

      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Workspace Content</div>
        </ProjectShell>,
      );

      const expandedSidebar = screen.getByTestId("desktop-sidebar-expanded");
      const button = within(expandedSidebar).getByRole("button", {
        name: /log out/i,
      });

      fireEvent.click(button);

      // Verify disabled and aria-busy while pending
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");

      // Attempt second click
      fireEvent.click(button);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Resolve fetch
      resolveFetch(new Response(null, { status: 204 }));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("retains current route and displays safe error messaging on logout failure", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network Error"));

      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div data-testid="retained-content">Retained Content</div>
        </ProjectShell>,
      );

      const expandedSidebar = screen.getByTestId("desktop-sidebar-expanded");
      const logoutBtn = within(expandedSidebar).getByRole("button", {
        name: /log out/i,
      });
      fireEvent.click(logoutBtn);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Unable to log out. Please try again.",
        );
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByTestId("retained-content")).toBeInTheDocument();
    });
  });

  describe("Phase 4: User Story 2 - Desktop Navigation (T011-T012)", () => {
    it("renders default 256px expanded sidebar with active Projects link and non-link items", () => {
      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Content</div>
        </ProjectShell>,
      );

      const expandedSidebar = screen.getByTestId("desktop-sidebar-expanded");
      expect(expandedSidebar).toBeInTheDocument();
      expect(expandedSidebar).toHaveClass("w-64");

      // Projects is the ONLY real navigation link in expanded sidebar
      const projectsLink = within(expandedSidebar).getByRole("link", {
        name: /projects/i,
      });
      expect(projectsLink).toHaveAttribute("href", "/project");
      expect(projectsLink).toHaveAttribute("aria-current", "page");

      // Epics, Tasks, Members, Details are honest non-link presentation items
      const nonLinks = [
        "Project Epics",
        "Project Tasks",
        "Project Members",
        "Project Details",
      ];
      for (const name of nonLinks) {
        const item = within(expandedSidebar).getByText(name);
        expect(item).toBeInTheDocument();
        expect(item.closest("a")).toBeNull();
        expect(item.closest("button")).toBeNull();
        expect(item.closest("[role='button']")).toBeNull();
      }
    });

    it("collapses sidebar to 80px icon-only state and re-expands to 256px via keyboard/pointer", () => {
      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Content</div>
        </ProjectShell>,
      );

      const expandedSidebar = screen.getByTestId("desktop-sidebar-expanded");
      expect(expandedSidebar).toBeInTheDocument();
      expect(
        screen.queryByTestId("desktop-sidebar-collapsed"),
      ).not.toBeInTheDocument();

      // Click Collapse button
      const collapseBtn = within(expandedSidebar).getByRole("button", {
        name: /collapse sidebar/i,
      });
      fireEvent.click(collapseBtn);

      // Now collapsed sidebar is active
      expect(
        screen.queryByTestId("desktop-sidebar-expanded"),
      ).not.toBeInTheDocument();
      const collapsedSidebar = screen.getByTestId("desktop-sidebar-collapsed");
      expect(collapsedSidebar).toBeInTheDocument();
      expect(collapsedSidebar).toHaveClass("w-20");

      // Click Expand button
      const expandBtn = within(collapsedSidebar).getByRole("button", {
        name: /expand sidebar/i,
      });
      fireEvent.click(expandBtn);

      // Re-expanded
      expect(
        screen.getByTestId("desktop-sidebar-expanded"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("desktop-sidebar-collapsed"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Phase 5: User Story 3 - Compact Navigation & Bottom Nav (T013-T015)", () => {
    it("opens 288px drawer on burger activation and locks page scroll", () => {
      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Compact Content</div>
        </ProjectShell>,
      );

      const burgerButton = screen.getByRole("button", {
        name: /open navigation menu/i,
      });
      expect(burgerButton).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByTestId("compact-drawer")).not.toBeInTheDocument();
      expect(screen.queryByTestId("drawer-overlay")).not.toBeInTheDocument();

      // Open drawer
      fireEvent.click(burgerButton);

      expect(burgerButton).toHaveAttribute("aria-expanded", "true");
      const drawer = screen.getByTestId("compact-drawer");
      expect(drawer).toBeInTheDocument();
      expect(drawer).toHaveClass("w-72"); // 288px
      expect(screen.getByTestId("drawer-overlay")).toBeInTheDocument();
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("dismisses drawer on Escape key and restores focus to burger button", async () => {
      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Compact Content</div>
        </ProjectShell>,
      );

      const burgerButton = screen.getByRole("button", {
        name: /open navigation menu/i,
      });
      fireEvent.click(burgerButton);

      expect(screen.getByTestId("compact-drawer")).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape" });

      await waitFor(() => {
        expect(screen.queryByTestId("compact-drawer")).not.toBeInTheDocument();
      });

      expect(document.body.style.overflow).toBe("");
      expect(document.activeElement).toBe(burgerButton);
    });

    it("dismisses drawer on overlay click and restores focus to burger button", async () => {
      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Compact Content</div>
        </ProjectShell>,
      );

      const burgerButton = screen.getByRole("button", {
        name: /open navigation menu/i,
      });
      fireEvent.click(burgerButton);

      const overlay = screen.getByTestId("drawer-overlay");
      fireEvent.click(overlay);

      await waitFor(() => {
        expect(screen.queryByTestId("compact-drawer")).not.toBeInTheDocument();
      });

      expect(document.body.style.overflow).toBe("");
      expect(document.activeElement).toBe(burgerButton);
    });

    it("renders persistent compact Bottom Navigation with Projects as sole Link and non-link semantics for others", () => {
      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Compact Content</div>
        </ProjectShell>,
      );

      const bottomNav = screen.getByRole("navigation", {
        name: /mobile navigation/i,
      });
      expect(bottomNav).toBeInTheDocument();
      expect(bottomNav).toHaveClass("h-16");

      // Verify content reserves 64px on mobile
      const mainContent = screen.getByTestId("shell-main-content");
      expect(mainContent).toHaveClass("pb-16");

      // Projects link inside bottom nav
      const bottomProjectsLink = within(bottomNav).getByRole("link", {
        name: /projects/i,
      });
      expect(bottomProjectsLink).toHaveAttribute("href", "/project");
      expect(bottomProjectsLink).toHaveAttribute("aria-current", "page");

      // Non-links in bottom nav: honest presentation items without link or button semantics
      const nonLinks = ["Epics", "Tasks", "Members", "Details"];
      for (const name of nonLinks) {
        const item = within(bottomNav).getByText(name);
        expect(item).toBeInTheDocument();
        expect(item.closest("a")).toBeNull();
        expect(item.closest("button")).toBeNull();
        expect(item.closest("[role='button']")).toBeNull();
      }
    });

    it("disables bottom navigation interaction and sets aria-hidden while drawer is open", () => {
      render(
        <ProjectShell profile={mockProfileWithNameAndTitle}>
          <div>Compact Content</div>
        </ProjectShell>,
      );

      const bottomNav = screen.getByRole("navigation", {
        name: /mobile navigation/i,
      });
      expect(bottomNav).not.toHaveClass("pointer-events-none");
      expect(bottomNav).not.toHaveAttribute("aria-hidden", "true");

      const burgerButton = screen.getByRole("button", {
        name: /open navigation menu/i,
      });
      fireEvent.click(burgerButton);

      expect(bottomNav).toHaveClass("pointer-events-none");
      expect(bottomNav).toHaveAttribute("aria-hidden", "true");

      // Bottom nav Projects link has tabIndex -1 when drawer is open
      const bottomProjectsLink = within(bottomNav).getByRole("link", {
        name: /projects/i,
        hidden: true,
      });
      expect(bottomProjectsLink).toHaveAttribute("tabindex", "-1");
    });
  });
});
