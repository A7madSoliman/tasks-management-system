import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import Home from "./page";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

describe("Home", () => {
  it("renders only the neutral root bootstrap surface", () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<Home />);

    expect(
      screen.queryByText("Application scaffold is ready."),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("main", { name: "Loading" })).toBeInTheDocument();
    return waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });
});
