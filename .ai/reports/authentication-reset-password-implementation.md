# Task Report

## What changed

- Added `/reset-password`, a recovery-only capture bootstrap, and dedicated server boundaries for recovery-context creation/clear and password update.
- Added `resetPasswordSchema`, composing the existing Sign Up `passwordSchema` and `getPasswordRequirementState`; no new password regex was introduced.
- Added responsive Reset Password form UI with RHF blur-first/change-revalidation behavior, live indicators, password visibility, safe errors, exact success copy, and a centralized 3000ms redirect.
- Added focused recovery-context/update route-handler tests and browser-fragment bootstrap integration tests.
- Corrected Mobile Figma `1:2` form/requirements text alignment to explicit left alignment and replaced the empty success presentation with a compact semantic-success panel using the established exact Forgot Password success asset.
- Corrected recovery-link routing precedence at the root: recovery fragments now win over any subsequent normal navigation and always replace to `/reset-password` after capture or malformed-fragment scrubbing.
- Final acceptance review confirms the transactional `/reset-password` flow, secure recovery bridge, shared Sign Up validation, responsive Figma behavior, compact success state, and user-controlled real recovery/password-update journey are accepted.

Acceptance Criteria checklist:

- [x] `/reset-password` form is server-gated by a validated dedicated recovery context.
- [x] Shared minimum-eight/uppercase/lowercase/digit/special password rules and matching confirmation are enforced client and server side.
- [x] Recovery fragment capture requires `type=recovery`, validates with server-side `GET /auth/v1/user`, immediately scrubs the fragment, and never uses a query string or web storage.
- [x] Server-only password update uses verified `PUT /auth/v1/user`, recovery Bearer authorization, server-only `apikey`, and `{ password }`.
- [x] Dedicated recovery context is HttpOnly, SameSite=Lax, Secure in production, session-scoped, separate from normal auth cookies, and cleared on success/authorization rejection/manual exit.
- [x] Invalid state uses exactly `Invalid or expired reset link.`; success uses exactly `Your password has been updated successfully. You can now log in` and redirects to `/login` after 3000ms.
- [x] Figma Desktop `1:79` / Mobile `1:2` responsive structure, accessible controls, and live requirements are implemented.

## Files changed

- `src/features/auth/schema.ts`, `src/features/auth/schema.test.ts`
- `src/features/auth/server.ts`, `src/features/auth/server.test.ts`
- `src/features/auth/RecoveryBootstrap.tsx`, `src/features/auth/RecoveryBootstrap.test.tsx`
- `src/features/auth/ResetPasswordForm.tsx`, `src/features/auth/ResetPasswordForm.test.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/api/auth/recovery-context/route.ts`, `src/app/api/auth/recovery-context/route.test.ts`
- `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/reset-password/route.test.ts`
- `src/app/page.tsx`, `src/app/page.test.tsx`
- `.ai/reset-password-ui-brief.md`

## Decisions

- Figma inspected through MCP: Desktop `1:79`, Mobile `1:2`. Existing local Taskly logo, visibility eye, and Sign Up requirement assets are reused from the accepted Figma-derived Auth asset set; no remote Figma URL or substitute icon is used.
- Acceptance Criteria override Figma’s stale `8–64 characters` copy. The visible rule is `At least 8 characters`; `docs/API_CONTRACT.md` establishes no authoritative maximum.
- RHF uses `mode: "onBlur"` and `reValidateMode: "onChange"`; previously-entered confirmation triggers immediate revalidation when New Password changes.
- Indicators use the existing Sign Up helper. Desktop renders five discrete requirements in a two-column grid; mobile shows the uppercase/lowercase requirement as one success condition only when both predicates pass.
- Mobile field labels, Security Requirements heading, and checklist have explicit `text-left` alignment, while the title/subtitle, action button, and Back to Log In retain their designed centered alignment. The success panel is content-driven, has no fixed-height card, reuses `forgotPasswordDesktopSuccess`, and preserves exact copy/timing/security behavior.
- Browser fragment token flow is limited to `fragment -> same-origin POST -> server validation -> HttpOnly recovery cookie -> /reset-password`. It is scrubbed via `history.replaceState` before capture completes. It is not logged, returned to a Client Component, stored in props/context/Redux/localStorage/sessionStorage, placed in a query string, or used as normal login state.
- Routing root cause: `RecoveryBootstrap` at `/` returned no UI/no navigation for malformed fragments and for capture failures when `invalidWhenMissing` was false. That allowed later ordinary authenticated navigation to win and reach `/project`. There is no root middleware or root server redirect; `/project` is an isolated server route. The fix treats every non-empty malformed/failed recovery fragment as a narrow recovery special case, scrubs it, and replaces to `/reset-password`; a root visit with no fragment retains existing behavior.
- `/reset-password` is an Auth transactional page directly under `src/app/reset-password`; it imports no project shell/layout and its focused-page test asserts the project workspace content is absent.
- Final acceptance: the recovery context is distinct from normal login cookies; successful update clears it without creating a normal session. The exact 3000ms `/login` redirect, RHF `onBlur`/`onChange` behavior, confirmation revalidation, shared live indicators, mobile left alignment, and exact local Figma-derived assets remain verified.
- Handler coverage verifies malformed capture rejection, safe authorization/backend failure, no capture-token response, update validation before backend invocation, and safe update normalization. Helper coverage verifies dedicated cookie options, `PUT /auth/v1/user` server authorization/body, clearing, and no normal-session overwrite. Bootstrap coverage verifies same-origin capture, hash scrubbing, no query/storage/DOM token exposure, invalid fragment rejection, and safe capture failure.
- Antigravity delegation was prepared with a self-contained frontend/tests brief, but `agy models` reported this environment is not signed in and could not write its CLI state. Codex completed and reviewed the bounded UI directly; no Notion was used.

## Validation

- `pnpm lint` — passed after final visual correction.
- `pnpm typecheck` — passed after final visual correction.
- `pnpm test` — passed: 18 files, 131 tests.
- `pnpm format:check` — passed after final visual correction.
- `pnpm build` — passed after final visual correction; `/reset-password`, `/api/auth/recovery-context`, and `/api/auth/reset-password` compiled.
- `git diff --check` — passed after final visual correction.
- `pnpm check` — passed completely after routing correction with captured exit code `0`: lint, typecheck, 18 Vitest files / 131 tests, formatting, and production build all completed.
- `pnpm dev` did not start a duplicate server because an existing Taskly dev server owned port 3000. Bounded smoke against that existing server returned HTTP 200 for `/reset-password`, `/login`, and `/forgot-password`; it was left running.
- Final routing dev smoke started a bounded local server and observed normal root `/` HTTP 200 plus `/reset-password` HTTP 200. A real token was deliberately not supplied. RTL integration verifies root recovery fragments replace to `/reset-password`, `/project` interception is absent, and the fragment is scrubbed.
- Automated coverage verifies shared schema acceptance/rejection, confirmation matching, RHF blur/change/revalidation behavior, invalid client submission prevention, live indicator activation/reversion, exact success copy, 3000ms redirect, recovery cookie separation/options, and server-side verified update request shape.
- Real recovery context: succeeded (manually exercised by the user). Real password update: succeeded. Success state rendered: succeeded. No email value, password, recovery token, recovery URL, or API key was recorded. No additional password change was performed.

## Issues / Risks

- No genuine remaining functional risk is known from this slice. The manually exercised real update changed the test password under user control; no sensitive value was recorded or changed again by Codex.
- Antigravity was unavailable due local CLI authentication, so the requested agy work was not executed.

## Next step

- Review the uncommitted implementation. Recovery destination is `/reset-password`; project redirect intercepted recovery: no; fragment scrubbing is covered in RTL. Do not begin Auth cleanup or create a commit without separate authorization.
