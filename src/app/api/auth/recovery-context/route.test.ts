import { beforeEach, describe, expect, it, vi } from "vitest";

const { establishRecoveryContext, clearRecoveryContext } = vi.hoisted(() => ({
  establishRecoveryContext: vi.fn(),
  clearRecoveryContext: vi.fn(),
}));
vi.mock("@/features/auth/server", () => ({
  establishRecoveryContext,
  clearRecoveryContext,
}));

import { DELETE, POST } from "./route";

describe("POST /api/auth/recovery-context", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    { type: "recovery" },
    { accessToken: "token" },
    { type: "signup", accessToken: "token" },
  ])(
    "rejects malformed recovery context without accepting a token",
    async (body) => {
      const response = await POST(
        new Request("http://localhost/api/auth/recovery-context", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: "Invalid or expired reset link.",
      });
      expect(establishRecoveryContext).not.toHaveBeenCalled();
    },
  );

  it("validates only through the server boundary and never returns the raw token", async () => {
    establishRecoveryContext.mockResolvedValueOnce(true);
    const response = await POST(
      new Request("http://localhost/api/auth/recovery-context", {
        method: "POST",
        body: JSON.stringify({
          type: "recovery",
          accessToken: "raw-recovery-token",
        }),
      }),
    );
    expect(establishRecoveryContext).toHaveBeenCalledWith("raw-recovery-token");
    const payload = await response.json();
    expect(payload).toEqual({ success: true });
    expect(JSON.stringify(payload)).not.toContain("raw-recovery-token");
  });

  it("normalizes invalid backend authorization without exposing its response", async () => {
    establishRecoveryContext.mockResolvedValueOnce(false);
    const response = await POST(
      new Request("http://localhost/api/auth/recovery-context", {
        method: "POST",
        body: JSON.stringify({ type: "recovery", accessToken: "expired" }),
      }),
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      message: "Invalid or expired reset link.",
    });
  });

  it("clears only the dedicated recovery context", async () => {
    const response = await DELETE();
    expect(response.status).toBe(204);
    expect(clearRecoveryContext).toHaveBeenCalledOnce();
  });
});
