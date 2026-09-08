import { beforeEach, describe, expect, it, vi } from "vitest";

const { logout } = vi.hoisted(() => ({ logout: vi.fn() }));
vi.mock("@/features/auth/server/auth-server", () => ({ logout }));

import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  beforeEach(() => vi.resetAllMocks());

  it("uses the server-only logout boundary and returns no token payload", async () => {
    const response = await POST();

    expect(logout).toHaveBeenCalledOnce();
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });
});
