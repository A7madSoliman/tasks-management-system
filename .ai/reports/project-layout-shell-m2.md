# Task Report

## What changed

- Recorded the successful external Muse M2 advisory review: `status: muse`, `exitCode: 0`, with no fallback.
- Resolved every M2 concern in the planning package and created the self-contained frontend implementation brief.
- Updated the shell planning artifacts for the exact SVG inventory, SVGR workflow, profile fallback truth table, page/layout boundary, responsive drawer/Bottom Navigation contract, logout behavior, and gate ownership.
- Expanded the bounded implementation plan from 17 to 18 tasks to make the required SVGR configuration and exact asset-export work explicit.
- Corrected the compact-navigation test wording to the approved Escape/overlay-only dismissal and corrected the documented source-tree asset nesting.

## Files changed

- `specs/001-project-layout-shell/spec.md`
- `specs/001-project-layout-shell/plan.md`
- `specs/001-project-layout-shell/tasks.md`
- `specs/001-project-layout-shell/data-model.md`
- `specs/001-project-layout-shell/contracts/shell-ui-contract.md`
- `specs/001-project-layout-shell/research.md`
- `specs/001-project-layout-shell/quickstart.md`
- `.ai/briefs/project-layout-shell-implementation.md`
- `.ai/reports/project-layout-shell-m2.md`

## Decisions

- **Assets — RESOLVED.** Exact Figma nodes were inspected again. The inventory covers the logo; Projects, Epics, Tasks, Members, Details; collapse/expand; burger; logout; and five Bottom Navigation icons. Figma supplies no separate close asset, so drawer dismissal is Escape or overlay activation rather than an invented icon.
- **SVGR — RESOLVED.** Current public string-path `<img>` usage and the absent SVGR configuration do not meet the established Taskly SVG architecture. The sole planned dependency/config change is development-only `@svgr/webpack` plus a minimal Next.js SVG rule; it is not installed in this planning slice and no other package is authorized.
- **Profile contract — RESOLVED.** The mapper reads only safely narrowed `user.user_metadata.name` and `user.user_metadata.job_title`. A usable name wins; otherwise a usable email is displayed with local-part initials; absent/unusable name and email becomes `User` / `US`; unavailable title is omitted. Raw AuthUser, IDs, metadata, tokens, and secrets do not enter Client Components.
- **Route boundary — ACCEPTED.** Async `src/app/project/layout.tsx` owns `getCurrentUser()`, redirect, server-side `ShellUserProfile` mapping, and `children`; `page.tsx` becomes content-only.
- **Responsive/navigation — RESOLVED.** CSS-first behavior uses desktop sidebar states at `>= 1024px` and burger, 288px drawer, and persistent 64px Bottom Navigation below that breakpoint. The drawer and overlay sit above the Bottom Navigation, which is non-interactive while open; content reserves bottom space. Only Projects is a verified link; other navigation items are accessible non-links.
- **Logout — RESOLVED.** The Client shell calls only existing `POST /api/auth/logout`, disables the action while pending, redirects to `/login` only after success, and uses existing safe error handling on failure. It never imports server-only auth code.
- **Accessibility/testing — ACCEPTED.** The drawer contract includes focus return, Escape, overlay dismissal, and scroll lock. agy may perform focused checks only; Codex alone owns final lint, typecheck, test, format, build, and diff checks.
- The implementation package is **APPROVED FOR AGY**. agy has not been invoked.

## Validation

- Re-read the approved M2 brief, all feature Spec Kit artifacts, and the supplied external Muse M2 findings.
- Re-inspected exact Figma nodes `1:986`, `1:733`, `1:553`, `1:401`, and `76:1757` in file `oL1WORO4G2iuQfSGPd4qvS`.
- Re-checked repository SVG/Next configuration: no SVGR setup exists; legacy assets use public string paths.
- Re-ran the Spec Kit analyze prerequisite/consistency workflow after material planning updates. Result: no CRITICAL/HIGH contradictions, no constitution conflicts, no coverage gaps; all 12 functional requirements map to the 18 ordered tasks.
- No application implementation, dependency installation, agy dispatch, commit, or push occurred.

## Issues / Risks

- The one required SVGR development dependency and Next.js configuration remain planned work for implementation; neither is installed or changed now.
- Figma exports must be downloaded from the exact assets during implementation; temporary MCP asset URLs must not be persisted.
- The mobile design intentionally has no separate close icon. Future navigation destinations remain intentionally absent; only `/project` is linked.

## Next step

Provide `.ai/briefs/project-layout-shell-implementation.md` to the frontend agy lane for the bounded implementation. Codex must then independently review the resulting diff and run the final repository gates before acceptance.
