# Task Report

## What changed

- Continued Authentication discovery/planning only. No Authentication routes, components, forms, Server Actions, API implementation, packages, tests, commits, or pushes were created.
- Verified Figma root-canvas (`0:1`) Auth frames: Reset Password mobile `1:2` / desktop `1:79`; Forgot Password mobile `1:161` / desktop `1:216`; Login mobile `1:289` / desktop `1:351`; Sign Up mobile `1:923` / desktop `1:1219`.
- Login has email, password, Remember Me, forgot-password, submit, and sign-up controls. Sign Up has name, email, job title (optional only on desktop), password, confirmation, submit, and login controls. Desktop Sign Up `1:1219` shows name and password hints; mobile shows fields only. Forgot Password shows email, submit, back link, and an account-non-enumerating success/resend state (`1:196` mobile, `1:262` desktop). Reset Password shows new/confirm password, visibility icon, requirements, submit, and back link. No standalone Login/Sign Up/Reset error, disabled, or loading state is designed.
- Reused Style Guide evidence: logo `76:2093`/`76:2095`, palette `76:1828`, typography `76:1897`, buttons `76:1936`, inputs `76:1946`, iconography `76:1981`. Screens use Inter and the verified action/surface/text system.
- Added sanitized Postman source `docs/api/taskly.postman_collection.json`; it preserves all 23 endpoints, methods, request schemas, variable names, and useful Login/Refresh scripts, while replacing all sensitive/account values with blanks or fake placeholders. Updated `docs/API_CONTRACT.md`.
- Removed the user-supplied source collection from the working tree after sanitization; it is not in commit scope.
- `.env.local` is git-ignored. Existing `.env.example` already has only empty `SUPABASE_BASE_URL`, `SUPABASE_API_KEY`, `TASKLY_TEST_EMAIL`, and `TASKLY_TEST_PASSWORD` names; no change needed.
- Safe live test-account smoke test passed: Login, access-token presence, refresh-token presence, Get User/account match, Refresh, and Logout all succeeded. No credential, private response, token, or secret was printed, stored, or committed.

## Files changed

- `.ai/reports/authentication-plan.md`
- `docs/API_CONTRACT.md`
- `docs/api/taskly.postman_collection.json`

## Decisions

- Verified Auth requests: Sign Up `POST /auth/v1/signup` (`email`, `password`, `data.name`, `data.department`); Login `POST /auth/v1/token?grant_type=password` (`email`, `password`); Get User `GET /auth/v1/user`; Update Password `PUT /auth/v1/user` (`password`); Refresh `POST /auth/v1/token?grant_type=refresh_token` (`refresh_token`); Forgot Password `POST /auth/v1/recover` (`email`); Logout `POST /auth/v1/logout`. All use `apikey`; Get User, Update Password, and Logout additionally use Bearer access token. Login/Refresh Postman scripts read/store access and refresh token variables; saved response/error examples are absent.
- Projects/Epics/Tasks collection requests use both `apikey` and `Authorization: Bearer {{access_token}}`; this verifies request convention only, not RLS policy.
- Final architecture: `Browser -> Next.js server boundary -> Supabase REST/Auth API`, using focused server-only native `fetch`. The server owns HttpOnly, Secure-in-production, SameSite=Lax session cookies; browser code never receives API key/access token/refresh token. Server-side current-user lookup protects pages; expired access attempts one server-side refresh, then clears cookies and redirects on failure. Logout calls the API then clears cookies. No localStorage tokens, browser refresh timer, Redux, Auth Context, generic API wrapper, or Supabase client library.
- Exact App Router URLs, recovery callback/token transport, and post-auth destination are not established by Figma/Postman; do not invent them before implementation approval.
- Server Components are default; narrow Client Components own RHF interaction, password visibility, validation feedback, and submission state. Validate again with Zod at the server boundary and normalize only verified safe error fields. Preserve the designed non-enumerating Forgot Password confirmation.
- `react-hook-form` and `zod` are justified when implementation is approved; do not install yet. `sonner` remains unjustified because feedback is inline. SVGR waits for verified asset extraction. Redux Toolkit, Axios, TanStack Query, React Router, and Supabase client packages are not justified.
- Test plan: Vitest/RTL coverage for accessible forms/links, Zod schemas, designed validation/submission states, safe error mapping, and redirect rendering; mocked-native-fetch server-boundary tests for Login/Get User/Refresh/Logout. Add Playwright only if cookie redirect/recovery handoff cannot be covered otherwise. Visual QA compares all eight frames at 1280px and 390px, including keyboard/focus, touch targets, visibility controls, recovery success/resend, and reset requirements.
- agy readiness passed in the actual delegation environment: `agy --mode plan --print` returned exactly `AGY AUTH OK.` The sandboxed shell alone cannot write agy's user-profile logs or access required credentials/network and falsely reported it unauthenticated. `.delegate/config.json` uses the same `agy` executable with no lane-specific override, so frontend, fixes, and tests lanes are ready; no delegation occurred.

## Validation

- `HEAD` and `origin/main` both resolve to `d0379f38b84d393b3df61cddac1b2380924451ea`; branch is `main`. At continuation start, only the prior report and the user-supplied untracked collection were present; no Authentication implementation exists in tracked application sources.
- Read `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/API_CONTRACT.md`, and the prior report.
- Figma MCP inspected canvas `0:1`, enumerated all eight Auth frames, and read their visible text/state sections.
- `git check-ignore -v .env.local` confirmed `.gitignore:32:.env*`. The sanitized collection was structurally inspected before committing and contains no source-sensitive collection variable, real email, private account value, API key, access token, refresh token, or real password; its only passwords/emails are clearly fake placeholders. The original supplied input collection was removed from the working tree.
- Live smoke test: Login success; access token yes; refresh token yes; Get User success; account match yes; Refresh success; Logout success. The sandbox-only attempt was network-blocked; the approved-network retry returned HTTP 200 and enabled the safe complete test.
- Sandboxed `agy --mode plan --print` failed with profile-log access denied, network denial, and a false unauthenticated result. The identical approved unsandboxed command returned exactly `AGY AUTH OK.`; this is the same environment used for delegation.
- `npm run check` was not run because only docs/report/sanitized collection artifacts changed.

## Issues / Risks

- Still unknown: exact response/error JSON/statuses, signup confirmation/session behavior, email verification, recovery redirect/callback, password-update session rules, token lifetime/rotation, refresh/logout semantics, rate limits, redirect allowlist, RLS/claims policy, and persistence of `data.department` versus Figma Job Title.
- Product decisions required: actual Auth URLs and post-login destination; Figma does not establish them.
- The prior agy discrepancy is environmental: sandboxed execution cannot access agy's credential/profile environment. Delegate agy only through the established unsandboxed delegation path.

## Next step

- Resolve the remaining product/backend decisions. Then obtain explicit implementation approval before creating a feature branch, installing dependencies, or building Authentication. Authentication implementation has not started.
