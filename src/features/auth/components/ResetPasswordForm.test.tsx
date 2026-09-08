import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ResetPasswordForm,
  SUCCESS_REDIRECT_DELAY_MS,
} from "./ResetPasswordForm";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    replace.mockClear();
  });
  afterEach(cleanup);

  it("uses blur-first validation and blocks invalid submission", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ResetPasswordForm />);
    const password = screen.getByLabelText("New Password");
    const confirm = screen.getByLabelText("Confirm Password");
    fireEvent.change(password, { target: { value: "weak" } });
    fireEvent.blur(password);
    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    fireEvent.change(confirm, { target: { value: "other" } });
    fireEvent.blur(confirm);
    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("revalidates confirmation when the new password changes", async () => {
    render(<ResetPasswordForm />);
    const password = screen.getByLabelText("New Password");
    const confirm = screen.getByLabelText("Confirm Password");
    fireEvent.change(password, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirm, { target: { value: "SecurePass123!" } });
    fireEvent.blur(confirm);
    fireEvent.change(password, { target: { value: "AnotherPass123!" } });
    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
  });

  it("keeps mobile form labels and security requirements left aligned", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText("New Password")).toHaveClass("text-left");
    expect(screen.getByText("Confirm Password")).toHaveClass("text-left");
    expect(screen.getByText("Security Requirements")).toHaveClass("text-left");
    expect(screen.getByLabelText("Password requirements")).toHaveClass(
      "text-left",
    );
  });

  it("switches both password inputs and their Figma visibility icons", () => {
    render(<ResetPasswordForm />);

    const password = screen.getByLabelText("New Password");
    const passwordToggle = screen.getByRole("button", {
      name: "Show password",
    });
    const confirm = screen.getByLabelText("Confirm Password");
    const confirmToggle = screen.getByRole("button", {
      name: "Show confirm password",
    });

    expect(password).toHaveAttribute("type", "password");
    expect(passwordToggle).toHaveAttribute("aria-pressed", "false");
    expect(passwordToggle.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/eye.svg",
    );
    fireEvent.click(passwordToggle);
    expect(password).toHaveAttribute("type", "text");
    expect(passwordToggle).toHaveAttribute("aria-pressed", "true");
    expect(passwordToggle.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/eye-off.svg",
    );

    expect(confirm).toHaveAttribute("type", "password");
    expect(confirmToggle).toHaveAttribute("aria-pressed", "false");
    expect(confirmToggle.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/eye.svg",
    );
    fireEvent.click(confirmToggle);
    expect(confirm).toHaveAttribute("type", "text");
    expect(confirmToggle).toHaveAttribute("aria-pressed", "true");
    expect(confirmToggle.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/eye-off.svg",
    );
  });

  it("derives every live indicator from shared requirements and reverts them", () => {
    render(<ResetPasswordForm />);
    const password = screen.getByLabelText("New Password");
    expect(
      document.querySelectorAll('img[alt="Not yet complete"]'),
    ).toHaveLength(6);
    fireEvent.change(password, { target: { value: "abcdefgh" } });
    expect(document.querySelectorAll('img[alt="Complete"]')).toHaveLength(2);
    fireEvent.change(password, { target: { value: "Abcdefgh" } });
    expect(document.querySelectorAll('img[alt="Complete"]')).toHaveLength(4);
    fireEvent.change(password, { target: { value: "Abcdefgh1" } });
    expect(document.querySelectorAll('img[alt="Complete"]')).toHaveLength(5);
    fireEvent.change(password, { target: { value: "Abcdefgh1!" } });
    expect(document.querySelectorAll('img[alt="Complete"]')).toHaveLength(6);
    fireEvent.change(password, { target: { value: "abc" } });
    expect(
      document.querySelectorAll('img[alt="Not yet complete"]'),
    ).toHaveLength(5);
  });

  it("shows exact success copy and redirects after the centralized three-second delay", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));
    await act(async () => {});
    expect(
      screen.getByText(
        "Your password has been updated successfully. You can now log in",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("reset-success")).toHaveClass(
      "bg-[rgba(130,249,190,0.2)]",
    );
    expect(screen.getByTestId("reset-success")).toHaveTextContent(
      "Your password has been updated successfully. You can now log in",
    );
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SUCCESS_REDIRECT_DELAY_MS);
    });
    expect(replace).toHaveBeenCalledWith("/login");
    vi.useRealTimers();
  });
});
