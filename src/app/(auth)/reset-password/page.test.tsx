import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { hasValidRecoveryContext } = vi.hoisted(() => ({
  hasValidRecoveryContext: vi.fn(),
}));
vi.mock("@/features/auth/server/auth", () => ({ hasValidRecoveryContext }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

import ResetPasswordPage from "./page";

describe("ResetPasswordPage", () => {
  it("uses its focused Auth screen rather than the project shell", async () => {
    hasValidRecoveryContext.mockResolvedValueOnce(true);
    render(await ResetPasswordPage());
    expect(
      screen.getByRole("heading", { name: "Create a New Password" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Taskly Workspace")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Authentication successful."),
    ).not.toBeInTheDocument();
  });
});
