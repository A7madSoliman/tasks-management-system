import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RootRouteBootstrap } from "./RootRouteBootstrap";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("./RecoveryFragmentBootstrap", () => ({
  RecoveryFragmentBootstrap: () => <div data-testid="recovery-bootstrap" />,
}));

describe("RootRouteBootstrap", () => {
  beforeEach(() => {
    replace.mockReset();
    window.history.replaceState(null, "", "/");
  });

  it("routes authenticated root visits to project", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    render(<RootRouteBootstrap />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/project"));
  });

  it("routes unauthenticated root visits to login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<RootRouteBootstrap />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("keeps recovery fragments in the client bootstrap path", () => {
    window.history.replaceState(null, "", "/#type=recovery&access_token=test");
    render(<RootRouteBootstrap />);
    expect(
      document.querySelector("[data-testid='recovery-bootstrap']"),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
