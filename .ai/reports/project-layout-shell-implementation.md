# Task Report: Authenticated Project Layout Shell Implementation

## What changed

- Implemented the reusable authenticated `/project` shell in accordance with `specs/001-project-layout-shell/tasks.md` (T001–T018), the implementation brief, and subsequent Codex review fixes.
- **T001**: Confirmed development dependency `@svgr/webpack` and established minimal SVG webpack and Turbopack rules in `next.config.ts`.
- **T002**: Downloaded and registered exact Figma SVG asset exports into `src/features/project-shell/assets/svg/` and registered typed SVGR component imports in `src/features/project-shell/assets/project-shell-assets.ts`. In accordance with Figma nodes, no synthetic close icon was created.
- **T003 & T004**: Implemented server-safe `ShellUserProfile` mapping and initials derivation in `src/features/project-shell/profile.ts`. Applied Codex correction: when name is unusable and email is the fallback, `jobTitle` is omitted even if `user_metadata.job_title` is valid, adhering strictly to the approved truth table. Validated 100% of truth-table cases (including 17 unit tests) and anti-leakage invariants in `src/features/project-shell/profile.test.ts`.
- **T005 & T006**: Implemented `src/app/project/layout.tsx` as an async Server Component that checks `getCurrentUser()`, redirects unauthenticated visitors to `/login`, maps safe profile data, and composes `children`. Verified via `src/app/project/layout.test.tsx`.
- **T007**: Refactored `src/app/project/page.tsx` to be content-only by eliminating duplicate authentication and redirect logic.
- **T008–T010 (US1)**: Implemented `src/features/project-shell/components/ProjectShell.tsx` and `src/features/project-shell/components/ProjectProfile.tsx` consuming only `ShellUserProfile`. Wired client logout calling `POST /api/auth/logout`, disabling duplicate submissions while pending, redirecting to `/login` upon success, and providing safe error feedback on failure while retaining the current route. Tested in `src/features/project-shell/components/ProjectShell.test.tsx`.
- **T011 & T012 (US2)**: Implemented CSS-first desktop sidebar navigation (>=1024px) in `src/features/project-shell/components/ProjectNavigation.tsx` supporting default 256px expanded and 80px collapsed states from Figma `1:986` and `1:733`. Projects is the sole active link (`/project`). Applied Codex correction: replaced inactive Epics, Tasks, Members, and Details elements with honest, accessible non-link presentation semantics (`<div>` elements without `role="button"`, without `aria-disabled`, without fake `href`s, and non-interactive).
- **T013–T015 (US3)**: Implemented compact navigation (<1024px) with header burger control, 288px drawer, dim/blur overlay, Escape and overlay dismissal, focus restoration, and scroll lock from Figma `1:553` and `1:401`. Implemented persistent 64px compact Bottom Navigation (`ProjectBottomNav.tsx`) with reserved content offset (`pb-16 lg:pb-0`) and inert behavior (`aria-hidden`, `pointer-events-none`) when the drawer is open. Replaced inactive items in drawer and bottom navigation with honest non-link presentation semantics.
- **T016**: Created surface-only loading state in `src/app/project/loading.tsx` using verified background, border, and subtle shadow without any skeleton, spinner, or fake data. Verified in `src/app/project/loading.test.tsx`.
- **T017**: Reviewed styles against Figma nodes `1:986`, `1:733`, `1:553`, `1:401`, and Style Guide `76:1757`, matching tokens defined in `src/app/globals.css`.
- **T018**: Executed proportionate feature tests and local validation. Applied Codex correction to `vitest.config.mts`: removed hand-written fs-based transformer with `dangerouslySetInnerHTML`, replacing it with a minimal Vite transform plugin (`svg-test-loader`) returning a standard React forwardRef component without extra packages or hand-authored SVG markup. Preserved approved `@svgr/webpack` production configuration.

## Files changed

- `next.config.ts`
- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.mts`
- `specs/001-project-layout-shell/tasks.md`
- `src/app/project/layout.tsx`
- `src/app/project/layout.test.tsx`
- `src/app/project/loading.tsx`
- `src/app/project/loading.test.tsx`
- `src/app/project/page.tsx`
- `src/features/project-shell/assets/project-shell-assets.ts`
- `src/features/project-shell/assets/svg/bottom-nav-details.svg`
- `src/features/project-shell/assets/svg/bottom-nav-epics.svg`
- `src/features/project-shell/assets/svg/bottom-nav-members.svg`
- `src/features/project-shell/assets/svg/bottom-nav-projects.svg`
- `src/features/project-shell/assets/svg/bottom-nav-tasks.svg`
- `src/features/project-shell/assets/svg/burger.svg`
- `src/features/project-shell/assets/svg/collapse.svg`
- `src/features/project-shell/assets/svg/details.svg`
- `src/features/project-shell/assets/svg/epics.svg`
- `src/features/project-shell/assets/svg/expand.svg`
- `src/features/project-shell/assets/svg/logo.svg`
- `src/features/project-shell/assets/svg/logout.svg`
- `src/features/project-shell/assets/svg/members.svg`
- `src/features/project-shell/assets/svg/projects-collapsed.svg`
- `src/features/project-shell/assets/svg/projects.svg`
- `src/features/project-shell/assets/svg/tasks.svg`
- `src/features/project-shell/components/ProjectBottomNav.tsx`
- `src/features/project-shell/components/ProjectNavigation.tsx`
- `src/features/project-shell/components/ProjectProfile.tsx`
- `src/features/project-shell/components/ProjectShell.tsx`
- `src/features/project-shell/components/ProjectShell.test.tsx`
- `src/features/project-shell/profile.ts`
- `src/features/project-shell/profile.test.ts`
- `src/types/svg.d.ts`
- `.ai/reports/project-layout-shell-implementation.md`

## Decisions

- **Server-to-shell boundary**: `src/app/project/layout.tsx` is the sole server authentication and profile mapping boundary for `/project` and future nested routes. Client components receive only `ShellUserProfile` containing `displayName`, optional `jobTitle`, and `initials`. No tokens, secrets, user IDs, or cookies cross this boundary.
- **Profile Truth Table Fidelity**: When user name is unusable/missing and email fallback is used, `jobTitle` is omitted from `ShellUserProfile` even if metadata contains `job_title`.
- **Honest Non-Link Presentation Semantics**: Inactive navigation elements (Epics, Tasks, Members, Details) across expanded sidebar, collapsed sidebar, drawer, and bottom navigation are plain presentation elements without `role="button"`, without `aria-disabled`, without `tabIndex`, and without fake `href`s.
- **Minimal Vitest SVG Handling**: Test runner uses a lightweight Vite transform hook (`svg-test-loader`) returning a React forwardRef SVG element without reading files from disk, without `dangerouslySetInnerHTML`, and without hand-authored SVG markup. Production uses `@svgr/webpack` with Turbopack and Webpack.
- **Narrow client state owner**: `ProjectShell.tsx` is the single client state owner managing local sidebar collapse, drawer visibility, focus restoration, scroll locking, and logout submission state.
- **No synthetic close icon**: Figma nodes `1:553` and `1:401` contain no drawer close button; drawer dismissal is performed strictly via backdrop overlay click and the Escape key, restoring keyboard focus to the burger button.
- **Loading presentation**: In accordance with the loading contract and PO instructions, `loading.tsx` uses surface/background, border, and shadow styling only; no skeleton animations or spinners are introduced.

## Validation

The following proportionate commands were executed and passed during agy implementation and Codex review fixes:

- `pnpm vitest run src/features/project-shell/profile.test.ts` — PASSED (17 unit tests covering all profile truth-table rows and anti-leakage requirements).
- `pnpm vitest run src/app/project/layout.test.tsx` — PASSED (4 tests covering server auth guard, redirect, minimal profile props, and content-only page).
- `pnpm vitest run src/app/project/loading.test.tsx` — PASSED (1 test verifying surface-only loading without skeletons, spinners, or simulated data).
- `pnpm vitest run src/features/project-shell/components/ProjectShell.test.tsx` — PASSED (12 component tests covering desktop expanded/collapsed navigation, compact drawer, overlay/Escape dismissal, scroll lock, focus restoration, Bottom Navigation semantics, honest non-link presentation, and logout behavior).
- `pnpm test` — PASSED (24 test files, 195 tests total across repository).
- `pnpm typecheck` — PASSED (`next typegen && tsc --noEmit` exited with code 0).
- `pnpm lint` — PASSED (`eslint . --max-warnings=0` exited with code 0).
- `pnpm format:check` — PASSED (`prettier --check .` reported all matched files use Prettier code style).
- `pnpm build` — PASSED (`next build` compiled routes including dynamic `/project` successfully).
- `git diff --check` — PASSED (0 whitespace errors).

Codex independently reran and observed the final acceptance gates after the corrective delegation:

- `pnpm lint` — PASSED.
- `pnpm typecheck` — PASSED.
- `pnpm test` — PASSED (24 files, 195 tests).
- `pnpm format:check` — PASSED.
- `pnpm build` — PASSED; `/project` is dynamic/server-rendered.
- `git diff --check` — PASSED with no whitespace errors.

## Issues / risks and intentionally unresolved items

- Projects data listing, project creation, and detail views remain intentionally unimplemented in this shell-only slice.
- Navigation destinations for Epics, Tasks, Members, and Details remain non-navigating until their respective feature specifications and backend endpoints are defined.
- No git commits or pushes have been executed; working tree is preserved for Codex review and acceptance.

## Next step

Implementation and Codex review are complete. No commit, push, or pull request was created.

## Follow-up Fixes

- Mobile drawer: removed the bottom drawer profile name/title block while retaining Logout and the normal header avatar.
- Desktop collapse direction: retained the verified Figma expand asset and applied the opposite visual state to the collapsed-sidebar control; expanded and collapsed controls now point in opposite directions.
- Header profile: valid `ShellUserProfile.jobTitle` renders beneath the desktop display name; missing titles remain omitted.
- Root routing/recovery: replaced the visible scaffold with a neutral client bootstrap. Normal `/` visits query the existing `/api/auth/user` boundary and route to `/project` or `/login`. Recovery fragments remain in `RecoveryFragmentBootstrap`, preserving the existing token handoff to `/reset-password` without a server redirect that could discard the fragment.

## Follow-up Validation

- `pnpm test -- src/app/page.test.tsx` — PASSED (1 test).
- `pnpm test -- src/features/auth/components/RootRouteBootstrap.test.tsx src/features/project-shell/components/ProjectShell.test.tsx` — PASSED (15 tests).
- `pnpm lint` — PASSED.
- `pnpm typecheck` — PASSED.
- `pnpm test` — PASSED (25 files, 198 tests).
- `pnpm build` — PASSED; `/project` remains dynamic and the root scaffold is absent.
- `git diff --check` — PASSED.
- `scripts/copy-report.ps1 .ai/reports/project-layout-shell-implementation.md` with exact UTF-8 comparison — pending final copy below.
- `pnpm format:check` — PASSED after formatting the two root-routing test files with the repository Prettier script.

## Final Acceptance

Codex final acceptance: **ACCEPTED**. All required official gates are passing, and no blockers remain. No commit, push, or pull request was created.

## Final Visual Correction

- Updated the desktop `ProjectProfile` text block to explicitly match Figma node `1:986`: display name and mapped `jobTitle` use distinct 20px line boxes, with the initials avatar beside the complete two-line block. The title remains conditional and is never hardcoded.
- Added a focused structural assertion that the desktop profile text block contains both lines and that the avatar remains its adjacent sibling. Mobile profile behavior and the initials contract were unchanged.

## Final Visual Validation

- `pnpm test -- src/features/project-shell/components/ProjectShell.test.tsx` — PASSED (12 tests).
- `git diff --check` — PASSED.
- Codex reviewed the resulting diff; scope is limited to the profile component and its focused test.

## Profile Compatibility Correction

- Verified runtime evidence shows legacy authenticated users may provide `user_metadata.department` while `job_title` is absent; current signup continues to write `job_title`.
- Updated the server-safe mapper precedence to use trimmed non-empty `job_title`, then trimmed non-empty legacy `department`, otherwise omit `ShellUserProfile.jobTitle`. Client components still consume only the mapped `ShellUserProfile.jobTitle` field.
- Updated the relevant spec, data model, UI contract, and research artifacts to record this compatibility rule. No auth architecture or client metadata handling changed.

## Compatibility Validation

- `pnpm test -- src/features/project-shell/profile.test.ts src/features/project-shell/components/ProjectShell.test.tsx` — PASSED (34 tests), including job-title precedence, department-only fallback, blank/malformed fallback, and omission cases.
- `git diff --check` — PASSED.
- The local HTTP probe confirmed no active authenticated session was available (`/project` returned the expected unauthenticated redirect). The supplied verified runtime evidence was used without logging or printing any token, secret, cookie, ID, or full auth payload; focused mapper tests confirm the existing department-backed user receives a non-empty mapped title.

## Final Profile Typography Correction

- Re-inspected Figma node `1:986` and Style Guide `76:1757`.
- Kept the verified Inter typography: display name 14px semibold with 20px line-height; job title 10px bold with 20px line-height, 1px tracking, uppercase, and verified colors. Preserved the 16px text-to-avatar gap and 40px avatar.
- Centered the mapped name/title text block relative to itself while keeping the avatar beside the combined block and preserving conditional title omission.

## Final Profile Validation

- `pnpm test -- src/features/project-shell/components/ProjectShell.test.tsx` — PASSED (12 tests), including valid-title layout, missing-title behavior, and unchanged mobile shell coverage.
- `git diff --check` — PASSED.
- Codex reviewed the resulting diff; only `ProjectProfile` alignment and its focused assertion changed.

## Final Git Closeout Review

- Codex re-inspected the user’s manual desktop profile font edit against Figma `1:986` and Style Guide `76:1757`. The manual edit was **corrected**: display name is Inter semibold 14px/20px and job title is Inter bold 10px/20px with 1px tracking and uppercase casing. Center alignment, 16px group spacing, 40px avatar, dynamic `jobTitle`, omission behavior, and mobile behavior were preserved.
- Codex removed only the stale unused `profile` prop from `ProjectNavigation` after the accepted mobile drawer profile removal caused the final lint gate to flag it.
- Complete diff review found no unrelated files; all changes are within the approved Project Layout Shell implementation, planning artifacts, reports, briefs, and focused tests.
- `pnpm check` — PASSED on the final working tree after the bounded stale-prop correction.
- `git diff --check` — PASSED.
- Final acceptance: **FINAL ACCEPTED**.
