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

import {
  authCookieNames,
  clearSession,
  getCurrentUser,
  login,
  parseLoginInput,
} from "./server";

describe("Server Auth Helpers (src/features/auth/server.ts)", () => {
  const MOCK_BASE_URL = "https://mock-supabase.test";
  const MOCK_API_KEY = "mock-supabase-api-key";

  beforeEach(() => {
    vi.restoreAllMocks();
    cookieStore.clear();
    mockJar.get.mockClear();
    mockJar.set.mockClear();
    mockJar.delete.mockClear();
    mockJar.has.mockClear();

    process.env.SUPABASE_BASE_URL = MOCK_BASE_URL;
    process.env.SUPABASE_API_KEY = MOCK_API_KEY;
  });

  describe("login()", () => {
    it("posts to /auth/v1/token?grant_type=password with apikey and JSON body, storing tokens in HttpOnly cookies", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "mock-access-token-xyz",
            refresh_token: "mock-refresh-token-abc",
            expires_in: 3600,
            token_type: "bearer",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

      await login({
        email: "curator@workspace.com",
        password: "secret-password",
        rememberMe: false,
      });

      // 1. Verify fetch destination and payload
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0] ?? [];
      expect(url).toBe(`${MOCK_BASE_URL}/auth/v1/token?grant_type=password`);
      expect(init?.method).toBe("POST");
      expect(init?.cache).toBe("no-store");
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

      // 2. Verify cookies were stored with HttpOnly options
      expect(mockJar.set).toHaveBeenCalledTimes(2);

      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.access,
        "mock-access-token-xyz",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 3600,
        }),
      );

      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.refresh,
        "mock-refresh-token-abc",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        }),
      );

      expect(cookieStore.get(authCookieNames.access)?.httpOnly).toBe(true);
      expect(cookieStore.get(authCookieNames.refresh)?.httpOnly).toBe(true);
    });

    it("throws safe error when backend rejects credentials", async () => {
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

      await expect(
        login({
          email: "curator@workspace.com",
          password: "wrong-password",
          rememberMe: false,
        }),
      ).rejects.toEqual({
        status: 400,
        message: "Unable to authenticate. Check your details and try again.",
      });

      // Verify no cookies were set on failure
      expect(mockJar.set).not.toHaveBeenCalled();
    });

    it("throws 502 if backend returns invalid token shape", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            unexpected: "data",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

      await expect(
        login({
          email: "curator@workspace.com",
          password: "password123",
          rememberMe: false,
        }),
      ).rejects.toEqual({
        status: 502,
        message: "Authentication service returned an invalid response.",
      });

      expect(mockJar.set).not.toHaveBeenCalled();
    });

    it("throws when server environment configuration is missing", async () => {
      delete process.env.SUPABASE_BASE_URL;

      await expect(
        login({
          email: "curator@workspace.com",
          password: "password123",
          rememberMe: false,
        }),
      ).rejects.toThrow("Authentication server configuration is missing.");
    });
  });

  describe("getCurrentUser()", () => {
    it("returns null if no access token is stored in cookies", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const user = await getCurrentUser();
      expect(user).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("sends Bearer access token and returns user on 200 response", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "active-access-token-123",
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "user-uuid-456",
            email: "curator@workspace.com",
            user_metadata: { name: "Curator" },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

      const user = await getCurrentUser();
      expect(user).toEqual(
        expect.objectContaining({
          id: "user-uuid-456",
          email: "curator@workspace.com",
        }),
      );

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0] ?? [];
      expect(url).toBe(`${MOCK_BASE_URL}/auth/v1/user`);
      expect(init?.headers).toEqual({
        apikey: MOCK_API_KEY,
        Authorization: "Bearer active-access-token-123",
      });
      expect(init?.cache).toBe("no-store");
    });

    it("attempts token refresh when user lookup fails, updates cookies, and retries user lookup", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "expired-access-token",
      });
      cookieStore.set(authCookieNames.refresh, {
        value: "valid-refresh-token",
      });

      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        // 1. Initial user lookup fails with 401
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ message: "JWT expired" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
        )
        // 2. Refresh token exchange succeeds
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              access_token: "refreshed-access-token-999",
              refresh_token: "new-refresh-token-888",
              expires_in: 3600,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        )
        // 3. Retried user lookup succeeds with new token
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              id: "user-uuid-456",
              email: "curator@workspace.com",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        );

      const user = await getCurrentUser();

      expect(user).toEqual(
        expect.objectContaining({
          id: "user-uuid-456",
          email: "curator@workspace.com",
        }),
      );

      expect(fetchSpy).toHaveBeenCalledTimes(3);

      // Verify call 1: initial user check with expired token
      const [url1, init1] = fetchSpy.mock.calls[0] ?? [];
      expect(url1).toBe(`${MOCK_BASE_URL}/auth/v1/user`);
      expect(init1?.headers).toEqual({
        apikey: MOCK_API_KEY,
        Authorization: "Bearer expired-access-token",
      });

      // Verify call 2: refresh request with refresh token
      const [url2, init2] = fetchSpy.mock.calls[1] ?? [];
      expect(url2).toBe(
        `${MOCK_BASE_URL}/auth/v1/token?grant_type=refresh_token`,
      );
      expect(init2?.method).toBe("POST");
      expect(init2?.headers).toEqual({
        apikey: MOCK_API_KEY,
        "Content-Type": "application/json",
      });
      expect(init2?.body).toBe(
        JSON.stringify({ refresh_token: "valid-refresh-token" }),
      );

      // Verify cookies updated with new tokens
      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.access,
        "refreshed-access-token-999",
        expect.objectContaining({ httpOnly: true, maxAge: 3600 }),
      );
      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.refresh,
        "new-refresh-token-888",
        expect.objectContaining({ httpOnly: true }),
      );

      // Verify call 3: retried user check with refreshed access token
      const [url3, init3] = fetchSpy.mock.calls[2] ?? [];
      expect(url3).toBe(`${MOCK_BASE_URL}/auth/v1/user`);
      expect(init3?.headers).toEqual({
        apikey: MOCK_API_KEY,
        Authorization: "Bearer refreshed-access-token-999",
      });
    });

    it("clears auth cookies and returns null when refresh attempt fails", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "expired-access-token",
      });
      cookieStore.set(authCookieNames.refresh, {
        value: "invalid-refresh-token",
      });

      vi.spyOn(globalThis, "fetch")
        // 1. Initial user lookup fails
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ message: "JWT expired" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
        )
        // 2. Refresh request fails
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ message: "Invalid refresh token" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }),
        );

      const user = await getCurrentUser();

      expect(user).toBeNull();
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.access);
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.refresh);
    });

    it("clears cookies and returns null when user lookup fails and no refresh token exists", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "invalid-access-token",
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const user = await getCurrentUser();

      expect(user).toBeNull();
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.access);
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.refresh);
    });

    it("clears cookies and returns null when user response payload is malformed", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "valid-access-token",
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ missing_id: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const user = await getCurrentUser();

      expect(user).toBeNull();
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.access);
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.refresh);
    });
  });

  describe("clearSession()", () => {
    it("deletes both access and refresh cookies", async () => {
      await clearSession();

      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.access);
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.refresh);
    });
  });

  describe("parseLoginInput()", () => {
    it("parses valid login inputs", () => {
      const parsed = parseLoginInput({
        email: "curator@workspace.com",
        password: "secret-password",
      });

      expect(parsed).toEqual({
        email: "curator@workspace.com",
        password: "secret-password",
        rememberMe: false,
      });
    });

    it("throws on invalid login inputs", () => {
      expect(() =>
        parseLoginInput({
          email: "invalid-email",
          password: "",
        }),
      ).toThrow();
    });
  });
});
