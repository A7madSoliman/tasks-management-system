"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

const INVALID_RECOVERY_MESSAGE = "Invalid or expired reset link.";

type RecoveryBootstrapProps = { invalidWhenMissing?: boolean };

/** Captures a recovery-only fragment and removes it before navigating. */
export function RecoveryBootstrap({
  invalidWhenMissing = false,
}: RecoveryBootstrapProps) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "invalid">("loading");

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const hasFragment = window.location.hash.length > 1;
    const type = fragment.get("type");
    const accessToken = fragment.get("access_token");
    if (type !== "recovery" || !accessToken) {
      if (!hasFragment) {
        if (!invalidWhenMissing) return;
        const timer = window.setTimeout(() => setState("invalid"), 0);
        return () => window.clearTimeout(timer);
      }
      window.history.replaceState(null, "", window.location.pathname);
      if (!invalidWhenMissing) {
        router.replace("/reset-password" as Route);
        return;
      }
      const timer = window.setTimeout(() => setState("invalid"), 0);
      return () => window.clearTimeout(timer);
    }

    // Remove the credential from browser history before the network request completes.
    window.history.replaceState(null, "", window.location.pathname);
    void fetch("/api/auth/recovery-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "recovery", accessToken }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("invalid recovery context");
        router.replace("/reset-password" as Route);
      })
      .catch(() => {
        if (invalidWhenMissing) {
          setState("invalid");
          return;
        }
        router.replace("/reset-password" as Route);
      });
  }, [invalidWhenMissing, router]);

  if (!invalidWhenMissing) return null;
  if (state === "invalid") {
    return (
      <p
        role="alert"
        aria-live="assertive"
        className="text-semantic-error text-center"
      >
        {INVALID_RECOVERY_MESSAGE}
      </p>
    );
  }
  return (
    <p
      role="status"
      aria-live="polite"
      className="text-text-secondary text-center"
    >
      Validating reset link…
    </p>
  );
}
