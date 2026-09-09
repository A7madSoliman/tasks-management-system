import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SignUpPage, { metadata } from "./page";

afterEach(async () => {
  await act(async () => {});
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("SignUpPage (/sign-up)", () => {
  it("exports page metadata matching Taskly specifications", () => {
    expect(metadata.title).toBe("Sign Up | Taskly");
    expect(metadata.description).toBe("Create your workspace to access Taskly");
  });

  it("renders branding header, headings, and sign-up form controls", () => {
    render(<SignUpPage />);

    // Branding header
    expect(screen.getByText("TASKLY")).toBeInTheDocument();

    // Main headings
    expect(
      screen.getByRole("heading", { level: 1, name: "Create your workspace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Join the editorial approach to task management."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Join the curated environment for institutional trust and task precision.",
      ),
    ).toBeInTheDocument();

    // Embedded SignUpForm controls
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
  });

  it("applies responsive layout structure matching desktop card and mobile full page design", () => {
    const { container } = render(<SignUpPage />);

    // Check main container card classes
    const cardContainer = container.querySelector("main > div");
    expect(cardContainer).toBeInTheDocument();
    expect(cardContainer?.className).toContain("w-full");
    expect(cardContainer?.className).toContain("max-w-full");
    expect(cardContainer?.className).toContain("md:max-w-[576px]");
    expect(cardContainer?.className).toContain("md:rounded-[8px]");
    expect(cardContainer?.className).toContain("md:bg-white");
    expect(cardContainer?.className).toContain("md:p-[48px]");
    expect(container.firstElementChild?.className).toContain("min-h-dvh");
    expect(container.innerHTML).not.toContain("overflow-hidden");
  });
});
