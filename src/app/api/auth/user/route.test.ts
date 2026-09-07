import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock server-only to allow importing server modules in tests
vi.mock("server-only", () => ({}));

type MockCookieItem = {
  value: string;
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  path?: string;
  maxAge?: number;
};

const cookieStore = new Map<string, MockCookieItem>();

const mockJar = {
  get: vi.fn((name: string) => cookieStore.get(name)),
  set: vi.fn(
    (name: string, value: string, options?: Omit<MockCookieItem, "value">) => {
      cookieStore.set(name, { value, ...options });
    },
  ),
  delete: vi.fn((name: string) => {
    cookieStore.delete(name);
  }),
  has: vi.fn((name: string) => cookieStore.has(name)),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockJar),
}));

import { GET } from "./route";

describe("GET /api/auth/user", () => {
  const MOCK_BASE_URL = "https://mock-supabase.test";
  const MOCK_API_KEY = "mock-supabase-api-key";

  beforeEach(() => {
    vi.restoreAllMocks();
    cookieStore.clear();
    mockJar.get.mockClear();
    mockJar.set.mockClear();
    mockJar.delete.mockClear();

    process.env.SUPABASE_BASE_URL = MOCK_BASE_URL;
    process.env.SUPABASE_API_KEY = MOCK_API_KEY;
  });

  it("returns 401 with { user: null } when no access token cookie exists", async () => {
    const response = await GET();
    expect(response.status).toBe(401);

    const body: unknown = await response.json();
    expect(body).toEqual({ user: null });
  });

  it("sends Bearer access token and returns 200 with user when authenticated", async () => {
    cookieStore.set("taskly_access_token", {
      value: "valid-bearer-access-token",
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "user-123",
          email: "curator@workspace.com",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const response = await GET();
    expect(response.status).toBe(200);

    const body: unknown = await response.json();
    expect(body).toEqual({
      user: expect.objectContaining({
        id: "user-123",
        email: "curator@workspace.com",
      }),
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe(`${MOCK_BASE_URL}/auth/v1/user`);
    expect(init?.headers).toEqual({
      apikey: MOCK_API_KEY,
      Authorization: "Bearer valid-bearer-access-token",
    });
  });

  it("performs token refresh on 401, updates cookies, and retries user lookup successfully", async () => {
    cookieStore.set("taskly_access_token", {
      value: "expired-access-token",
    });
    cookieStore.set("taskly_refresh_token", {
      value: "valid-refresh-token",
    });

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      // 1. Initial user lookup fails
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "JWT expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      )
      // 2. Token refresh succeeds
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "new-access-token-999",
            refresh_token: "new-refresh-token-888",
            expires_in: 3600,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      // 3. Retried user lookup succeeds
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "user-123",
            email: "curator@workspace.com",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    const response = await GET();
    expect(response.status).toBe(200);

    const body: unknown = await response.json();
    expect(body).toEqual({
      user: expect.objectContaining({
        id: "user-123",
        email: "curator@workspace.com",
      }),
    });

    expect(fetchSpy).toHaveBeenCalledTimes(3);

    // Verify cookies updated
    expect(mockJar.set).toHaveBeenCalledWith(
      "taskly_access_token",
      "new-access-token-999",
      expect.objectContaining({ httpOnly: true, maxAge: 3600 }),
    );
    expect(mockJar.set).toHaveBeenCalledWith(
      "taskly_refresh_token",
      "new-refresh-token-888",
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("clears auth cookies and returns 401 { user: null } when token refresh fails", async () => {
    cookieStore.set("taskly_access_token", {
      value: "expired-access-token",
    });
    cookieStore.set("taskly_refresh_token", {
      value: "expired-refresh-token",
    });

    vi.spyOn(globalThis, "fetch")
      // 1. Initial user lookup fails
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "JWT expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      )
      // 2. Refresh fails
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Invalid refresh token" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const response = await GET();
    expect(response.status).toBe(401);

    const body: unknown = await response.json();
    expect(body).toEqual({ user: null });

    expect(mockJar.delete).toHaveBeenCalledWith("taskly_access_token");
    expect(mockJar.delete).toHaveBeenCalledWith("taskly_refresh_token");
  });
});
