import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders accessible labels, inputs, and controls", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("id", "login-email");
    expect(emailInput).toHaveAttribute("aria-required", "true");
    expect(emailInput).toHaveAttribute("placeholder", "curator@workspace.com");

    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("id", "login-password");
    expect(passwordInput).toHaveAttribute("aria-required", "true");
    expect(passwordInput).toHaveAttribute("placeholder", "Enter your password");

    const rememberMeCheckbox = screen.getByRole("checkbox", {
      name: /remember me/i,
    });
    expect(rememberMeCheckbox).toBeInTheDocument();
    expect(rememberMeCheckbox).not.toBeChecked();

    const submitButton = screen.getByRole("button", {
      name: /sign in|log in/i,
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    const togglePasswordBtn = screen.getByRole("button", {
      name: /show password/i,
    });
    expect(togglePasswordBtn).toBeInTheDocument();
    expect(togglePasswordBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders validation errors when submitting empty fields", async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", {
      name: /sign in|log in/i,
    });
    fireEvent.click(submitButton);

    const emailError = await screen.findByText("Enter a valid email address.");
    const passwordError = await screen.findByText("Enter your password.");

    expect(emailError).toBeInTheDocument();
    expect(emailError).toHaveAttribute("role", "alert");
    expect(passwordError).toBeInTheDocument();
    expect(passwordError).toHaveAttribute("role", "alert");

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", "login-email-error");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-describedby", "login-password-error");
  });

  it("renders validation error for invalid email format", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole("button", {
      name: /sign in|log in/i,
    });

    fireEvent.change(emailInput, { target: { value: "invalid-email-address" } });
    fireEvent.change(passwordInput, { target: { value: "validpassword123" } });
    fireEvent.click(submitButton);

    const emailError = await screen.findByText("Enter a valid email address.");
    expect(emailError).toBeInTheDocument();
    expect(screen.queryByText("Enter your password.")).not.toBeInTheDocument();
  });

  it("toggles password visibility between password and text type", () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleBtn = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(toggleBtn).toHaveAttribute("aria-label", "Hide password");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleBtn).toHaveAttribute("aria-label", "Show password");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("displays loading and disabled states while submitting", async () => {
    let resolvePromise!: (res: Response) => void;
    const pendingPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(globalThis, "fetch").mockImplementation(() => pendingPromise);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const rememberMe = screen.getByRole("checkbox", { name: /remember me/i });
    const submitButton = screen.getByRole("button", {
      name: /sign in|log in/i,
    });

    fireEvent.change(emailInput, { target: { value: "curator@workspace.com" } });
    fireEvent.change(passwordInput, { target: { value: "validpassword123" } });
    fireEvent.click(rememberMe);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(rememberMe).toBeDisabled();

    // Resolve the promise
    resolvePromise(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Signed in successfully.")).toBeInTheDocument();
    });
  });

  it("renders safe server error when the server returns an error message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Invalid email or password." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "curator@workspace.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent("Invalid email or password.");
  });

  it("renders fallback error when server response is not JSON or lacks message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Internal Server Error", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "curator@workspace.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent(
      "Unable to authenticate. Check your details and try again.",
    );
  });

  it("renders fallback error on network rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network connection lost"),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "curator@workspace.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent(
      "Unable to authenticate. Check your details and try again.",
    );
  });

  it("renders 'Signed in successfully.' and never exposes tokens or sensitive payload fields", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          access_token: "sensitive-jwt-access-token-example",
          refresh_token: "sensitive-refresh-token-example",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "curator@workspace.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "securepassword123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /remember me/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

    const statusMessage = await screen.findByRole("status");
    expect(statusMessage).toHaveTextContent("Signed in successfully.");

    // Verify request payload
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "curator@workspace.com",
        password: "securepassword123",
        rememberMe: true,
      }),
    });

    // Verify that neither tokens nor sensitive keys appear anywhere in the rendered DOM
    expect(document.body.textContent).not.toContain("sensitive-jwt-access-token-example");
    expect(document.body.textContent).not.toContain("sensitive-refresh-token-example");
    expect(document.body.textContent).not.toContain("access_token");
    expect(document.body.textContent).not.toContain("refresh_token");
  });
});
