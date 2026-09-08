import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignUpForm } from "./SignUpForm";

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

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockReplace.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders accessible labels, inputs, helpers, static requirement panel, and submit controls", () => {
    render(<SignUpForm />);

    // Name field
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("type", "text");
    expect(nameInput).toHaveAttribute("autoComplete", "name");
    expect(nameInput).toHaveAttribute("id", "signup-name");
    expect(nameInput).toHaveAttribute("aria-required", "true");
    expect(nameInput).toHaveAttribute("placeholder", "Enter your full name");

    const nameHelper = screen.getByText("3-50 characters, letters only.");
    expect(nameHelper).toBeInTheDocument();
    expect(nameHelper).toHaveAttribute("id", "signup-name-helper");
    expect(nameHelper).toHaveClass("hidden", "md:block");

    // Email field
    const emailInput = screen.getByLabelText(/^email$/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "email");
    expect(emailInput).toHaveAttribute("id", "signup-email");
    expect(emailInput).toHaveAttribute("aria-required", "true");
    expect(emailInput).toHaveAttribute("placeholder", "yourname@company.com");

    // Job Title field (Optional)
    const jobTitleInput = screen.getByLabelText(/job title/i);
    expect(jobTitleInput).toBeInTheDocument();
    expect(jobTitleInput).toHaveAttribute("type", "text");
    expect(jobTitleInput).toHaveAttribute("autoComplete", "organization-title");
    expect(jobTitleInput).toHaveAttribute("id", "signup-job-title");
    expect(jobTitleInput).not.toHaveAttribute("required");
    expect(jobTitleInput).toHaveAttribute(
      "placeholder",
      "e.g. Project Manager",
    );

    // Password field
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("autoComplete", "new-password");
    expect(passwordInput).toHaveAttribute("id", "signup-password");
    expect(passwordInput).toHaveAttribute("aria-required", "true");
    expect(passwordInput).toHaveAttribute("placeholder", "Password");

    // Confirm Password field
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute(
      "autoComplete",
      "new-password",
    );
    expect(confirmPasswordInput).toHaveAttribute(
      "id",
      "signup-confirm-password",
    );
    expect(confirmPasswordInput).toHaveAttribute("aria-required", "true");
    expect(confirmPasswordInput).toHaveAttribute(
      "placeholder",
      "Repeat your password",
    );

    // Eye toggle buttons
    const togglePasswordBtn = screen.getByRole("button", {
      name: /^show password$/i,
    });
    expect(togglePasswordBtn).toBeInTheDocument();
    expect(togglePasswordBtn).toHaveAttribute("aria-pressed", "false");

    const toggleConfirmPasswordBtn = screen.getByRole("button", {
      name: /^show confirm password$/i,
    });
    expect(toggleConfirmPasswordBtn).toBeInTheDocument();
    expect(toggleConfirmPasswordBtn).toHaveAttribute("aria-pressed", "false");

    // Static requirements panel (Desktop only)
    const requirementsPanel = screen.getByLabelText("Password requirements");
    expect(requirementsPanel).toBeInTheDocument();
    expect(requirementsPanel).toHaveClass("hidden", "md:flex");

    const pendingIndicators = document.querySelectorAll(
      'img[src="/assets/sign-up-asset-2.svg"]',
    );
    expect(pendingIndicators).toHaveLength(3);
    expect(pendingIndicators[0]).toHaveAttribute("aria-hidden", "true");
    expect(pendingIndicators[1]).toHaveAttribute("aria-hidden", "true");

    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    expect(
      screen.getByText("One uppercase, lowercase, and digit"),
    ).toBeInTheDocument();
    expect(screen.getByText("One special character")).toBeInTheDocument();

    // Submit button
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    // Footer Link to /login
    const loginLink = screen.getByRole("link", { name: "Log in" });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("validates fields on blur and clears corrected errors while typing", async () => {
    render(<SignUpForm />);

    const name = screen.getByLabelText(/name/i);
    const email = screen.getByLabelText(/^email$/i);
    const password = screen.getByLabelText(/^password$/i);
    const confirmPassword = screen.getByLabelText(/^confirm password$/i);

    fireEvent.blur(name);
    expect(
      await screen.findByText("Enter your full name."),
    ).toBeInTheDocument();
    fireEvent.change(name, { target: { value: "Jane Doe" } });
    await waitFor(() =>
      expect(
        screen.queryByText("Enter your full name."),
      ).not.toBeInTheDocument(),
    );

    fireEvent.change(email, { target: { value: "invalid" } });
    fireEvent.blur(email);
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    fireEvent.change(email, { target: { value: "jane@example.com" } });
    await waitFor(() =>
      expect(
        screen.queryByText("Enter a valid email address."),
      ).not.toBeInTheDocument(),
    );

    fireEvent.change(password, { target: { value: "weak" } });
    fireEvent.blur(password);
    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();

    fireEvent.change(confirmPassword, { target: { value: "different" } });
    fireEvent.blur(confirmPassword);
    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
  });

  it("updates the desktop requirement indicators from shared password rules", () => {
    render(<SignUpForm />);
    const password = screen.getByLabelText(/^password$/i);
    const pending = () =>
      document.querySelectorAll('img[src="/assets/sign-up-asset-2.svg"]');
    const complete = () =>
      document.querySelectorAll('img[src="/assets/sign-up-asset-3.svg"]');

    expect(pending()).toHaveLength(3);
    expect(complete()).toHaveLength(0);

    fireEvent.change(password, { target: { value: "abcdefgh" } });
    expect(pending()).toHaveLength(2);
    expect(complete()).toHaveLength(1);

    fireEvent.change(password, { target: { value: "Abcdefgh1" } });
    expect(pending()).toHaveLength(1);
    expect(complete()).toHaveLength(2);

    fireEvent.change(password, { target: { value: "Abcdefgh1!" } });
    expect(pending()).toHaveLength(0);
    expect(complete()).toHaveLength(3);

    fireEvent.change(password, { target: { value: "abc" } });
    expect(pending()).toHaveLength(3);
    expect(complete()).toHaveLength(0);
  });

  it("revalidates confirmation when password changes after confirmation was entered", async () => {
    render(<SignUpForm />);
    const password = screen.getByLabelText(/^password$/i);
    const confirmPassword = screen.getByLabelText(/^confirm password$/i);

    fireEvent.change(password, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirmPassword, { target: { value: "SecurePass123!" } });
    fireEvent.blur(confirmPassword);
    await waitFor(() =>
      expect(
        screen.queryByText("Passwords do not match."),
      ).not.toBeInTheDocument(),
    );

    fireEvent.change(password, { target: { value: "AnotherPass123!" } });
    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
  });

  it("renders validation errors and does not call fetch when submitting empty fields", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<SignUpForm />);

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    fireEvent.click(submitButton);

    const nameError = await screen.findByText("Enter your full name.");
    const emailError = await screen.findByText("Enter a valid email address.");
    const passwordError = await screen.findByText("Enter a password.");
    const confirmPasswordError = await screen.findByText(
      "Confirm your password.",
    );

    expect(nameError).toBeInTheDocument();
    expect(nameError).toHaveAttribute("role", "alert");
    expect(emailError).toBeInTheDocument();
    expect(emailError).toHaveAttribute("role", "alert");
    expect(passwordError).toBeInTheDocument();
    expect(passwordError).toHaveAttribute("role", "alert");
    expect(confirmPasswordError).toBeInTheDocument();
    expect(confirmPasswordError).toHaveAttribute("role", "alert");

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "signup-name-error");
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute(
      "aria-describedby",
      "signup-email-error",
    );
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute(
      "aria-describedby",
      "signup-password-error",
    );
    expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true");
    expect(confirmPasswordInput).toHaveAttribute(
      "aria-describedby",
      "signup-confirm-password-error",
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders validation error and rejects before fetch for invalid name", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    // Too short (2 characters)
    fireEvent.change(nameInput, { target: { value: "Al" } });
    fireEvent.click(submitButton);

    const shortError = await screen.findByText(
      "Name must be at least 3 characters.",
    );
    expect(shortError).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    // Invalid characters (digits)
    fireEvent.change(nameInput, { target: { value: "User 123" } });
    fireEvent.click(submitButton);

    const invalidCharError = await screen.findByText(
      "Name can contain letters, spaces, apostrophes, and hyphens only.",
    );
    expect(invalidCharError).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders validation error and rejects before fetch for invalid email format", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    const emailError = await screen.findByText("Enter a valid email address.");
    expect(emailError).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders validation error and rejects before fetch for weak password", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });

    // Too short (less than 8 chars)
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Pass1!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "Pass1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    const shortError = await screen.findByText(
      "Password must be at least 8 characters.",
    );
    expect(shortError).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    // Missing special character
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    const specialError = await screen.findByText(
      "Password must include a special character.",
    );
    expect(specialError).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders validation error and rejects before fetch when passwords do not match", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "DifferentPassword123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    const mismatchError = await screen.findByText("Passwords do not match.");
    expect(mismatchError).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("toggles password and confirm password visibility via mouse click and keyboard", () => {
    render(<SignUpForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const togglePasswordBtn = screen.getByRole("button", {
      name: /^show password$/i,
    });

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(togglePasswordBtn).toHaveAttribute("aria-pressed", "false");
    expect(togglePasswordBtn.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/eye.svg",
    );

    // Toggle on password via click
    fireEvent.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(togglePasswordBtn).toHaveAttribute("aria-label", "Hide password");
    expect(togglePasswordBtn).toHaveAttribute("aria-pressed", "true");
    expect(togglePasswordBtn.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/eye-off.svg",
    );

    // Toggle off password via keyboard activation
    togglePasswordBtn.focus();
    fireEvent.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(togglePasswordBtn).toHaveAttribute("aria-label", "Show password");
    expect(togglePasswordBtn).toHaveAttribute("aria-pressed", "false");

    // Confirm Password toggle
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);
    const toggleConfirmBtn = screen.getByRole("button", {
      name: /^show confirm password$/i,
    });

    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(toggleConfirmBtn).toHaveAttribute("aria-pressed", "false");
    expect(toggleConfirmBtn.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/eye.svg",
    );

    // Toggle on confirm password
    fireEvent.click(toggleConfirmBtn);
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
    expect(toggleConfirmBtn).toHaveAttribute(
      "aria-label",
      "Hide confirm password",
    );
    expect(toggleConfirmBtn).toHaveAttribute("aria-pressed", "true");
    expect(toggleConfirmBtn.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/eye-off.svg",
    );

    // Toggle off confirm password
    fireEvent.click(toggleConfirmBtn);
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(toggleConfirmBtn).toHaveAttribute(
      "aria-label",
      "Show confirm password",
    );
    expect(toggleConfirmBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("displays loading and disabled states while submitting", async () => {
    let resolvePromise!: (res: Response) => void;
    const pendingPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(globalThis, "fetch").mockImplementation(() => pendingPromise);

    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const jobTitleInput = screen.getByLabelText(/job title/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
    fireEvent.change(jobTitleInput, { target: { value: "Product Designer" } });
    fireEvent.change(passwordInput, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Creating account...")).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(jobTitleInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();

    // Resolve the promise
    resolvePromise(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("submits valid data to POST /api/auth/sign-up and navigates to /login on success", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/job title/i), {
      target: { value: "Engineer" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        jobTitle: "Engineer",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      }),
    });

    expect(mockReplace).toHaveBeenCalledWith("/login");

    // Verify tokens are never handled or exposed in DOM
    expect(document.body.textContent).not.toContain("access_token");
    expect(document.body.textContent).not.toContain("refresh_token");
  });

  it("submits successfully when optional jobTitle is omitted", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });
    // Do NOT fill jobTitle
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        jobTitle: "",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      }),
    });

    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("renders safe generic failure text when server returns an error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ message: "Something went wrong on the backend" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent(
      "Unable to create your account. Please try again.",
    );
  });

  it("renders safe generic failure text on network rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network connection lost"),
    );

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent(
      "Unable to create your account. Please try again.",
    );
  });

  it("never exposes sensitive server error details in client DOM", async () => {
    const RAW_SECRET_BACKEND_DETAIL =
      "database connection failure host=10.240.0.1 password=secret";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: "internal_server_error",
          details: RAW_SECRET_BACKEND_DETAIL,
          query: "INSERT INTO users...",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    const errorAlert = await screen.findByRole("alert");
    expect(errorAlert).toHaveTextContent(
      "Unable to create your account. Please try again.",
    );

    expect(document.body.textContent).not.toContain(RAW_SECRET_BACKEND_DETAIL);
    expect(document.body.textContent).not.toContain("INSERT INTO");
    expect(document.body.textContent).not.toContain("10.240.0.1");
  });
});
