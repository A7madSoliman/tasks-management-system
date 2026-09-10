# Project Layout Shell — Implementation Brief

## Goal

Implement the reusable authenticated `/project` shell only: header/profile, desktop expanded/collapsed sidebar, compact burger/drawer, persistent compact Bottom Navigation, nested page-content slot, existing logout, and surface-only loading. Follow `specs/001-project-layout-shell/tasks.md` in order (T001–T018).

## Acceptance Criteria

- `/project` and future nested Project routes share the authenticated layout; unauthenticated access redirects to `/login`.
- Header uses a safe display-only profile: name, optional title, and initials avatar.
- Desktop at width >=1024px: default 256px labelled sidebar, collapsible 80px icon-only sidebar, no burger and no Bottom Navigation.
- Compact below 1024px: no desktop sidebar, burger/header, 288px drawer and persistent 64px Bottom Navigation.
- Drawer sits above dim/blur overlay; overlay sits above content and Bottom Navigation; Bottom Navigation is non-interactive while drawer is open; content reserves its height.
- Projects is the only real navigation link. Epics, Tasks, Members and Details are accessible non-links without fake hrefs.
- Logout uses only `POST /api/auth/logout`, prevents duplicate pending activation, redirects to `/login` after an accepted response, and keeps current route with existing safe error handling on failure.
- Loading uses only approved surface/background, border and shadow—no skeleton, spinner, fake data or invented timing.

## Approved Architecture

- `src/app/project/layout.tsx` is async Server Component owner of `getCurrentUser()`, redirect, server profile mapping and nested `children`.
- `src/app/project/page.tsx` removes duplicate auth/redirect work and is content-only.
- One Client `ProjectShell` owns only local sidebar collapse, compact drawer and a11y interaction state. Preserve server-composed `children`.
- Client components receive only `ShellUserProfile`; never import `auth-server`, `getCurrentUser`, `logout`, cookies or Supabase code.

## Exact Figma Nodes

- File `oL1WORO4G2iuQfSGPd4qvS`
- Desktop expanded: `1:986`
- Desktop collapsed: `1:733`
- Mobile menu open: `1:553`
- Mobile menu closed: `1:401`
- Style Guide: `76:1757`

Inspect these exact nodes through Figma MCP before UI work. Generated Figma code is reference only, never copy it verbatim.

## Exact SVG Asset Inventory

Download and commit exact Figma exports under `src/features/project-shell/assets/svg/`, then import them through the SVGR registry `src/features/project-shell/assets/project-shell-assets.ts`.

| Asset                        | Exact Figma layers                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Logo                         | `1:986/2:26`, `1:733/2:32`, `1:553/2:54`                                                                        |
| Projects                     | `1:986/1:1180`, `1:733/1:740`, `1:553/1:694`, `1:401/15:269`                                                    |
| Epics                        | `1:986/1:1185`, `1:733/1:746`, `1:553/1:699`, `1:401/15:274`                                                    |
| Tasks                        | `1:986/1:1190`, `1:733/1:752`, `1:553/1:704`, `1:401/15:279`                                                    |
| Members                      | `1:986/1:1195`, `1:733/1:758`, `1:553/1:709`, `1:401/15:284`                                                    |
| Details                      | `1:986/1:1200`, `1:733/1:764`, `1:553/1:714`, `1:401/15:289`                                                    |
| Collapse                     | `1:986/1:1206`                                                                                                  |
| Expand                       | Exact rendered collapsed-sidebar action asset in `1:733` after `1:764`; verify/export through Figma during T002 |
| Burger                       | `1:401/1:517`, `1:553/1:661`                                                                                    |
| Logout                       | `1:986/1:1211`, `1:733/2:43`, `1:553/2:48`                                                                      |
| Five Bottom Navigation icons | `1:401/15:269`, `15:274`, `15:279`, `15:284`, `15:289`                                                          |

Figma `1:553`/`1:401` provide no close icon. Do not create or substitute one. Avatar photographs and dashboard/FAB assets are out of scope. Never persist temporary MCP URLs, hand-author SVG paths, or use text/emoji glyphs.

## SVGR Requirement

The repository currently uses public string-path SVGs and has no SVGR build rule. T001 is authorized to add the one required development dependency `@svgr/webpack` and a minimal `next.config.ts` SVG rule so these exact shell assets import as typed React components. This is the sole package/config addition; install no other package.

## Profile Truth Table

| Input after safe narrowing                | displayName                                | initials                                                | jobTitle                 |
| ----------------------------------------- | ------------------------------------------ | ------------------------------------------------------- | ------------------------ |
| `"Ahmed Soliman"`                         | Ahmed Soliman                              | AS                                                      | valid trimmed title only |
| `"Ahmed Ali Soliman"`                     | Ahmed Ali Soliman                          | AA                                                      | valid trimmed title only |
| `"Ahmed"`                                 | Ahmed                                      | AH                                                      | valid trimmed title only |
| Leading/repeated whitespace name          | trimmed/word-normalized valid name         | same specified rule                                     | valid trimmed title only |
| Unicode valid name                        | valid name                                 | first characters per the same rule                      | valid trimmed title only |
| One-character name                        | valid name                                 | safe non-empty result; do not invent a second character | valid trimmed title only |
| non-string/malformed `user_metadata.name` | valid email if available; otherwise `User` | email local-part if available; otherwise `US`           | valid trimmed title only |
| valid name + no usable title              | valid name                                 | computed initials                                       | omit line                |
| missing name + valid email                | email                                      | derive from email local-part                            | omit unusable title      |
| neither usable name nor email             | `User`                                     | `US`                                                    | omit line                |

Read only `user.user_metadata.name` and `user.user_metadata.job_title` after safe `unknown`/record narrowing. Do not pass raw AuthUser, raw metadata, IDs, tokens or secrets to the client.

## Responsive and State Contracts

- Use CSS-first Tailwind responsive behavior—no `window.innerWidth` as primary rendering logic.
- `lg`/1024px boundary: desktop is active at exactly 1024px and above; compact is only below it.
- Desktop local state initializes expanded; toggle controls 256px/80px sidebar only.
- Compact local state controls drawer only. Opening moves focus into drawer and locks page scroll; Escape or overlay click closes and restores focus to burger. No close button/icon is added.

## Logout and Loading Contracts

- Client shell calls `fetch('/api/auth/logout', { method: 'POST' })`; it never imports server-only auth/logout modules or reads tokens. Use the accepted route’s existing safe response behavior—do not alter backend contract or create endpoints.
- Add `src/app/project/loading.tsx` with only verified `#F9F9FF`/`#F1F3FF` surface, subtle border/shadow treatment and no simulated content.

## Accessibility Requirements

- Semantic buttons/links, visible focus styles, labels and `aria-expanded` where applicable.
- Drawer focus management, Escape dismissal, overlay pointer dismissal, focus restoration, scroll lock and safe overlay stacking.
- Inactive Bottom Navigation entries remain non-links; do not use `href="#"`.
- Desktop collapse and logout remain keyboard accessible.

## Files / Areas In Scope

- `package.json`, `pnpm-lock.yaml`, `next.config.ts` (T001 only)
- `src/features/project-shell/**`
- `src/app/project/layout.tsx`, `page.tsx`, `loading.tsx`, focused project route tests
- `src/app/globals.css` only for verified semantic token additions
- `.ai/reports/project-layout-shell-implementation.md`

## Tests Required

- Profile mapper: every truth-table row, unknown metadata, no raw-profile leakage.
- Route layout: authentication, redirect, minimal profile props, server `children` composition and page duplicate-guard removal.
- Component: header/title/avatar, logout pending/failure, desktop 256/80 and exactly 1024px, compact <1024px drawer/layering/Escape/overlay/focus/scroll-lock, Bottom Navigation semantics and content offset.
- Loading contract: no skeleton/spinner/fake data.

## Explicit Out of Scope

Projects data/list/creation; Epics, Tasks, Members behavior; Dashboard data/FAB; invitations; backend endpoints/permissions; invented routes/hrefs/icons; Redux; Supabase client; any packages other than approved `@svgr/webpack`; generic skeletons/spinners; commit/push.

## agy Validation Commands

agy may run focused feature tests and proportionate local validation only. It must not claim final acceptance gates. Codex alone later runs and claims:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
pnpm build
git diff --check
```

## Required Implementation Report

Create `.ai/reports/project-layout-shell-implementation.md` using Taskly’s report format: What changed, Files changed, Decisions, Validation, Issues / Risks, Next step. State only commands actually run and their outcomes. Then automatically run:

```powershell
scripts/copy-report.ps1 .ai/reports/project-layout-shell-implementation.md
```

Read the report back and compare it with `Get-Clipboard -Raw` for an exact UTF-8 round-trip. Do not commit or push.
