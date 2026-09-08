# Task Report

## What changed

- Added the `/forgot-password` route, its responsive recovery form, and `POST /api/auth/forgot-password` server boundary.
- Added a reusable `forgotPasswordSchema` with required, valid-email validation. RHF uses `mode: "onBlur"` and `reValidateMode: "onChange"`; invalid values do not reach the backend.
- Added anti-enumeration recovery behavior. Accepted backend recovery responses always produce exactly: `If an account exists with this email, we’ve sent a password reset link.` Safe generic failures never expose backend bodies or account membership.
- Added a local 300-second cooldown, visible `mm:ss` countdown, cleanup-safe interval, three accepted resend maximum, and failed-resend behavior that does not consume a trial or reset the timer.
- Added exact local Figma SVG exports for the desktop and mobile back, success, timer, recovery, and logo glyphs. No temporary Figma asset URL is present in source.
- Final integration correction: Login’s mobile `Forgot?` and desktop `Forgot Password?` controls are now accessible Next.js links to `/forgot-password`.
- Final Figma correction: Back to log in is centered through its full-width flex wrapper on both responsive variants. The exact desktop Figma check asset now labels the success state and the exact stopwatch asset labels the desktop resend countdown; unused duplicate logo exports were removed.

Acceptance Criteria checklist:

- [x] `/forgot-password`, Email field, Send Reset Link action, validation, loading, and duplicate prevention.
- [x] Server-side schema validation and native server-only `POST /auth/v1/recover` with verified headers/body.
- [x] Exact anti-enumeration success copy and safe system-failure feedback.
- [x] Success/resend presentation, 05:00 visible cooldown, expiry enablement, accepted resend reset, cleanup-safe timer.
- [x] Three-resend UX cap; initial send excluded; failed resend excluded.
- [x] Keyboard-accessible `/login` Back to log in link, field semantics, error/status announcements, and non-noisy timer (`aria-live="off"`).

## Files changed

- `src/app/forgot-password/page.tsx`
- `src/app/forgot-password/page.test.tsx`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/forgot-password/route.test.ts`
- `src/features/auth/ForgotPasswordForm.tsx`
- `src/features/auth/ForgotPasswordForm.test.tsx`
- `src/features/auth/schema.ts`
- `src/features/auth/schema.test.ts`
- `src/features/auth/server.ts`
- `src/features/auth/assets.ts`
- `src/features/auth/LoginForm.tsx`
- `src/features/auth/LoginForm.test.tsx`
- `public/assets/forgot-password-*.svg`

## Decisions

- Figma sources inspected through MCP: Desktop `1:216`, Mobile `1:161`, Style Guide `76:1757`.
- Desktop uses the 448px centered bordered card, left-aligned 32px title, 48px controls, success panel inside the card after a separator, and full disabled timer panel. Mobile uses the 64px focused header, recovery icon, centered 24px title/subtitle, 2px controls, and success/resend section outside the primary card.
- The browser calls only `/api/auth/forgot-password`. Server-only `SUPABASE_BASE_URL` and `SUPABASE_API_KEY` supply `apikey` and JSON headers to `POST /auth/v1/recover`; no Supabase client or browser secret was added.
- `RECOVERY_COOLDOWN_SECONDS = 300` centralizes the five-minute cooldown. Countdown derives remaining time from an end timestamp and a single cleaned-up browser interval, avoiding duplicate intervals and stale countdown state.
- `MAX_RESEND_ATTEMPTS = 3` counts only accepted subsequent resends. The initial send is excluded. Failed resend responses preserve both the cooldown state and accepted resend count.
- Figma recheck after correction: desktop `1:216` uses a check icon for the success message and stopwatch icon for the countdown; mobile `1:161` uses its check icon for success and intentionally has no countdown glyph. The locally named desktop exports were replaced with the correct asset bytes.
- Login integration supersedes the prior non-functional Forgot control decision without changing Login submission, session, or API behavior.
- Initial Antigravity attempts ran under the restricted execution environment and reported unavailable authentication. The minimal direct readiness check later returned `AGY AUTH OK`; frontend, fixes, and tests lanes are ready. The prior issue was delegate-environment isolation, not an unavailable local account. No Notion was used.

## Validation

- `pnpm lint` — passed.
- `pnpm typecheck` — passed.
- `pnpm test` — passed: 13 files, 99 tests.
- `pnpm format:check` — passed.
- `pnpm build` — passed; `/forgot-password` and `/api/auth/forgot-password` compiled.
- Final acceptance validation rerun — `pnpm lint`, `pnpm typecheck`, `pnpm test` (13 files, 99 tests), `pnpm format:check`, `pnpm build`, `pnpm check`, and `git diff --check` all passed.
- `git diff --check` — passed.
- `pnpm dev` — `/forgot-password` returned HTTP 200 with expected heading; server stopped cleanly.
- Final responsive/navigation dev smoke — `/login` and `/forgot-password` each returned HTTP 200; rendered Next links verify `/login → /forgot-password → /login`; server stopped cleanly.
- Final focused coverage verifies Login mobile/desktop Forgot links and keyboard focus, centered Back to log in semantics, the success check asset, stopwatch countdown asset, and existing cooldown/trial behavior. Full suite remains 13 files / 99 tests.
- Live recovery diagnosis compared the implementation against `docs/API_CONTRACT.md` and the sanitized Postman collection: method `POST`, endpoint `/auth/v1/recover`, `apikey` and `Content-Type: application/json` headers, `{ email }` body, and server-only environment variables all match.
- The earlier local-dev smoke was blocked by restricted outbound networking in the sandboxed process (`accepted: no`); it was not a contract or backend rejection. One direct bounded request using the same local-only environment reached the backend, returned HTTP 200, and was accepted: yes. No email, API key, raw body, or secret was printed. No resend was made.
- AGY readiness — `agy models` returned `AGY AUTH OK`; frontend, fixes, and tests are ready. No delegation was needed for this diagnostic-only continuation.
- Automated coverage includes schema validity, accessible route/form, blur/change validation, loading and duplicate submission, server route/body/headers, safe error normalization, exact success text, fake-timer expiry/reset, three accepted resends, and failed-resend preservation.

## Issues / Risks

- Recovery was accepted by the backend. Inbox delivery remains intentionally for manual user verification; no resend was made.
- Earlier local-dev failure was execution-sandbox outbound-network isolation. It is documented so future smoke checks use an authorized direct server-side request when live backend connectivity is required.

## Next step

- Forgot Password is accepted and committed locally. Inbox delivery remains available for manual verification if needed. Do not begin Reset Password in this slice.
