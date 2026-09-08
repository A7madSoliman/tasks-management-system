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
  AUTH_SESSION_MAX_AGE_SECONDS,
  authCookieNames,
  clearSession,
  establishRecoveryContext,
  getCurrentUser,
  login,
  parseLoginInput,
  updateRecoveryPassword,
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
    it("stores session-scoped access/refresh cookies with no maxAge and deletes persistence marker when rememberMe is false", async () => {
      cookieStore.set(authCookieNames.rememberMe, { value: "1" });

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

      // 2. Verify cookies were stored with session scope (no maxAge)
      expect(mockJar.set).toHaveBeenCalledTimes(2);

      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.access,
        "mock-access-token-xyz",
        {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
        },
      );

      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.refresh,
        "mock-refresh-token-abc",
        {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
        },
      );

      // 3. Verify persistence marker is deleted and no maxAge in store
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.rememberMe);
      expect(cookieStore.get(authCookieNames.access)?.maxAge).toBeUndefined();
      expect(cookieStore.get(authCookieNames.refresh)?.maxAge).toBeUndefined();
      expect(cookieStore.get(authCookieNames.rememberMe)).toBeUndefined();
    });

    it("stores HttpOnly SameSite=Lax Secure-in-production cookies with maxAge 30 days and marker when rememberMe is true", async () => {
      vi.stubEnv("NODE_ENV", "production");

      try {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              access_token: "mock-prod-access-token",
              refresh_token: "mock-prod-refresh-token",
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
          rememberMe: true,
        });

        // 3 cookies set: access, refresh, and rememberMe marker
        expect(mockJar.set).toHaveBeenCalledTimes(3);

        const expectedOptions = {
          httpOnly: true,
          sameSite: "lax" as const,
          secure: true,
          path: "/",
          maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
        };

        expect(mockJar.set).toHaveBeenCalledWith(
          authCookieNames.access,
          "mock-prod-access-token",
          expectedOptions,
        );
        expect(mockJar.set).toHaveBeenCalledWith(
          authCookieNames.refresh,
          "mock-prod-refresh-token",
          expectedOptions,
        );
        expect(mockJar.set).toHaveBeenCalledWith(
          authCookieNames.rememberMe,
          "1",
          expectedOptions,
        );

        expect(cookieStore.get(authCookieNames.access)?.secure).toBe(true);
        expect(cookieStore.get(authCookieNames.access)?.maxAge).toBe(
          AUTH_SESSION_MAX_AGE_SECONDS,
        );
        expect(cookieStore.get(authCookieNames.refresh)?.secure).toBe(true);
        expect(cookieStore.get(authCookieNames.refresh)?.maxAge).toBe(
          AUTH_SESSION_MAX_AGE_SECONDS,
        );
        expect(cookieStore.get(authCookieNames.rememberMe)?.value).toBe("1");
        expect(cookieStore.get(authCookieNames.rememberMe)?.secure).toBe(true);
        expect(cookieStore.get(authCookieNames.rememberMe)?.maxAge).toBe(
          AUTH_SESSION_MAX_AGE_SECONDS,
        );
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it("maps 400 credential rejection to exact 'Invalid email or password.' message", async () => {
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
        message: "Invalid email or password.",
      });

      expect(mockJar.set).not.toHaveBeenCalled();
    });

    it("maps 401 credential rejection to exact 'Invalid email or password.' message", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: "invalid_credentials",
            error_description: "Invalid email or password",
          }),
          {
            status: 401,
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
        status: 401,
        message: "Invalid email or password.",
      });

      expect(mockJar.set).not.toHaveBeenCalled();
    });

    it("maps 500 server rejection to safe generic error without exposing backend raw data", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: "db_error",
            error_description:
              "postgres://admin:secret@10.0.0.1 failed connection",
          }),
          {
            status: 500,
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
        status: 500,
        message: "Unable to authenticate. Check your details and try again.",
      });

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

    it("attempts token refresh when user lookup fails, updates session-scoped cookies when rememberMe is false, and retries user lookup", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "expired-access-token",
      });
      cookieStore.set(authCookieNames.refresh, {
        value: "valid-refresh-token",
      });
      // No rememberMe cookie set (session mode)

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

      // Verify cookies updated with session-scoped options (no maxAge)
      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.access,
        "refreshed-access-token-999",
        {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
        },
      );
      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.refresh,
        "new-refresh-token-888",
        {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
        },
      );
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.rememberMe);

      // Verify call 3: retried user check with refreshed access token
      const [url3, init3] = fetchSpy.mock.calls[2] ?? [];
      expect(url3).toBe(`${MOCK_BASE_URL}/auth/v1/user`);
      expect(init3?.headers).toEqual({
        apikey: MOCK_API_KEY,
        Authorization: "Bearer refreshed-access-token-999",
      });
    });

    it("attempts token refresh when user lookup fails, preserves rememberMe: true (30-day maxAge and marker), and retries user lookup", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "expired-access-token",
      });
      cookieStore.set(authCookieNames.refresh, {
        value: "valid-refresh-token",
      });
      cookieStore.set(authCookieNames.rememberMe, {
        value: "1",
      });

      vi.spyOn(globalThis, "fetch")
        // 1. Initial lookup fails with 401
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ message: "JWT expired" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }),
        )
        // 2. Refresh succeeds
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              access_token: "refreshed-access-token-persisted",
              refresh_token: "new-refresh-token-persisted",
              expires_in: 3600,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        )
        // 3. User retry succeeds
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              id: "user-uuid-789",
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
          id: "user-uuid-789",
          email: "curator@workspace.com",
        }),
      );

      const expectedOptions = {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: false,
        path: "/",
        maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
      };

      // Verify persistent cookies and marker preserved
      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.access,
        "refreshed-access-token-persisted",
        expectedOptions,
      );
      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.refresh,
        "new-refresh-token-persisted",
        expectedOptions,
      );
      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.rememberMe,
        "1",
        expectedOptions,
      );
    });

    it("clears all auth cookies including marker and returns null when refresh attempt fails", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "expired-access-token",
      });
      cookieStore.set(authCookieNames.refresh, {
        value: "invalid-refresh-token",
      });
      cookieStore.set(authCookieNames.rememberMe, {
        value: "1",
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
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.rememberMe);
    });

    it("clears cookies and returns null when user lookup fails and no refresh token exists", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "invalid-access-token",
      });
      cookieStore.set(authCookieNames.rememberMe, {
        value: "1",
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
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.rememberMe);
    });

    it("clears cookies and returns null when user response payload is malformed", async () => {
      cookieStore.set(authCookieNames.access, {
        value: "valid-access-token",
      });
      cookieStore.set(authCookieNames.rememberMe, {
        value: "1",
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
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.rememberMe);
    });
  });

  describe("clearSession()", () => {
    it("deletes access, refresh, and rememberMe marker cookies", async () => {
      await clearSession();

      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.access);
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.refresh);
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.rememberMe);
    });
  });

  describe("recovery context", () => {
    it("validates recovery authorization before storing a dedicated HttpOnly cookie", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "user-id" }), { status: 200 }),
      );
      expect(await establishRecoveryContext("recovery-token")).toBe(true);
      expect(mockJar.set).toHaveBeenCalledWith(
        authCookieNames.recovery,
        "recovery-token",
        { httpOnly: true, sameSite: "lax", secure: false, path: "/" },
      );
      expect(cookieStore.has(authCookieNames.access)).toBe(false);
      expect(cookieStore.has(authCookieNames.refresh)).toBe(false);
    });

    it("uses only the dedicated recovery credential for the verified password update endpoint and clears it on success", async () => {
      cookieStore.set(authCookieNames.recovery, { value: "recovery-token" });
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response("{}", { status: 200 }));
      await updateRecoveryPassword({
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });
      expect(fetchSpy).toHaveBeenCalledWith(`${MOCK_BASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: {
          apikey: MOCK_API_KEY,
          "Content-Type": "application/json",
          Authorization: "Bearer recovery-token",
        },
        body: JSON.stringify({ password: "SecurePass123!" }),
        cache: "no-store",
      });
      expect(mockJar.delete).toHaveBeenCalledWith(authCookieNames.recovery);
      expect(mockJar.delete).not.toHaveBeenCalledWith(authCookieNames.access);
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
