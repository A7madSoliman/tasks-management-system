import "server-only";

import { cookies } from "next/headers";
import { loginSchema, type LoginValues } from "./schema";

const ACCESS_TOKEN_COOKIE = "taskly_access_token";
const REFRESH_TOKEN_COOKIE = "taskly_refresh_token";
const REMEMBER_ME_COOKIE = "taskly_remember_me";
export const AUTH_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const REMEMBER_ME_COOKIE_VALUE = "1";

type AuthTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
};

export type AuthUser = {
  id: string;
  email?: string;
  [key: string]: unknown;
};

type SafeAuthError = { status: number; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env.SUPABASE_BASE_URL;
  const apiKey = process.env.SUPABASE_API_KEY;
  if (!baseUrl || !apiKey)
    throw new Error("Authentication server configuration is missing.");
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

async function readSafeError(response: Response): Promise<SafeAuthError> {
  try {
    await response.json();
  } catch {
    /* Keep backend response details server-side. */
  }
  return {
    status: response.status,
    message:
      response.status === 400 || response.status === 401
        ? "Invalid email or password."
        : "Unable to authenticate. Check your details and try again.",
  };
}

async function requestTokens(
  body: Record<string, string>,
): Promise<AuthTokenResponse> {
  const { baseUrl, apiKey } = getConfig();
  const response = await fetch(
    `${baseUrl}/auth/v1/token?grant_type=${body.refresh_token ? "refresh_token" : "password"}`,
    {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  if (!response.ok) throw await readSafeError(response);
  const payload: unknown = await response.json();
  if (
    !isRecord(payload) ||
    typeof payload.access_token !== "string" ||
    typeof payload.refresh_token !== "string"
  ) {
    throw {
      status: 502,
      message: "Authentication service returned an invalid response.",
    } satisfies SafeAuthError;
  }
  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    ...(typeof payload.expires_in === "number"
      ? { expires_in: payload.expires_in }
      : {}),
    ...(typeof payload.token_type === "string"
      ? { token_type: payload.token_type }
      : {}),
  };
}

async function storeTokens(tokens: AuthTokenResponse, rememberMe: boolean) {
  const jar = await cookies();
  const options = cookieOptions(
    rememberMe ? AUTH_SESSION_MAX_AGE_SECONDS : undefined,
  );
  jar.set(ACCESS_TOKEN_COOKIE, tokens.access_token, options);
  jar.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, options);
  if (rememberMe) {
    jar.set(
      REMEMBER_ME_COOKIE,
      REMEMBER_ME_COOKIE_VALUE,
      cookieOptions(AUTH_SESSION_MAX_AGE_SECONDS),
    );
  } else {
    jar.delete(REMEMBER_ME_COOKIE);
  }
}

export async function login(input: LoginValues): Promise<void> {
  await storeTokens(
    await requestTokens({ email: input.email, password: input.password }),
    input.rememberMe,
  );
}

async function refreshSession(refreshToken: string): Promise<boolean> {
  try {
    const rememberMe =
      (await cookies()).get(REMEMBER_ME_COOKIE)?.value ===
      REMEMBER_ME_COOKIE_VALUE;
    await storeTokens(
      await requestTokens({ refresh_token: refreshToken }),
      rememberMe,
    );
    return true;
  } catch {
    await clearSession();
    return false;
  }
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_TOKEN_COOKIE);
  jar.delete(REFRESH_TOKEN_COOKIE);
  jar.delete(REMEMBER_ME_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  const { baseUrl, apiKey } = getConfig();
  const request = () =>
    fetch(`${baseUrl}/auth/v1/user`, {
      headers: { apikey: apiKey, Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  let response = await request();
  if (!response.ok && refreshToken && (await refreshSession(refreshToken))) {
    const refreshed = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (refreshed)
      response = await fetch(`${baseUrl}/auth/v1/user`, {
        headers: { apikey: apiKey, Authorization: `Bearer ${refreshed}` },
        cache: "no-store",
      });
  }
  if (!response.ok) {
    await clearSession();
    return null;
  }
  const payload: unknown = await response.json();
  if (!isRecord(payload) || typeof payload.id !== "string") {
    await clearSession();
    return null;
  }
  return {
    id: payload.id,
    ...(typeof payload.email === "string" ? { email: payload.email } : {}),
    ...payload,
  };
}

export function parseLoginInput(input: unknown): LoginValues {
  return loginSchema.parse(input);
}

export const authCookieNames = {
  access: ACCESS_TOKEN_COOKIE,
  refresh: REFRESH_TOKEN_COOKIE,
  rememberMe: REMEMBER_ME_COOKIE,
} as const;
