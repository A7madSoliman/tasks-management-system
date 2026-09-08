/* eslint-disable @next/next/no-img-element -- exact, locally committed Figma SVG export */
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { AUTH_ASSETS } from "@/features/auth/assets/auth-assets";

export const metadata: Metadata = {
  title: "Forgot Password | Taskly",
  description: "Request a Taskly password reset link",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#f9f9ff] text-[#041b3c]">
      <header className="flex h-[64px] shrink-0 items-center bg-[rgba(249,249,255,0.8)] px-[24px] backdrop-blur-[6px] md:h-[80px] md:bg-[#f9f9ff] md:px-[40px] md:backdrop-blur-none">
        <div className="flex items-center gap-[8px]">
          <img
            src={AUTH_ASSETS.logo}
            alt=""
            aria-hidden="true"
            className="h-[20px] w-[18px] md:hidden"
          />
          <img
            src={AUTH_ASSETS.logo}
            alt=""
            aria-hidden="true"
            className="hidden h-[20px] w-[18px] md:block"
          />
          <span className="text-[20px] leading-[28px] font-bold tracking-[-0.5px]">
            TASKLY
          </span>
        </div>
      </header>
      <main className="flex flex-1 justify-center px-[24px] pt-[52px] pb-[48px] md:items-center md:px-[16px] md:pt-[60px] md:pb-[61px]">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
