/* eslint-disable @next/next/no-img-element -- exact locally committed Figma export */
import type { Metadata } from "next";
import { AUTH_ASSETS } from "@/features/auth/assets/auth-assets";
import { RecoveryFragmentBootstrap } from "@/features/auth/components/RecoveryFragmentBootstrap";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { hasValidRecoveryContext } from "@/features/auth/server/auth-server";

export const metadata: Metadata = {
  title: "Reset Password | Taskly",
  description: "Reset your Taskly password",
};

export default async function ResetPasswordPage() {
  const validRecoveryContext = await hasValidRecoveryContext();
  return (
    <div className="text-text-primary flex min-h-dvh flex-col bg-[#f0f1f5]">
      <header className="flex h-[80px] shrink-0 items-center px-[24px] md:px-[40px]">
        <div className="flex items-center gap-[8px]">
          <img
            src={AUTH_ASSETS.logo}
            alt=""
            aria-hidden="true"
            className="h-[20px] w-[18px]"
          />
          <span className="text-[20px] leading-[28px] font-bold tracking-[-0.5px]">
            TASKLY
          </span>
        </div>
      </header>
      <main className="flex flex-1 justify-center px-[24px] py-[48px] md:items-center md:px-[16px]">
        <div className="w-full max-w-[512px]">
          <div className="md:rounded-control-lg md:border-border-subtle/30 mb-[32px] text-center md:mb-0 md:border md:bg-white md:px-[48px] md:pt-[36px] md:text-left md:shadow-[0px_24px_48px_-12px_rgba(4,27,60,0.06)] md:[&:has([data-reset-success])]:border-0 md:[&:has([data-reset-success])]:bg-transparent md:[&:has([data-reset-success])]:pb-0 md:[&:has([data-reset-success])]:shadow-none">
            <h1 className="text-[24px] leading-[30px] font-semibold tracking-[-0.6px]">
              Create a New Password
            </h1>
            <p className="text-text-secondary mt-[8px] text-[14px] leading-[20px]">
              Create a new, strong password to secure your workstation access.
            </p>
            <div className="rounded-control-lg border-border-subtle/30 mt-[32px] border bg-white px-[33px] pt-[33px] pb-[49px] shadow-[0px_24px_24px_rgba(4,27,60,0.06)] md:mt-[32px] md:rounded-none md:border-0 md:bg-transparent md:px-0 md:pb-[36px] md:shadow-none [&:has([data-reset-success])]:border-0 [&:has([data-reset-success])]:bg-transparent [&:has([data-reset-success])]:p-0 [&:has([data-reset-success])]:shadow-none">
              {validRecoveryContext ? (
                <ResetPasswordForm />
              ) : (
                <RecoveryFragmentBootstrap invalidWhenMissing />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
