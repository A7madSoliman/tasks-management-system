import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage, { metadata } from "./page";

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

describe("LoginPage (/login)", () => {
  it("exports page metadata matching Taskly specifications", () => {
    expect(metadata.title).toBe("Log In | Taskly");
    expect(metadata.description).toBe(
      "Sign in to access your Taskly workspace",
    );
  });

  it("renders through the existing page/test structure with branding, headings, and login form", () => {
    render(<LoginPage />);

    // Branding header
    expect(screen.getByText("TASKLY")).toBeInTheDocument();

    // Main headings
    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome Back" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter your details to access your workspace"),
    ).toBeInTheDocument();

    // Embedded LoginForm controls
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /remember me/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in|log in/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });
});
