import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import Home from "./page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

describe("Home", () => {
  it("renders the scaffold health page", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Taskly" }),
    ).toBeInTheDocument();
  });
});
