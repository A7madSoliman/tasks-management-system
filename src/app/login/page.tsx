/* eslint-disable @next/next/no-img-element -- Temporary Figma SVG asset references isolated for Codex SVGR integration */
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";
import { AUTH_ASSETS } from "@/features/auth/assets";

export const metadata: Metadata = {
  title: "Log In | Taskly",
  description: "Sign in to access your Taskly workspace",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f9f9ff] text-[#041b3c]">
      {/* Visual Accents (Editorial Texture) in CSS matching Figma nodes 1:352 / 1:290 */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 overflow-hidden p-[48px] opacity-40"
        aria-hidden="true"
      >
        <div className="relative size-[256px]">
          <div className="absolute inset-0 rounded-[12px] bg-[rgba(0,82,204,0.2)] blur-[50px]" />
          <div className="absolute top-1/2 left-1/2 size-[128px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-[rgba(0,61,155,0.1)]" />
        </div>
      </div>

      {/* Header - Top Navigation (Reduced for Focused Login State) matching Figma nodes 1:356 / 1:342 */}
      <header className="flex h-[64px] w-full shrink-0 items-center justify-between bg-[rgba(249,249,255,0.8)] px-[24px] backdrop-blur-[6px] md:h-[80px] md:bg-[#f9f9ff] md:px-[40px] md:backdrop-blur-none">
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
      <main className="relative flex flex-1 items-center justify-center px-[24px] py-[40px] md:py-[80px]">
        <div className="w-full max-w-[384px] md:max-w-[480px] md:rounded-[8px] md:bg-white md:p-[48px] md:drop-shadow-[0px_24px_24px_rgba(4,27,60,0.06)]">
          {/* Heading */}
          <div className="mb-[24px] text-center">
            <h1 className="text-[24px] leading-[32px] font-semibold tracking-[-0.6px] text-[#041b3c] md:text-[30px] md:leading-[36px] md:tracking-[-0.75px]">
              Welcome Back
            </h1>
            <p className="mt-[8px] text-[14px] leading-[20px] text-[#4f5f7b]">
              Please enter your details to access your workspace
            </p>
          </div>

          {/* Interactive Form Client Component */}
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
