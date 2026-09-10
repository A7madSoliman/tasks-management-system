"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { RecoveryFragmentBootstrap } from "./RecoveryFragmentBootstrap";

function hasRecoveryFragment() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  return fragment.get("type") === "recovery";
}

export function RootRouteBootstrap() {
  const router = useRouter();
  const recovery = typeof window !== "undefined" && hasRecoveryFragment();

  useEffect(() => {
    if (hasRecoveryFragment()) return;

    let cancelled = false;
    void fetch("/api/auth/user")
      .then((response) => (response.ok ? "/project" : "/login"))
      .catch(() => "/login")
      .then((destination) => {
        if (!cancelled) router.replace(destination as Route);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (recovery) return <RecoveryFragmentBootstrap />;

  return (
    <main
      aria-label="Loading"
      className="min-h-dvh bg-[#f9f9ff] shadow-[inset_0_0_0_1px_#f1f3ff]"
    />
  );
}
