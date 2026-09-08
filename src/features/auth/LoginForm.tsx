/* eslint-disable @next/next/no-img-element -- Temporary Figma SVG asset references isolated for Codex SVGR integration */
"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function LoginForm() {
  const router = useRouter();
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
          router.replace("/project" as Route);
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
          const serverMessage = (payload as { message: string }).message;
          if (
            serverMessage === "Invalid email or password." ||
            response.status === 400 ||
            response.status === 401
          ) {
            errorMessage = "Invalid email or password.";
          }
        } else if (response.status === 400 || response.status === 401) {
          errorMessage = "Invalid email or password.";
        }
      } catch {
        if (response.status === 400 || response.status === 401) {
          errorMessage = "Invalid email or password.";
        }
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
            className="rounded-control-md border-semantic-error/30 bg-semantic-error/10 text-semantic-error border p-[12px] text-[13px] leading-[18px]"
          >
            {formError}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-control-md border-action-container/30 bg-semantic-success/25 text-text-primary border p-[12px] text-[13px] leading-[18px] font-medium"
          >
            {successMessage}
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col gap-[8px]">
          <label
            htmlFor="login-email"
            className="text-label-sm text-text-secondary font-bold tracking-[0.55px] uppercase"
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
              className={`h-control-md rounded-control-lg bg-surface-highest text-text-primary placeholder:text-text-placeholder focus-visible:ring-action-primary md:h-control-sm md:rounded-control-sm w-full px-[16px] py-[18px] pr-[48px] text-[16px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:py-[14px] ${
                errors.email
                  ? "border-semantic-error focus-visible:ring-semantic-error border"
                  : ""
              }`}
            />
            <img
              src={AUTH_ASSETS.mail}
              alt=""
              className="pointer-events-none absolute top-1/2 right-[16px] size-[20px] -translate-y-1/2 object-contain select-none"
              aria-hidden="true"
            />
          </div>
          {errors.email?.message && (
            <p
              id="login-email-error"
              role="alert"
              className="text-semantic-error text-[12px]"
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
              className="text-label-sm text-text-secondary font-bold tracking-[0.55px] uppercase"
            >
              Password
            </label>
            <Link
              href={"/forgot-password" as Route}
              className="text-action-primary focus-visible:ring-action-primary cursor-pointer rounded text-[11px] font-bold hover:underline focus-visible:ring-2 focus-visible:outline-none md:hidden"
            >
              Forgot?
            </Link>
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
              className={`h-control-md rounded-control-lg bg-surface-highest text-text-primary placeholder:text-text-placeholder focus-visible:ring-action-primary md:h-control-sm md:rounded-control-sm w-full px-[16px] py-[18px] pr-[50px] text-[16px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:py-[14px] ${
                errors.password
                  ? "border-semantic-error focus-visible:ring-semantic-error border"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isSubmitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="text-text-placeholder hover:text-text-primary focus-visible:ring-action-primary absolute top-1/2 right-[14px] -translate-y-1/2 cursor-pointer rounded p-1 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
            >
              <img
                src={AUTH_ASSETS.eye}
                alt=""
                className={`h-[15px] w-[22px] transition-opacity select-none ${
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
              className="text-semantic-error text-[12px]"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Desktop Forgot Password */}
        <div className="flex items-center justify-between py-[8px]">
          <label
            htmlFor="login-remember-me"
            className="inline-flex cursor-pointer items-center gap-[12px] select-none md:gap-[8px]"
          >
            <input
              id="login-remember-me"
              type="checkbox"
              disabled={isSubmitting}
              {...register("rememberMe")}
              className="rounded-control-sm border-border-subtle text-action-primary accent-action-primary focus-visible:ring-action-primary md:bg-surface-low size-[20px] cursor-pointer border bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:opacity-50 md:size-[16px]"
            />
            <span className="text-text-secondary text-[14px] leading-[20px] font-medium">
              Remember Me
            </span>
          </label>

          <Link
            href={"/forgot-password" as Route}
            className="text-action-primary focus-visible:ring-action-primary hidden cursor-pointer rounded text-[14px] font-medium hover:underline focus-visible:ring-2 focus-visible:outline-none md:inline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-control-md rounded-control-lg focus-visible:ring-action-primary md:h-control-sm md:rounded-control-sm flex w-full cursor-pointer items-center justify-center gap-[8px] text-[16px] font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(0,61,155,0.1),0px_4px_6px_-4px_rgba(0,61,155,0.1)] transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="pt-[40px] text-center text-[14px] md:mt-[32px] md:border-t md:border-[rgba(195,198,214,0.15)] md:pt-[33px]">
        <span className="text-text-muted">Don&apos;t have an account? </span>
        <Link
          href={"/sign-up" as Route}
          className="text-action-primary focus-visible:ring-action-primary rounded font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
