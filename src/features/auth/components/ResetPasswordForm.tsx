/* eslint-disable @next/next/no-img-element -- exact locally committed Figma exports */
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
import { AUTH_ASSETS } from "@/features/auth/assets/auth-assets";
import {
  getPasswordRequirementState,
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth/schemas/auth-schemas";

export const SUCCESS_REDIRECT_DELAY_MS = 3000;
const SUCCESS_MESSAGE =
  "Your password has been updated successfully. You can now log in";
const INVALID_RECOVERY_MESSAGE = "Invalid or expired reset link.";

const resolver: Resolver<ResetPasswordInput> = (values) => {
  const result = resetPasswordSchema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors: FieldErrors<ResetPasswordInput> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (
      (field === "password" || field === "confirmPassword") &&
      !errors[field]
    ) {
      errors[field] = { type: issue.code, message: issue.message };
    }
  }
  return { values: {}, errors };
};

function Requirement({
  complete,
  children,
  className = "",
}: {
  complete: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={`text-text-primary flex items-center gap-[8px] text-[13px] leading-[19.5px] ${className}`}
    >
      <img
        src={
          complete
            ? AUTH_ASSETS.passwordRequirementComplete
            : AUTH_ASSETS.passwordRequirementPending
        }
        alt={complete ? "Complete" : "Not yet complete"}
        className="size-[15px] shrink-0"
      />
      <span>{children}</span>
    </li>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver,
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const password = useWatch({ control, name: "password" }) ?? "";
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) ?? "";
  const previousPassword = useRef(password);
  const requirements = getPasswordRequirementState(password);

  useEffect(() => {
    if (previousPassword.current !== password && confirmPassword)
      void trigger("confirmPassword");
    previousPassword.current = password;
  }, [confirmPassword, password, trigger]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(
      () => router.replace("/login" as Route),
      SUCCESS_REDIRECT_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [router, success]);

  const registerValidated = (name: "password" | "confirmPassword") =>
    register(name, {
      onChange: () => {
        if (errors[name]) void trigger(name);
      },
    });
  const onSubmit = async (data: ResetPasswordInput) => {
    setFormError(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setSuccess(true);
        return;
      }
      const payload: unknown = await response.json().catch(() => null);
      setFormError(
        typeof payload === "object" &&
          payload !== null &&
          "message" in payload &&
          payload.message === INVALID_RECOVERY_MESSAGE
          ? INVALID_RECOVERY_MESSAGE
          : "Unable to update your password. Please try again.",
      );
    } catch {
      setFormError("Unable to update your password. Please try again.");
    }
  };
  const leaveRecovery = () => {
    void fetch("/api/auth/recovery-context", { method: "DELETE" });
  };

  if (success)
    return (
      <section
        data-reset-success
        data-testid="reset-success"
        role="status"
        aria-live="polite"
        className="rounded-control-lg flex w-full items-start gap-[12px] bg-[rgba(130,249,190,0.2)] p-[16px] text-left text-[#005235]"
      >
        <img
          src={AUTH_ASSETS.forgotPasswordDesktopSuccess}
          alt=""
          aria-hidden="true"
          className="size-[20px] shrink-0"
        />
        <p className="text-[14px] leading-[20px]">{SUCCESS_MESSAGE}</p>
      </section>
    );
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full flex-col gap-[24px]"
    >
      {formError && (
        <p
          role="alert"
          className="border-semantic-error/30 bg-semantic-error/10 text-semantic-error rounded-control-md border p-[12px] text-[13px]"
        >
          {formError}
        </p>
      )}
      {(["password", "confirmPassword"] as const).map((name) => {
        const isPassword = name === "password";
        const visible = isPassword ? showPassword : showConfirmPassword;
        const error = errors[name];
        const id = `reset-${name}`;
        return (
          <div key={name} className="flex flex-col gap-[8px]">
            <label
              htmlFor={id}
              className="text-label-sm text-text-secondary text-left font-bold tracking-[0.55px] uppercase"
            >
              {isPassword ? "New Password" : "Confirm Password"}
            </label>
            <div className="relative">
              <input
                id={id}
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                disabled={isSubmitting}
                {...registerValidated(name)}
                className={`h-control-sm rounded-control-sm bg-surface-low text-text-primary focus-visible:ring-action-primary w-full border px-[16px] pr-[50px] text-[16px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 ${error ? "border-semantic-error" : "border-border-subtle/30"}`}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  isPassword
                    ? setShowPassword((value) => !value)
                    : setShowConfirmPassword((value) => !value)
                }
                aria-label={`${visible ? "Hide" : "Show"} ${isPassword ? "password" : "confirm password"}`}
                aria-pressed={visible}
                className="focus-visible:ring-action-primary absolute top-1/2 right-[12px] -translate-y-1/2 rounded p-1 focus-visible:ring-2 focus-visible:outline-none"
              >
                <img
                  src={visible ? AUTH_ASSETS.eyeOff : AUTH_ASSETS.eye}
                  alt=""
                  aria-hidden="true"
                  className="size-[20px] object-contain"
                />
              </button>
            </div>
            {error && (
              <p
                id={`${id}-error`}
                role="alert"
                className="text-semantic-error text-[12px]"
              >
                {error.message}
              </p>
            )}
          </div>
        );
      })}
      <section
        aria-label="Password requirements"
        className="rounded-control-md border-border-subtle/10 bg-surface-low/50 border p-[20px] text-left md:p-[21px]"
      >
        <h2 className="text-label-sm text-text-secondary border-border-subtle/20 mb-[12px] border-b pb-[9px] text-left font-bold tracking-[0.55px] uppercase">
          Security Requirements
        </h2>
        <ul className="grid grid-cols-1 gap-[10px] md:grid-cols-2 md:gap-x-[12px] md:gap-y-[12px]">
          <Requirement complete={requirements.hasMinimumLength}>
            At least 8 characters
          </Requirement>
          <li className="text-text-primary flex items-center gap-[8px] text-[13px] leading-[19.5px] md:hidden">
            <img
              src={
                requirements.hasUppercase && requirements.hasLowercase
                  ? AUTH_ASSETS.passwordRequirementComplete
                  : AUTH_ASSETS.passwordRequirementPending
              }
              alt={
                requirements.hasUppercase && requirements.hasLowercase
                  ? "Complete"
                  : "Not yet complete"
              }
              className="size-[15px] shrink-0"
            />
            <span>Uppercase &amp; Lowercase</span>
          </li>
          <Requirement
            complete={requirements.hasUppercase}
            className="hidden md:flex"
          >
            Uppercase letter
          </Requirement>
          <Requirement
            complete={requirements.hasLowercase}
            className="hidden md:flex"
          >
            Lowercase letter
          </Requirement>
          <Requirement complete={requirements.hasDigit}>
            At least one digit
          </Requirement>
          <Requirement complete={requirements.hasSpecialCharacter}>
            Special character
          </Requirement>
        </ul>
      </section>
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-control-sm rounded-control-sm focus-visible:ring-action-primary w-full bg-gradient-to-br from-[#003d9b] to-[#0052cc] text-[16px] font-semibold text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
      >
        {isSubmitting ? "Updating password..." : "Update Password"}
      </button>
      <Link
        href={"/login" as Route}
        onClick={leaveRecovery}
        className="text-action-primary focus-visible:ring-action-primary text-center text-[14px] font-medium focus-visible:ring-2 focus-visible:outline-none"
      >
        Back to Log In
      </Link>
    </form>
  );
}
