# Task Report

## What changed

- Created and switched to the requested local branch: `feat/project-layout-shell`.
- Completed evidence-only preflight for the authenticated Project Layout Shell: inspected the named project documents, focused auth/project code, exact Figma nodes `1:986`, `1:733`, `1:553`, `1:401`, and Style Guide `76:1757`.
- Created the context-engineering M1 brief at `.ai/briefs/project-layout-shell-m1.md`.
- Invoked the required Muse planning wrapper once. It stopped before dispatch because the OpenCode preflight failed with `EEXIST: file already exists, mkdir 'C:\\Users\\Ahmad\\.config\\opencode'`. This is explicitly a non-quota infrastructure/configuration failure, so fallback was correctly not activated and agy was not invoked.
- No UI, tests, API endpoints, assets, dependencies, Spec Kit artifacts, commits, pushes, or backend state were changed.

## Files changed

- `.ai/briefs/project-layout-shell-m1.md` — evidence-based M1 brief.
- `.ai/reports/project-layout-shell-preflight-m1.md` — this preflight report.

## Decisions

- The approved architecture direction is a server `src/app/project/layout.tsx` authorization/composition boundary. It obtains the session through the existing server-only `getCurrentUser()`, redirects unauthenticated visitors to `/login`, maps raw user data to a minimal serializable shell profile, and passes nested route `children` into the shell.
- A single narrow Client Component should own only transient sidebar collapse and mobile drawer state. No Redux or client auth/Supabase integration is justified.
- Mobile Bottom Navigation is required shell anatomy: Figma node `1:401` shows it in the closed mobile state while node `1:553` independently shows the drawer. It must reserve content space, but route actions/URLs cannot be invented because only `/project` exists today.
- Profile mapping must defensively narrow metadata server-side. Signup reliably writes `data.name` and optional `data.job_title`, but current `GET /auth/v1/user` repository evidence does not prove the response container/field shape. Do not expose raw auth records or tokens to the browser.
- Desktop evidence confirms 256px expanded and 80px collapsed sidebar widths, 64px top bar in the collapsed reference, and actual Figma assets must be used later. Mobile evidence confirms 288px drawer, dim/blur overlay, 64px header and 64px bottom navigation.

## Validation

- `git switch -c feat/project-layout-shell` — passed; branch created and activated.
- Loaded and followed `figma-design-to-code` guidance, then called Figma MCP design context for file `oL1WORO4G2iuQfSGPd4qvS`, nodes `1:986`, `1:733`, `1:553`, `1:401`, `76:1757` — passed.
- Reviewed the required documents and focused paths: `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/WORKFLOW.md`, `src/app/project/`, `src/features/auth/`, `src/app/api/auth/`, existing tokens/assets — completed.
- `node scripts/muse-planning-fallback.mjs --brief .ai/briefs/project-layout-shell-m1.md --cwd .` — stopped (exit 1): OpenCode/Muse preflight failed on an `EEXIST` configuration error. Wrapper classified it as non-quota; no fallback or agy dispatch occurred, per workflow.
- Quality gates were intentionally not run: this preflight makes no application-code changes and implementation has not started.

## Issues / Risks

- M1 advisory review is unavailable until the OpenCode configuration/preflight `EEXIST` issue is fixed; it must be retried at the next eligible M1/M2 pass. No quota/rate-limit evidence exists, so invoking planningFallback/agy would violate the required fallback rules.
- Auth runtime metadata remains unverified: existing signup writes `data.name` and optional `data.job_title`, while `AuthUser` is index-signature broad and no saved `/auth/v1/user` response schema exists. A safe server-side mapper is required; exact fallback/display semantics need verified evidence or product direction.
- Figma does not expose the desktop/tablet breakpoint threshold, bottom-nav destination behavior, or a dedicated loading design in the supplied nodes. The contextual FAB/dashboard material in mobile Figma is excluded from this shell.
- `scripts/copy-report.ps1 .ai/reports/project-layout-shell-preflight-m1.md` copied this report to the Windows clipboard; a subsequent `Get-Clipboard -Raw` comparison against the UTF-8 source completed an exact round-trip verification.

## Next step

Fix the OpenCode planning preflight configuration, then rerun the required Muse M1 pass with the existing brief before Spec Kit generation. Keep implementation blocked until Codex has recorded M1 advisory findings, reconciled metadata/breakpoint/navigation ambiguities, and approved the final feature specification.
