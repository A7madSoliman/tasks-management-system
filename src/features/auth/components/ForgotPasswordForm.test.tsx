import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm, MAX_RESEND_ATTEMPTS } from "./ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function renderForm() {
    render(<ForgotPasswordForm />);
    return screen.getByLabelText("Email Address");
  }

  it("renders an accessible email input and login link", () => {
    const email = renderForm();
    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(
      screen.getByRole("link", { name: /back to log in/i }),
    ).toHaveAttribute("href", "/login");
  });

  it("validates on blur and revalidates when corrected without submitting", async () => {
    const email = renderForm();
    fireEvent.blur(email);
    expect(
      await screen.findByText("Enter your email address."),
    ).toBeInTheDocument();
    fireEvent.change(email, { target: { value: "valid@example.com" } });
    await waitFor(() =>
      expect(
        screen.queryByText("Enter your email address."),
      ).not.toBeInTheDocument(),
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("prevents malformed email submission", async () => {
    const email = renderForm();
    fireEvent.change(email, { target: { value: "not-an-email" } });
    fireEvent.submit(email.closest("form")!);
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("disables duplicate initial submission while loading", async () => {
    let resolveRequest: ((value: Response) => void) | undefined;
    vi.mocked(globalThis.fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const email = renderForm();
    fireEvent.change(email, { target: { value: "valid@example.com" } });
    fireEvent.submit(email.closest("form")!);
    expect(
      await screen.findByRole("button", { name: "Sending reset link…" }),
    ).toBeDisabled();
    fireEvent.submit(email.closest("form")!);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    resolveRequest?.(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
  });

  async function sendSuccessfully() {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    const email = renderForm();
    fireEvent.change(email, { target: { value: "valid@example.com" } });
    await act(async () => {
      fireEvent.submit(email.closest("form")!);
    });
    expect(
      screen.getAllByText(
        "If an account exists with this email, we’ve sent a password reset link.",
      ),
    ).toHaveLength(2);
  }

  it("shows the exact safe message and starts a disabled 05:00 cooldown", async () => {
    await sendSuccessfully();
    const buttons = screen.getAllByRole("button", { name: /resend in 05:00/i });
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toBeDisabled();
    expect(
      document.querySelector(
        'img[src="/assets/forgot-password-desktop-success.svg"]',
      ),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        'img[src="/assets/forgot-password-desktop-timer.svg"]',
      ),
    ).toBeInTheDocument();
  });

  it("enables resend at expiry and restarts the cooldown after an accepted resend", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T00:00:00Z"));
    await sendSuccessfully();
    await act(async () => {
      vi.advanceTimersByTime(300_000);
    });
    const resend = screen.getAllByRole("button", { name: "Resend" })[0]!;
    expect(resend).toBeEnabled();
    await act(async () => {
      fireEvent.click(resend);
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(
      screen.getAllByRole("button", { name: /resend in 05:00/i })[0],
    ).toBeDisabled();
  });

  it("allows exactly three accepted resends and blocks a fourth", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T00:00:00Z"));
    await sendSuccessfully();
    for (let attempt = 0; attempt < MAX_RESEND_ATTEMPTS; attempt += 1) {
      await act(async () => {
        vi.advanceTimersByTime(300_000);
      });
      await act(async () => {
        fireEvent.click(screen.getAllByRole("button", { name: "Resend" })[0]!);
      });
      expect(globalThis.fetch).toHaveBeenCalledTimes(attempt + 2);
    }
    expect(
      screen.getAllByText("The resend limit has been reached."),
    ).toHaveLength(2);
    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it("does not consume a resend attempt or restart cooldown when a resend fails", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T00:00:00Z"));
    await sendSuccessfully();
    await act(async () => {
      vi.advanceTimersByTime(300_000);
    });
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response("failure", { status: 503 }),
    );
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "Resend" })[0]!);
    });
    expect(
      screen.getAllByText(
        "Unable to send the reset link right now. Please try again.",
      ),
    ).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Resend" })[0]).toBeEnabled();
  });
});
