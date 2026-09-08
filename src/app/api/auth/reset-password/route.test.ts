import { beforeEach, describe, expect, it, vi } from "vitest";

const { parseResetPasswordInput, updateRecoveryPassword } = vi.hoisted(() => ({
  parseResetPasswordInput: vi.fn(),
  updateRecoveryPassword: vi.fn(),
}));
vi.mock("@/features/auth/server/auth", () => ({
  parseResetPasswordInput,
  updateRecoveryPassword,
}));
import { POST } from "./route";

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => vi.resetAllMocks());

  it("rejects invalid input before the password-update boundary", async () => {
    parseResetPasswordInput.mockImplementationOnce(() => {
      throw new Error("invalid");
    });
    const response = await POST(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ password: "weak" }),
      }),
    );
    expect(response.status).toBe(400);
    expect(updateRecoveryPassword).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      message: "Unable to update your password. Please try again.",
    });
  });

  it("delegates only validated password fields to the server recovery boundary", async () => {
    const input = {
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    };
    parseResetPasswordInput.mockReturnValueOnce(input);
    const response = await POST(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    );
    expect(response.status).toBe(200);
    expect(updateRecoveryPassword).toHaveBeenCalledWith(input);
    expect(await response.json()).toEqual({ success: true });
  });

  it("normalizes missing recovery context and backend failure safely", async () => {
    parseResetPasswordInput.mockReturnValue({
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    });
    updateRecoveryPassword.mockRejectedValueOnce({
      status: 401,
      message: "raw backend token detail",
    });
    const invalid = await POST(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(invalid.status).toBe(401);
    expect(await invalid.json()).toEqual({
      message: "Invalid or expired reset link.",
    });
    updateRecoveryPassword.mockRejectedValueOnce(
      new Error("raw internal backend body"),
    );
    const failure = await POST(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(await failure.json()).toEqual({
      message: "Unable to update your password. Please try again.",
    });
  });
});
