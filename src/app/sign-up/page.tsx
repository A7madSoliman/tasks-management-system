/* eslint-disable @next/next/no-img-element -- Temporary Figma SVG asset references isolated for Codex SVGR integration */
import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth/SignUpForm";
import { AUTH_ASSETS } from "@/features/auth/assets";

export const metadata: Metadata = {
  title: "Sign Up | Taskly",
  description: "Create your workspace to access Taskly",
};

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#f9f9ff] text-[#041b3c]">
      {/* Visual Accents (Editorial Texture) in CSS matching Figma nodes 1:1220 / 1:352 */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 p-[48px] opacity-40"
        aria-hidden="true"
      >
        <div className="relative size-[256px]">
          <div className="absolute inset-0 rounded-[12px] bg-[rgba(0,82,204,0.2)] blur-[50px]" />
          <div className="absolute top-1/2 left-1/2 size-[128px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-[rgba(0,61,155,0.1)]" />
        </div>
      </div>

      {/* Header - Top Navigation matching Figma nodes 1:1285 / 1:928 */}
      <header className="flex h-[80px] w-full shrink-0 items-center bg-[rgba(249,249,255,0.8)] px-[24px] backdrop-blur-[6px] md:bg-[#f9f9ff] md:px-[40px] md:backdrop-blur-none">
        <div className="flex items-center gap-[8px]">
          <div className="relative h-[20px] w-[18px] shrink-0">
            <img
              src={AUTH_ASSETS.logo}
              alt=""
              className="size-full select-none"
              aria-hidden="true"
            />
          </div>
          <span className="text-[20px] leading-[28px] font-bold tracking-[-0.5px] text-[#041b3c]">
            TASKLY
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex flex-1 flex-col items-center justify-start px-[24px] pt-[24px] pb-[48px] md:justify-center md:pt-[16px] md:pb-[48px]">
        <div className="w-full max-w-full md:max-w-[576px] md:rounded-[8px] md:bg-white md:p-[48px] md:shadow-[0px_24px_48px_0px_rgba(4,27,60,0.06)]">
          {/* Heading */}
          <div className="mb-[24px] text-left md:mb-[40px] md:text-center">
            <h1 className="text-[28px] leading-[40px] font-semibold tracking-[-0.8px] text-[#041b3c] md:text-[30px] md:leading-[36px] md:tracking-[-0.75px]">
              Create your workspace
            </h1>
            <p className="mt-[8px] hidden text-[14px] leading-[20px] text-[#4f5f7b] md:block">
              Join the editorial approach to task management.
            </p>
            <p className="mt-[6.88px] text-[14px] leading-[22.75px] text-[#434654] md:hidden">
              Join the curated environment for institutional trust and task
              precision.
            </p>
          </div>

          {/* Interactive Form Client Component */}
          <SignUpForm />
        </div>
      </main>
    </div>
  );
}
