import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecoveryFragmentBootstrap } from "./RecoveryFragmentBootstrap";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

describe("RecoveryFragmentBootstrap", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    replace.mockClear();
    window.history.replaceState(null, "", "/reset-password");
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "taskly_access_token=; Max-Age=0";
  });
  afterEach(cleanup);

  it("captures only a recovery fragment at the same-origin boundary and scrubs it", async () => {
    window.history.replaceState(
      null,
      "",
      "/reset-password#access_token=recovery-token&type=recovery",
    );
    const historySpy = vi.spyOn(window.history, "replaceState");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );
    render(<RecoveryFragmentBootstrap invalidWhenMissing />);
    await act(async () => {});
    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/recovery-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "recovery", accessToken: "recovery-token" }),
    });
    expect(historySpy).toHaveBeenCalledWith(null, "", "/reset-password");
    expect(window.location.search).toBe("");
    expect(window.location.hash).toBe("");
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.body.textContent).not.toContain("recovery-token");
    expect(replace).toHaveBeenCalledWith("/reset-password");
    expect(replace).not.toHaveBeenCalledWith("/project");
  });

  it("gives recovery precedence over an existing normal browser session", async () => {
    document.cookie = "taskly_access_token=normal-session";
    window.history.replaceState(
      null,
      "",
      "/#access_token=recovery-token&type=recovery",
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    render(<RecoveryFragmentBootstrap />);
    await act(async () => {});
    expect(replace).toHaveBeenCalledWith("/reset-password");
    expect(replace).not.toHaveBeenCalledWith("/project");
    expect(document.cookie).toContain("taskly_access_token=normal-session");
  });

  it.each(["#access_token=token&type=signup", "#type=recovery"])(
    "rejects invalid fragment %s without calling capture",
    async (hash) => {
      window.history.replaceState(null, "", `/reset-password${hash}`);
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      render(<RecoveryFragmentBootstrap invalidWhenMissing />);
      await act(async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 0));
      });
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid or expired reset link.",
      );
    },
  );

  it.each(["#access_token=token&type=signup", "#type=recovery"])(
    "redirects malformed root recovery fragments to reset rather than project: %s",
    async (hash) => {
      window.history.replaceState(null, "", `/${hash}`);
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      render(<RecoveryFragmentBootstrap />);
      await act(async () => {});
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(window.location.hash).toBe("");
      expect(replace).toHaveBeenCalledWith("/reset-password");
      expect(replace).not.toHaveBeenCalledWith("/project");
    },
  );

  it("does not alter normal root navigation when no fragment exists", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<RecoveryFragmentBootstrap />);
    await act(async () => {});
    expect(replace).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows the safe invalid state when same-origin capture fails", async () => {
    window.history.replaceState(
      null,
      "",
      "/reset-password#access_token=token&type=recovery",
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("raw backend token detail", { status: 401 }),
    );
    render(<RecoveryFragmentBootstrap invalidWhenMissing />);
    await act(async () => {});
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid or expired reset link.",
    );
    expect(document.body.textContent).not.toContain("raw backend token detail");
  });
});
