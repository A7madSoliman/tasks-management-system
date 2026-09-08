import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { POST } from "./route";

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.SUPABASE_BASE_URL = "https://mock-supabase.test";
    process.env.SUPABASE_API_KEY = "mock-supabase-api-key";
  });

  it("uses the verified recovery endpoint, server-only headers, and safe success response", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));
    const response = await POST(
      new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "person@example.com" }),
      }),
    );
    expect(await response.json()).toEqual({
      success: true,
      message:
        "If an account exists with this email, we’ve sent a password reset link.",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://mock-supabase.test/auth/v1/recover",
      {
        method: "POST",
        headers: {
          apikey: "mock-supabase-api-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "person@example.com" }),
        cache: "no-store",
      },
    );
  });

  it("validates before requesting Supabase", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const response = await POST(
      new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "invalid" }),
      }),
    );
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not surface raw backend errors or account information", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "User not found",
          email: "person@example.com",
        }),
        { status: 400 },
      ),
    );
    const response = await POST(
      new Request("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "person@example.com" }),
      }),
    );
    expect(await response.json()).toEqual({
      message: "Unable to send the reset link right now. Please try again.",
    });
  });
});
