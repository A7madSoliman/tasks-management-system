/* eslint-disable @next/next/no-img-element -- Temporary Figma SVG asset references isolated for Codex SVGR integration */
"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useForm,
  useWatch,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import {
  getPasswordRequirementState,
  signUpSchema,
  type SignUpInput,
} from "@/features/auth/schemas/auth";
import { AUTH_ASSETS } from "@/features/auth/assets/auth-assets";

/**
 * Custom resolver using shared Zod signUpSchema without requiring external resolver dependencies.
 */
const zodSignUpResolver: Resolver<SignUpInput> = (values) => {
  const result = signUpSchema.safeParse(values);
  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const errors: FieldErrors<SignUpInput> = {};
  for (const issue of result.error.issues) {
    const fieldName = issue.path[0];
    if (
      fieldName === "name" ||
      fieldName === "email" ||
      fieldName === "jobTitle" ||
      fieldName === "password" ||
      fieldName === "confirmPassword"
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

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodSignUpResolver,
    defaultValues: {
      name: "",
      email: "",
      jobTitle: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const password = useWatch({ control, name: "password" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });
  const passwordRequirements = getPasswordRequirementState(password ?? "");
  const previousPassword = useRef(password);

  useEffect(() => {
    if (previousPassword.current !== password && confirmPassword) {
      void trigger("confirmPassword");
    }
    previousPassword.current = password;
  }, [confirmPassword, password, trigger]);

  const registerValidatedField = (
    name: "name" | "email" | "password" | "confirmPassword",
  ) =>
    register(name, {
      onChange: () => {
        if (errors[name]) {
          void trigger(name);
        }
      },
    });

  const onSubmit = async (data: SignUpInput) => {
    setFormError(null);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          jobTitle: data.jobTitle,
          password: data.password,
          confirmPassword: data.confirmPassword,
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
          router.replace("/login" as Route);
          return;
        }
      }

      setFormError("Unable to create your account. Please try again.");
    } catch {
      setFormError("Unable to create your account. Please try again.");
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

        {/* Name Field */}
        <div className="flex flex-col gap-[8px]">
          <label
            htmlFor="signup-name"
            className="text-label-sm text-text-secondary md:text-text-muted font-bold tracking-[0.55px] uppercase"
          >
            <span className="md:hidden">Full Name</span>
            <span className="hidden md:inline">Name</span>
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name ? "signup-name-error" : "signup-name-helper"
            }
            disabled={isSubmitting}
            placeholder="Enter your full name"
            {...registerValidatedField("name")}
            className={`h-control-md rounded-control-lg bg-surface-highest text-text-primary placeholder:text-text-placeholder focus-visible:ring-action-primary md:h-control-sm md:rounded-control-sm w-full px-[16px] py-[18px] text-[16px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:py-[14px] ${
              errors.name
                ? "border-semantic-error focus-visible:ring-semantic-error border"
                : ""
            }`}
          />
          {errors.name ? (
            <p
              id="signup-name-error"
              role="alert"
              className="text-semantic-error text-[12px]"
            >
              {errors.name.message}
            </p>
          ) : (
            <p
              id="signup-name-helper"
              className="text-border-subtle hidden text-[11px] leading-[16.5px] md:block"
            >
              3-50 characters, letters only.
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-[8px]">
          <label
            htmlFor="signup-email"
            className="text-label-sm text-text-secondary md:text-text-muted font-bold tracking-[0.55px] uppercase"
          >
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            disabled={isSubmitting}
            placeholder="yourname@company.com"
            {...registerValidatedField("email")}
            className={`h-control-md rounded-control-lg bg-surface-highest text-text-primary placeholder:text-text-placeholder focus-visible:ring-action-primary md:h-control-sm md:rounded-control-sm w-full px-[16px] py-[18px] text-[16px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:py-[14px] ${
              errors.email
                ? "border-semantic-error focus-visible:ring-semantic-error border"
                : ""
            }`}
          />
          {errors.email?.message && (
            <p
              id="signup-email-error"
              role="alert"
              className="text-semantic-error text-[12px]"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Job Title Field (Optional) */}
        <div className="flex flex-col gap-[8px]">
          <label
            htmlFor="signup-job-title"
            className="text-label-sm text-text-secondary md:text-text-muted font-bold tracking-[0.55px] uppercase"
          >
            <span className="md:hidden">Job Title</span>
            <span className="hidden md:inline">
              Job Title{" "}
              <span className="text-text-placeholder font-normal lowercase">
                (Optional)
              </span>
            </span>
          </label>
          <input
            id="signup-job-title"
            type="text"
            autoComplete="organization-title"
            aria-invalid={Boolean(errors.jobTitle)}
            aria-describedby={
              errors.jobTitle ? "signup-job-title-error" : undefined
            }
            disabled={isSubmitting}
            placeholder="e.g. Project Manager"
            {...register("jobTitle")}
            className={`h-control-md rounded-control-lg bg-surface-highest text-text-primary placeholder:text-text-placeholder focus-visible:ring-action-primary md:h-control-sm md:rounded-control-sm w-full px-[16px] py-[18px] text-[16px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:py-[14px] ${
              errors.jobTitle
                ? "border-semantic-error focus-visible:ring-semantic-error border"
                : ""
            }`}
          />
          {errors.jobTitle?.message && (
            <p
              id="signup-job-title-error"
              role="alert"
              className="text-semantic-error text-[12px]"
            >
              {errors.jobTitle.message}
            </p>
          )}
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2 md:gap-[16px]">
          {/* Password Field */}
          <div className="flex flex-col gap-[8px]">
            <label
              htmlFor="signup-password"
              className="text-label-sm text-text-secondary md:text-text-muted font-bold tracking-[0.55px] uppercase"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                aria-required="true"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "signup-password-error" : undefined
                }
                disabled={isSubmitting}
                placeholder="Password"
                {...registerValidatedField("password")}
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
                id="signup-password-error"
                role="alert"
                className="text-semantic-error text-[12px]"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-[8px]">
            <label
              htmlFor="signup-confirm-password"
              className="text-label-sm text-text-secondary md:text-text-muted font-bold tracking-[0.55px] uppercase"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                aria-required="true"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword
                    ? "signup-confirm-password-error"
                    : undefined
                }
                disabled={isSubmitting}
                placeholder="Repeat your password"
                {...registerValidatedField("confirmPassword")}
                className={`h-control-md rounded-control-lg bg-surface-highest text-text-primary placeholder:text-text-placeholder focus-visible:ring-action-primary md:h-control-sm md:rounded-control-sm w-full px-[16px] py-[18px] pr-[50px] text-[16px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:py-[14px] ${
                  errors.confirmPassword
                    ? "border-semantic-error focus-visible:ring-semantic-error border"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isSubmitting}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                className="text-text-placeholder hover:text-text-primary focus-visible:ring-action-primary absolute top-1/2 right-[14px] -translate-y-1/2 cursor-pointer rounded p-1 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              >
                <img
                  src={AUTH_ASSETS.eye}
                  alt=""
                  className={`h-[15px] w-[22px] transition-opacity select-none ${
                    showConfirmPassword ? "opacity-100" : "opacity-60"
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
            {errors.confirmPassword?.message && (
              <p
                id="signup-confirm-password-error"
                role="alert"
                className="text-semantic-error text-[12px]"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Static Visible Requirements Panel (Desktop Only) */}
        <div
          className="rounded-control-lg hidden w-full flex-col gap-[7.5px] bg-[#e8edff] p-[16px] md:flex"
          aria-label="Password requirements"
        >
          <div className="text-text-secondary flex items-center gap-[8px] text-[11px] leading-[16.5px]">
            <img
              src={
                passwordRequirements.hasMinimumLength
                  ? AUTH_ASSETS.passwordRequirementComplete
                  : AUTH_ASSETS.passwordRequirementPending
              }
              alt=""
              aria-hidden="true"
              className="size-[12px] shrink-0 select-none"
            />
            <span>At least 8 characters</span>
          </div>
          <div className="text-text-secondary flex items-center gap-[8px] text-[11px] leading-[16.5px]">
            <img
              src={
                passwordRequirements.hasUppercaseLowercaseAndDigit
                  ? AUTH_ASSETS.passwordRequirementComplete
                  : AUTH_ASSETS.passwordRequirementPending
              }
              alt=""
              aria-hidden="true"
              className="size-[12px] shrink-0 select-none"
            />
            <span>One uppercase, lowercase, and digit</span>
          </div>
          <div className="text-text-secondary flex items-center gap-[8px] text-[11px] leading-[16.5px]">
            <img
              src={
                passwordRequirements.hasSpecialCharacter
                  ? AUTH_ASSETS.passwordRequirementComplete
                  : AUTH_ASSETS.passwordRequirementPending
              }
              alt=""
              aria-hidden="true"
              className="size-[12px] shrink-0 select-none"
            />
            <span>One special character</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-control-md rounded-control-lg focus-visible:ring-action-primary md:h-control-sm md:rounded-control-sm flex w-full cursor-pointer items-center justify-center gap-[8px] text-[16px] font-semibold text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgb(0, 61, 155) 0%, rgb(0, 82, 204) 100%)",
          }}
        >
          {isSubmitting ? (
            <span>Creating account...</span>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Footer / Login Link */}
      <div className="pt-[32px] text-center text-[14px] leading-[20px] md:pt-[32px]">
        <span className="text-text-secondary md:text-text-muted">
          Already have an account?{" "}
        </span>
        <Link
          href={"/login" as Route}
          className="text-action-primary focus-visible:ring-action-primary rounded font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
