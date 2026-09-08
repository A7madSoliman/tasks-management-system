import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ForgotPasswordPage from "./page";

describe("ForgotPasswordPage (/forgot-password)", () => {
  it("renders Taskly recovery UI", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByRole("heading", { name: "Forgot password?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Reset Link" }),
    ).toBeInTheDocument();
  });
});
