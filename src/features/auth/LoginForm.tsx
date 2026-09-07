/* eslint-disable @next/next/no-img-element -- Temporary Figma SVG asset references isolated for Codex SVGR integration */
"use client";

import { useState } from "react";
import { useForm, type Resolver, type FieldErrors } from "react-hook-form";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import { AUTH_ASSETS } from "@/features/auth/assets";

/**
 * Custom resolver using shared Zod loginSchema without requiring external resolver dependencies.
 */
const zodLoginResolver: Resolver<LoginInput> = (values) => {
  const result = loginSchema.safeParse(values);
  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const errors: FieldErrors<LoginInput> = {};
  for (const issue of result.error.issues) {
    const fieldName = issue.path[0];
    if (
      fieldName === "email" ||
      fieldName === "password" ||
      fieldName === "rememberMe"
    ) {
      if (!errors[fieldName]) {
        errors[fieldName] = {
          type: issue.code,
          message: issue.message,
        };
      }
    }
  }

  return {
    values: {},
    errors,
  };
};

/**
 * Isolated post-login navigation handler for Codex review.
 * No redirect is performed here because no authoritative post-login destination exists yet in the application.
 * Codex can hook into router navigation here when the post-auth routing is approved.
 */
function handlePostLoginNavigation(): void {
  // Post-login destination is intentionally unassigned per specification.
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodLoginResolver,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginInput) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe: Boolean(data.rememberMe),
        }),
      });

      if (response.ok) {
        const payload: unknown = await response.json();
        if (
          typeof payload === "object" &&
          payload !== null &&
          "success" in payload &&
          (payload as { success: unknown }).success === true
        ) {
          setSuccessMessage("Signed in successfully.");
          handlePostLoginNavigation();
          return;
        }
      }

      let errorMessage =
        "Unable to authenticate. Check your details and try again.";
      try {
        const payload: unknown = await response.json();
        if (
          typeof payload === "object" &&
          payload !== null &&
          "message" in payload &&
          typeof (payload as { message: unknown }).message === "string"
        ) {
          errorMessage = (payload as { message: string }).message;
        }
      } catch {
        // Fallback to generic errorMessage
      }

      setFormError(errorMessage);
    } catch {
      setFormError("Unable to authenticate. Check your details and try again.");
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-[24px]"
      >
        {/* Form-level Feedback */}
        {formError && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-[4px] border border-[#ba1a1a]/30 bg-[#ba1a1a]/10 p-[12px] text-[13px] leading-[18px] text-[#ba1a1a]"
          >
            {formError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[4px] border border-[#0052cc]/30 bg-[#82f9be]/25 p-[12px] text-[13px] font-medium leading-[18px] text-[#041b3c]"
          >
            {successMessage}
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col gap-[8px]">
          <label
            htmlFor="login-email"
            className="text-[11px] font-bold uppercase tracking-[0.55px] text-[#434654] leading-[16.5px]"
          >
            <span className="md:hidden">Email Address</span>
            <span className="hidden md:inline">Email</span>
          </label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              disabled={isSubmitting}
              placeholder="curator@workspace.com"
              {...register("email")}
              className={`h-[56px] w-full rounded-[8px] bg-[#d7e2ff] px-[16px] py-[18px] text-[16px] text-[#041b3c] placeholder:text-[#737685] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:h-[48px] md:rounded-[2px] md:py-[14px] ${
                errors.email
                  ? "border border-[#ba1a1a] focus-visible:ring-[#ba1a1a]"
                  : ""
              }`}
            />
          </div>
          {errors.email?.message && (
            <p
              id="login-email-error"
              role="alert"
              className="text-[12px] text-[#ba1a1a]"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-[11px] font-bold uppercase tracking-[0.55px] text-[#434654] leading-[16.5px]"
            >
              Password
            </label>
            {/* Mobile Forgot? Link */}
            <a
              href="#"
              className="text-[11px] font-bold text-[#003d9b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] rounded md:hidden"
            >
              Forgot?
            </a>
          </div>
          <div className="relative flex items-center">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
              disabled={isSubmitting}
              placeholder="Enter your password"
              {...register("password")}
              className={`h-[56px] w-full rounded-[8px] bg-[#d7e2ff] px-[16px] pr-[50px] py-[18px] text-[16px] text-[#041b3c] placeholder:text-[#737685] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:h-[48px] md:rounded-[2px] md:py-[14px] ${
                errors.password
                  ? "border border-[#ba1a1a] focus-visible:ring-[#ba1a1a]"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isSubmitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 p-1 text-[#737685] hover:text-[#041b3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] rounded cursor-pointer disabled:opacity-50"
            >
              <img
                src={AUTH_ASSETS.eye}
                alt=""
                className={`h-[15px] w-[22px] select-none transition-opacity ${
                  showPassword ? "opacity-100" : "opacity-60"
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
          {errors.password?.message && (
            <p
              id="login-password-error"
              role="alert"
              className="text-[12px] text-[#ba1a1a]"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Desktop Forgot Password */}
        <div className="flex items-center justify-between py-[8px]">
          <label
            htmlFor="login-remember-me"
            className="inline-flex items-center gap-[8px] cursor-pointer select-none"
          >
            <input
              id="login-remember-me"
              type="checkbox"
              disabled={isSubmitting}
              {...register("rememberMe")}
              className="size-[20px] rounded-[2px] border border-[#c3c6d6] bg-white text-[#003d9b] accent-[#003d9b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-1 disabled:opacity-50 cursor-pointer md:size-[16px] md:bg-[#f1f3ff]"
            />
            <span className="text-[14px] font-medium leading-[20px] text-[#434654]">
              Remember Me
            </span>
          </label>

          {/* Desktop Forgot Password? Link */}
          <a
            href="#"
            className="hidden text-[14px] font-medium text-[#003d9b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] rounded md:inline"
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[56px] w-full items-center justify-center gap-[8px] rounded-[8px] text-[16px] font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(0,61,155,0.1),0px_4px_6px_-4px_rgba(0,61,155,0.1)] transition-opacity hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-2 cursor-pointer md:h-[48px] md:rounded-[2px]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgb(0, 61, 155) 0%, rgb(0, 82, 204) 100%)",
          }}
        >
          {isSubmitting ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span className="md:hidden">Sign In</span>
              <span className="hidden md:inline">Log In</span>
              <img
                src={AUTH_ASSETS.arrowRight}
                alt=""
                className="size-[14px] select-none md:hidden"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </form>

      {/* Footer / Sign Up Link */}
      <div className="pt-[40px] text-center text-[14px] md:border-t md:border-[rgba(195,198,214,0.15)] md:mt-[32px] md:pt-[33px]">
        <span className="text-[#4f5f7b]">Don&apos;t have an account? </span>
        <a
          href="#"
          className="font-semibold text-[#003d9b] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] rounded"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}
