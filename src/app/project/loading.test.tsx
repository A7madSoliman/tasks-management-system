import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectLoading from "./loading";

describe("ProjectLoading (T016)", () => {
  it("renders only approved surface/background, subtle border, and shadow without skeleton or spinner", () => {
    const { container } = render(<ProjectLoading />);

    const loadingElement = screen.getByRole("status", {
      name: "Loading workspace",
    });
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute("data-testid", "project-loading");

    // No spinner or progress elements
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();

    // No skeleton elements or fake data
    expect(
      screen.queryByText(/loading/i, { selector: ":not([aria-label])" }),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll("svg").length).toBe(0);

    // Verified surface tokens
    expect(loadingElement).toHaveClass("bg-[#f9f9ff]");
    const surfaceChild = container.querySelector(".bg-\\[\\#f1f3ff\\]");
    expect(surfaceChild).toBeInTheDocument();
    expect(surfaceChild).toHaveClass("border");
    expect(surfaceChild).toHaveClass("shadow-[0px_1px_1px_rgba(0,0,0,0.05)]");
  });
});
