import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockJar = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => mockJar) }));

import { POST } from "./route";

describe("POST /api/auth/sign-up", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockJar.get.mockClear();
    mockJar.set.mockClear();
    mockJar.delete.mockClear();
    process.env.SUPABASE_BASE_URL = "https://mock-supabase.test";
    process.env.SUPABASE_API_KEY = "mock-supabase-api-key";
  });

  const validBody = {
    name: "Jane Doe",
    email: "jane@example.com",
    jobTitle: "Engineer",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  it("uses the exact server-only endpoint, headers, payload, and safe success response", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ access_token: "secret", refresh_token: "secret" }),
          { status: 200 },
        ),
      );
    const response = await POST(
      new Request("http://localhost/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://mock-supabase.test/auth/v1/signup",
      {
        method: "POST",
        headers: {
          apikey: "mock-supabase-api-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: validBody.email,
          password: validBody.password,
          data: { name: validBody.name, job_title: validBody.jobTitle },
        }),
        cache: "no-store",
      },
    );
    expect(mockJar.set).not.toHaveBeenCalled();
    expect(mockJar.delete).not.toHaveBeenCalled();
  });

  it("does not call Supabase for invalid input", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const response = await POST(
      new Request("http://localhost/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify({
          ...validBody,
          password: "weak",
          confirmPassword: "weak",
        }),
      }),
    );
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("omits an empty optional job title and normalizes backend failures", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ details: "private" }), { status: 500 }),
      );
    const response = await POST(
      new Request("http://localhost/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify({ ...validBody, jobTitle: "" }),
      }),
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      message: "Unable to create your account. Please try again.",
    });
    expect(fetchSpy.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({
        email: validBody.email,
        password: validBody.password,
        data: { name: validBody.name },
      }),
    );
    expect(mockJar.set).not.toHaveBeenCalled();
  });
});
