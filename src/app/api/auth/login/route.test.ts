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
  set: vi.fn((name: string, value: string, options?: Omit<MockCookieItem, "value">) => {
    cookieStore.set(name, { value, ...options });
  }),
  delete: vi.fn((name: string) => {
    cookieStore.delete(name);
  }),
  has: vi.fn((name: string) => cookieStore.has(name)),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockJar),
}));

import { POST } from "./route";

describe("POST /api/auth/login", () => {
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

  it("successfully logs in, stores tokens in HttpOnly cookies, and returns only { success: true } without exposing tokens", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "secret-access-token-123",
          refresh_token: "secret-refresh-token-456",
          expires_in: 3600,
          token_type: "bearer",
          user: { id: "user-id-789" },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "curator@workspace.com",
        password: "secret-password",
        rememberMe: true,
      }),
    });

    const response = await POST(request);

    // Verify response status
    expect(response.status).toBe(200);

    // Verify response body does not expose tokens
    const body: unknown = await response.json();
    expect(body).toEqual({ success: true });
    expect(body).not.toHaveProperty("access_token");
    expect(body).not.toHaveProperty("refresh_token");

    // Verify backend call made with proper grant_type, apikey, and credentials
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe(`${MOCK_BASE_URL}/auth/v1/token?grant_type=password`);
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      apikey: MOCK_API_KEY,
      "Content-Type": "application/json",
    });
    expect(init?.body).toBe(
      JSON.stringify({
        email: "curator@workspace.com",
        password: "secret-password",
      }),
    );

    // Verify tokens were stored in HttpOnly cookies
    expect(mockJar.set).toHaveBeenCalledTimes(2);
    expect(mockJar.set).toHaveBeenCalledWith(
      "taskly_access_token",
      "secret-access-token-123",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
      }),
    );
    expect(mockJar.set).toHaveBeenCalledWith(
      "taskly_refresh_token",
      "secret-refresh-token-456",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      }),
    );
  });

  it("returns 401 when request body fails validation", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "not-an-email",
        password: "",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const body: unknown = await response.json();
    expect(body).toEqual({
      message: "Unable to authenticate. Check your details and try again.",
    });

    // Verify no cookies were set
    expect(mockJar.set).not.toHaveBeenCalled();
  });

  it("returns safe error response when backend rejects authentication", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "curator@workspace.com",
        password: "wrong-password",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body: unknown = await response.json();
    expect(body).toEqual({
      message: "Unable to authenticate. Check your details and try again.",
    });

    expect(mockJar.set).not.toHaveBeenCalled();
  });

  it("handles malformed JSON request body gracefully", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid-json{",
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const body: unknown = await response.json();
    expect(body).toEqual({
      message: "Unable to authenticate. Check your details and try again.",
    });
  });
});
