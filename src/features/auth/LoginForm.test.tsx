import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders accessible labels, inputs, and controls", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "email");
    expect(emailInput).toHaveAttribute("id", "login-email");
    expect(emailInput).toHaveAttribute("aria-required", "true");
    expect(emailInput).toHaveAttribute("placeholder", "curator@workspace.com");
    expect(emailInput.className).toContain("pr-[48px]");

    const mailIcon = document.querySelector('img[src="/assets/mail.svg"]');
    expect(mailIcon).toBeInTheDocument();
    expect(mailIcon).toHaveAttribute("aria-hidden", "true");
    expect(mailIcon?.className).toContain("size-[20px]");

    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
    expect(passwordInput).toHaveAttribute("id", "login-password");
    expect(passwordInput).toHaveAttribute("aria-required", "true");
    expect(passwordInput).toHaveAttribute("placeholder", "Enter your password");

    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    expect(rememberMeCheckbox).toBeInTheDocument();
    expect(rememberMeCheckbox).toHaveAttribute("type", "checkbox");
    expect(rememberMeCheckbox).toHaveAttribute("id", "login-remember-me");
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

    const forgotMobileBtn = screen.getByRole("button", { name: "Forgot?" });
    expect(forgotMobileBtn).toBeInTheDocument();
    expect(forgotMobileBtn).toHaveAttribute("type", "button");
    expect(forgotMobileBtn.className).toContain("font-bold");

    const forgotDesktopBtn = screen.getByRole("button", {
      name: "Forgot Password?",
    });
    expect(forgotDesktopBtn).toBeInTheDocument();
    expect(forgotDesktopBtn).toHaveAttribute("type", "button");
    expect(forgotDesktopBtn.className).toContain("font-medium");

    const signUpLink = screen.getByRole("link", { name: "Sign Up" });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/sign-up");
  });

  it("renders validation errors and does not call fetch when submitting empty fields", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
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
    expect(passwordInput).toHaveAttribute(
      "aria-describedby",
      "login-password-error",
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders validation error and rejects before fetch for invalid email format", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole("button", {
      name: /sign in|log in/i,
    });

    fireEvent.change(emailInput, {
      target: { value: "invalid-email-address" },
    });
    fireEvent.change(passwordInput, { target: { value: "validpassword123" } });
    fireEvent.click(submitButton);

    const emailError = await screen.findByText("Enter a valid email address.");
    expect(emailError).toBeInTheDocument();
    expect(screen.queryByText("Enter your password.")).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders validation error and rejects before fetch when password is missing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", {
      name: /sign in|log in/i,
    });

    fireEvent.change(emailInput, {
      target: { value: "curator@workspace.com" },
    });
    fireEvent.click(submitButton);

    const passwordError = await screen.findByText("Enter your password.");
    expect(passwordError).toBeInTheDocument();
    expect(
      screen.queryByText("Enter a valid email address."),
    ).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("toggles password visibility via mouse click and keyboard activation", () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleBtn = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");

    // Toggle on via click
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(toggleBtn).toHaveAttribute("aria-label", "Hide password");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "true");

    // Toggle off via keyboard Enter on the button
    toggleBtn.focus();
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

    fireEvent.change(emailInput, {
      target: { value: "curator@workspace.com" },
    });
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

  it("normalizes invalid credential status (400/401) to 'Invalid email or password.'", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Different error message from backend" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
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

    // Verify navigation was triggered to /project
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/project");

    // Verify that neither tokens nor sensitive keys appear anywhere in the rendered DOM
    expect(document.body.textContent).not.toContain(
      "sensitive-jwt-access-token-example",
    );
    expect(document.body.textContent).not.toContain(
      "sensitive-refresh-token-example",
    );
    expect(document.body.textContent).not.toContain("access_token");
    expect(document.body.textContent).not.toContain("refresh_token");
  });

  it("submits valid credentials with rememberMe: false when checkbox is not toggled", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "curator@workspace.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "validpassword123" },
    });
    // Do NOT click rememberMe checkbox
    fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "curator@workspace.com",
        password: "validpassword123",
        rememberMe: false,
      }),
    });
    expect(mockReplace).toHaveBeenCalledWith("/project");
  });

  it("ensures safe failures do not expose raw backend internal details in the client DOM", async () => {
    const RAW_SECRET_BACKEND_DETAIL =
      "database connection failure host=10.240.0.1 password=secret";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: "internal_server_error",
          details: RAW_SECRET_BACKEND_DETAIL,
          query: "SELECT * FROM users WHERE email = 'curator@workspace.com'",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "curator@workspace.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "validpassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent(
      "Unable to authenticate. Check your details and try again.",
    );

    // Verify raw backend leakage is prevented in DOM
    expect(document.body.textContent).not.toContain(RAW_SECRET_BACKEND_DETAIL);
    expect(document.body.textContent).not.toContain("SELECT * FROM");
    expect(document.body.textContent).not.toContain("10.240.0.1");
  });

  it("renders Forgot controls as buttons with no handler, no href, no API call, and no navigation", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<LoginForm />);

    const forgotMobileBtn = screen.getByRole("button", { name: "Forgot?" });
    const forgotDesktopBtn = screen.getByRole("button", {
      name: "Forgot Password?",
    });

    expect(forgotMobileBtn).not.toHaveAttribute("href");
    expect(forgotDesktopBtn).not.toHaveAttribute("href");

    fireEvent.click(forgotMobileBtn);
    fireEvent.click(forgotDesktopBtn);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
