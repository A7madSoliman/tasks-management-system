# Task Report

## What changed

- Added the accessible, responsive `/sign-up` route and RHF Sign Up form.
- Added reusable typed `signUpSchema`, server-boundary `POST /api/auth/sign-up`, and safe Sign Up request handling.
- Added Sign Up UI, schema, route, and page coverage.
- Corrected the Sign Up layout and validation UX after review: the page now uses a dynamic viewport flex layout, fields validate on blur and revalidate while corrected, and desktop password hints react to the shared password-rule predicates.
- Applied final bounded vertical-spacing polish: moved the complete desktop card subtly upward through asymmetric external main padding and moved mobile content 8px upward through external top padding only.
- Final acceptance review completed against the authoritative Acceptance Criteria, desktop Figma node `1:1219`, mobile Figma node `1:923`, and the server contract. The accepted slice contains no temporary Figma URLs, browser secrets, Sign Up cookies, or token exposure.

Acceptance Criteria checklist:

- [x] `/sign-up` provides Name, Email, Password, Confirm Password, and optional Job Title.
- [x] Validation blocks invalid submission on client and server.
- [x] The server posts to `/auth/v1/signup` with `email`, `password`, and `data.name` / optional `data.job_title`.
- [x] Successful registration returns a safe success result and replaces navigation to `/login`.
- [x] Sign Up never persists cookies or returns Supabase tokens.
- [x] Responsive and accessible desktop/mobile behavior is implemented.

## Files changed

- `src/app/sign-up/page.tsx`
- `src/app/sign-up/page.test.tsx`
- `src/app/api/auth/sign-up/route.ts`
- `src/app/api/auth/sign-up/route.test.ts`
- `src/features/auth/SignUpForm.tsx`
- `src/features/auth/SignUpForm.test.tsx`
- `src/features/auth/schema.ts`
- `src/features/auth/schema.test.ts`
- `src/features/auth/server.ts`
- `src/features/auth/assets.ts`
- `public/assets/sign-up-asset-2.svg`
- `public/assets/sign-up-asset-3.svg`

## Decisions

- Figma sources: desktop node `1:1219`, mobile node `1:923`, Style Guide node `76:1757`.
- Desktop uses the 576px white card, 48px controls, two password columns, helper text, and static requirements panel. Mobile removes the card/panel, stacks passwords, uses 56px controls, and maintains horizontal page padding.
- Desktop overflow root cause: `min-h-screen` was combined with a fixed-height header and padded main area, making the card consume space in addition to a full viewport. The page now uses `min-h-dvh` and a flex column where the main region shares remaining viewport height. It centers desktop content where space allows, while short viewports scroll naturally; no scrollbar suppression or clipping workaround was added.
- Mobile spacing root cause: the same centered flex main region and a 64px header diverged from Figma’s natural 80px-header content flow. Mobile now starts content directly after the Figma-matched header with 32px top and 48px bottom content padding, so it remains naturally scrollable without artificial blank space.
- Final visual-spacing polish: desktop main padding is now 16px top / 48px bottom at the desktop breakpoint, which shifts the normally centered card upward by 16px without transforms, negative margins, fixed viewport sizing, clipping, or internal field compression. Mobile outer top padding is 24px (from 32px), shifting the form upward 8px while preserving the 80px header and all internal Figma spacing.
- RHF uses `mode: "onBlur"` and `reValidateMode: "onChange"`. The form’s typed registration helper triggers the shared resolver on changes to already-invalid fields, giving blur-first feedback and immediate correction feedback without duplicating rules.
- `getPasswordRequirementState` is the single reusable source for all password predicates and the three grouped indicator conditions. The shared Zod password refinement and live indicator UI consume this one result; password regexes are not duplicated between them.
- Desktop password indicators are live with `useWatch`: all start with exact local inactive Figma asset `sign-up-asset-2.svg`, independently become the exact local successful Figma asset `sign-up-asset-3.svg`, and revert when requirements are removed. Mobile retains no visual panel, matching node `1:923`.
- Confirm Password mismatch is validated on blur, updates as it is corrected, and is explicitly retriggered when a non-empty confirmation exists and Password later changes.
- `signUpSchema` permits Unicode letters/marks with internal spaces, apostrophes, and hyphens; it enforces 3–50 characters, email format, all five password rules, and matching confirmation. Job Title is optional.
- Browser submits only to the Next.js route. Server-only native `fetch` sends `{ email, password, data: { name, job_title? } }` with `apikey` and JSON headers. Empty Job Title is omitted.
- Unlike Login, Sign Up deliberately does not store cookies, accept a session, or expose returned tokens. Success is only `{ success: true }`, followed by `router.replace('/login')`.
- Reused Login’s exact local logo and eye glyph. Added only the exact Figma-exported desktop validation indicators; no temporary Figma URLs remain.
- Accessibility review: associated labels, input/autocomplete semantics, keyboard visibility buttons, live field/form errors, loading disablement, logical tab sequence, decorative asset treatment, and keyboard Login link.
- `frontend → agy` produced the bounded Sign Up UI and client tests. `tests → agy` was dispatched but its relay stalled after only adding an import; Codex stopped it and completed the outstanding tests directly. No delegate report was trusted.

## Validation

- `pnpm lint` — passed.
- `pnpm typecheck` — passed.
- `pnpm test` — passed: 10 files, 85 tests.
- `pnpm format:check` — passed.
- `pnpm build` — passed; `/sign-up` and `/api/auth/sign-up` compiled.
- `pnpm check` — passed (lint, typecheck, 85 tests, formatting, production build).
- `git diff --check` — passed; only existing Git line-ending warnings were emitted.
- `pnpm dev` smoke — existing verified Taskly dev server returned `GET /sign-up` HTTP 200; it was stopped cleanly after the check. A second `pnpm dev` correctly declined to run concurrently.
- Final spacing-polish validation: `pnpm lint`, `pnpm typecheck`, `pnpm test` (10 files, 85 tests), `pnpm format:check`, `pnpm build`, and `git diff --check` all passed. A stale Taskly dev process was stopped to release a Next build lock before the successful final production build.
- Codex reviewed the full diff for acceptance criteria, client/server boundary, no cookies/tokens, secrets, native fetch, Figma assets, responsive behavior, accessibility, and scope.

## Issues / Risks

- Exact upstream Sign Up response/error schemas and email-confirmation behavior remain unverified. Errors use a safe generic fallback and no raw Supabase response is exposed.
- The tests-lane delegation relay did not complete normally; its partial import was reviewed and the intended tests were completed by Codex.

## Next step

The accepted Sign Up slice is committed locally; nothing was pushed. Do not begin Forgot Password or Reset Password until separately authorized.
