/* eslint-disable @next/next/no-img-element -- exact, locally committed Figma SVG exports */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/schemas/auth-schemas";
import { AUTH_ASSETS } from "@/features/auth/assets/auth-assets";

export const RECOVERY_COOLDOWN_SECONDS = 300;
export const MAX_RESEND_ATTEMPTS = 3;
export const RECOVERY_SUCCESS_MESSAGE =
  "If an account exists with this email, we’ve sent a password reset link.";
const RECOVERY_FAILURE_MESSAGE =
  "Unable to send the reset link right now. Please try again.";

const forgotPasswordResolver: Resolver<ForgotPasswordInput> = (values) => {
  const result = forgotPasswordSchema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors: FieldErrors<ForgotPasswordInput> = {};
  for (const issue of result.error.issues) {
    if (issue.path[0] === "email" && !errors.email) {
      errors.email = { type: issue.code, message: issue.message };
    }
  }
  return { values: {}, errors };
};

function formatCooldown(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ForgotPasswordInput>({
    resolver: forgotPasswordResolver,
    defaultValues: { email: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!cooldownEndsAt) return;
    const updateRemaining = () =>
      setRemainingSeconds(
        Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000)),
      );
    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [cooldownEndsAt]);

  const sendRecovery = async (email: string) => {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Recovery request failed");
  };

  const startCooldown = () => {
    setRemainingSeconds(RECOVERY_COOLDOWN_SECONDS);
    setCooldownEndsAt(() => Date.now() + RECOVERY_COOLDOWN_SECONDS * 1000);
  };

  const onSubmit = async ({ email }: ForgotPasswordInput) => {
    setFormError(null);
    setResendError(null);
    try {
      await sendRecovery(email);
      setSent(true);
      startCooldown();
    } catch {
      setFormError(RECOVERY_FAILURE_MESSAGE);
    }
  };

  const onResend = async () => {
    if (
      isResending ||
      remainingSeconds > 0 ||
      resendAttempts >= MAX_RESEND_ATTEMPTS
    )
      return;
    setResendError(null);
    setIsResending(true);
    try {
      await sendRecovery(getValues("email"));
      setResendAttempts((attempts) => attempts + 1);
      startCooldown();
    } catch {
      setResendError(RECOVERY_FAILURE_MESSAGE);
    } finally {
      setIsResending(false);
    }
  };

  const resendLimitReached = resendAttempts >= MAX_RESEND_ATTEMPTS;
  const resendDisabled =
    isResending || remainingSeconds > 0 || resendLimitReached;
  const resendLabel = resendLimitReached
    ? "Resend limit reached"
    : remainingSeconds > 0
      ? `Resend in ${formatCooldown(remainingSeconds)}`
      : isResending
        ? "Sending reset link…"
        : "Resend";
  const emailRegistration = register("email", {
    onChange: () => {
      if (touchedFields.email) void trigger("email");
    },
  });

  return (
    <div className="w-full max-w-[448px]">
      <div className="rounded-[8px] bg-white p-[32px] shadow-[0px_24px_48px_-12px_rgba(4,27,60,0.06)] md:border md:border-[rgba(195,198,214,0.3)] md:p-[41px]">
        <div className="mb-[32px] flex flex-col items-center text-center md:items-start md:text-left">
          <span className="mb-[24px] flex size-[48px] items-center justify-center rounded-[12px] bg-[#d7e2ff] md:hidden">
            <img
              src={AUTH_ASSETS.forgotPasswordMobileRecovery}
              alt=""
              aria-hidden="true"
              className="size-[20px]"
            />
          </span>
          <h1 className="text-[24px] leading-[32px] font-semibold tracking-[-0.6px] text-[#041b3c] md:text-[32px] md:leading-[40px] md:tracking-[-0.8px]">
            Forgot password?
          </h1>
          <p className="mt-[8px] max-w-[264px] text-[14px] leading-[20px] text-[#434654] md:max-w-none md:leading-[22.75px]">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-[16px] md:gap-[24px]"
          aria-busy={isSubmitting}
        >
          {formError && (
            <p
              role="alert"
              className="rounded-[4px] border border-[#d94645]/30 bg-[#d94645]/10 p-[12px] text-[13px] text-[#a41919]"
            >
              {formError}
            </p>
          )}
          <div className="flex flex-col gap-[6px] md:gap-[8px]">
            <label
              htmlFor="forgot-password-email"
              className="text-[11px] leading-[16.5px] font-bold tracking-[0.55px] text-[#434654] uppercase"
            >
              Email Address
            </label>
            <input
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "forgot-password-email-error" : undefined
              }
              disabled={isSubmitting || isResending}
              placeholder="Enter your email"
              {...emailRegistration}
              className={`h-[48px] w-full rounded-[2px] bg-[#d7e2ff] px-[16px] text-[16px] text-[#041b3c] ring-offset-2 outline-none placeholder:text-[#737685] focus-visible:ring-2 focus-visible:ring-[#003d9b] md:rounded-[4px] md:px-[17px] ${errors.email ? "border border-[#d94645]" : "border border-transparent"}`}
            />
            {errors.email?.message && (
              <p
                id="forgot-password-email-error"
                role="alert"
                className="text-[12px] text-[#a41919]"
              >
                {errors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || isResending}
            className="h-[48px] w-full rounded-[2px] bg-linear-to-br from-[#003d9b] to-[#0052cc] text-[14px] font-semibold text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 md:rounded-[4px] md:text-[16px]"
          >
            {isSubmitting ? "Sending reset link…" : "Send Reset Link"}
          </button>
        </form>
        <div className="mt-[24px] flex justify-center">
          <Link
            href={"/login" as Route}
            className="inline-flex items-center gap-[8px] rounded text-[14px] leading-[20px] font-medium text-[#003d9b] focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-2 focus-visible:outline-none md:gap-[4px] md:leading-[21px]"
          >
            <img
              src={AUTH_ASSETS.forgotPasswordMobileBack}
              alt=""
              aria-hidden="true"
              className="size-[12px] md:hidden"
            />
            <img
              src={AUTH_ASSETS.forgotPasswordDesktopBack}
              alt=""
              aria-hidden="true"
              className="hidden size-[16px] md:block"
            />{" "}
            Back to log in
          </Link>
        </div>
        {sent && (
          <SuccessPanel
            mobile={false}
            resendDisabled={resendDisabled}
            resendLabel={resendLabel}
            resendError={resendError}
            onResend={onResend}
            resendLimitReached={resendLimitReached}
          />
        )}
      </div>
      {sent && (
        <SuccessPanel
          mobile
          resendDisabled={resendDisabled}
          resendLabel={resendLabel}
          resendError={resendError}
          onResend={onResend}
          resendLimitReached={resendLimitReached}
        />
      )}
    </div>
  );
}

function SuccessPanel({
  mobile,
  resendDisabled,
  resendLabel,
  resendError,
  onResend,
  resendLimitReached,
}: {
  mobile: boolean;
  resendDisabled: boolean;
  resendLabel: string;
  resendError: string | null;
  onResend: () => void;
  resendLimitReached: boolean;
}) {
  const visibility = mobile
    ? "mt-[24px] flex md:hidden"
    : "mt-[41px] hidden border-t border-[rgba(195,198,214,0.15)] pt-[41px] md:flex";
  return (
    <section
      className={`${visibility} flex-col gap-[12px]`}
      aria-label="Password reset email status"
    >
      <div
        role="status"
        aria-live="polite"
        className={
          mobile
            ? "flex gap-[12px] rounded-[4px] bg-[rgba(130,249,190,0.3)] p-[16px] text-[#005235]"
            : "flex gap-[12px] rounded-[8px] bg-[rgba(130,249,190,0.2)] p-[16px] text-[#005235]"
        }
      >
        <img
          src={
            mobile
              ? AUTH_ASSETS.forgotPasswordMobileSuccess
              : AUTH_ASSETS.forgotPasswordDesktopSuccess
          }
          alt=""
          aria-hidden="true"
          className="size-[20px] shrink-0"
        />
        <p className="text-[12px] leading-[19.5px] font-medium md:text-[14px] md:leading-[17.5px] md:font-normal">
          {RECOVERY_SUCCESS_MESSAGE}
        </p>
      </div>
      <div
        className={
          mobile
            ? "flex items-center justify-between border-t border-[rgba(0,82,53,0.1)] pt-[13px]"
            : "flex flex-col items-center gap-[12px]"
        }
      >
        <p className="text-[11px] leading-[16.5px] font-bold tracking-[1.1px] text-[rgba(0,82,53,0.6)] uppercase md:tracking-[0.55px] md:text-[#434654]">
          Didn&apos;t receive {mobile ? "email?" : "the email?"}
        </p>
        <button
          type="button"
          onClick={onResend}
          disabled={resendDisabled}
          aria-describedby={
            resendLimitReached ? "forgot-password-resend-limit" : undefined
          }
          className={
            mobile
              ? "rounded text-[11px] leading-[16.5px] font-bold tracking-[1.1px] text-[#003d9b] uppercase focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[#737685]"
              : "flex h-[48px] w-full items-center justify-center gap-[8px] rounded-[4px] bg-[#f1f3ff] text-[16px] font-semibold text-[#003d9b] focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[#737685]"
          }
        >
          {!mobile && (
            <img
              src={AUTH_ASSETS.forgotPasswordDesktopTimer}
              alt=""
              aria-hidden="true"
              className="h-[21px] w-[18px]"
            />
          )}
          <span aria-live="off">{resendLabel}</span>
        </button>
      </div>
      {resendLimitReached && (
        <p
          id="forgot-password-resend-limit"
          role="status"
          className="text-[12px] text-[#434654]"
        >
          The resend limit has been reached.
        </p>
      )}
      {resendError && (
        <p role="alert" className="text-[12px] text-[#a41919]">
          {resendError}
        </p>
      )}
    </section>
  );
}
