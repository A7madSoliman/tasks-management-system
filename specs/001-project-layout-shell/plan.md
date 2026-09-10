# Implementation Plan: Authenticated Project Layout Shell

**Branch**: `feat/project-layout-shell` | **Date**: 2026-09-09 | **Spec**: [spec.md](spec.md)

## Summary

Create an authenticated, reusable `/project` route shell from the exact Figma states. A server layout verifies the existing session and maps a minimal display profile; a narrow client shell owns only desktop collapse and compact drawer interaction. Future Project routes render as server-composed `children`. Existing logout is wired through its accepted server boundary. No project data, endpoint, Redux or browser auth work is included; `@svgr/webpack` is the documented sole development dependency required for Figma SVG imports.

## Technical Context

**Language/Version**: TypeScript (strict), Node 24.20 policy
**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 4; existing test stack Vitest and Testing Library; planned development-only `@svgr/webpack` for the required shell SVG component workflow
**Storage**: Existing server-managed HttpOnly auth cookies only; no feature data storage
**Testing**: Vitest, Testing Library, repository lint/typecheck/build
**Target Platform**: Responsive web application
**Project Type**: Next.js web application
**Performance Goals**: No new network request or client authentication fetch for shell rendering; authenticated user lookup remains server-side once at layout boundary
**Constraints**: >=1024px desktop sidebar; <1024px burger/drawer + persistent Bottom Navigation; no raw user/token/secrets in client props; use exact Figma assets through SVGR. `@svgr/webpack` plus its minimal Next config is the sole concrete dependency/config addition, required because the repository has no SVGR workflow.
**Scale/Scope**: One shell layout and its focused tests, applied to `/project` and future nested Project routes

## Constitution Check

| Principle                                 | Status | Evidence / Decision                                                                                                                                      |
| ----------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Authority and Evidence-First Decisions | PASS   | Spec cites Figma `1:986`, `1:733`, `1:553`, `1:401`, `76:1757`; existing auth and approved Product Owner decisions; no invented destinations.            |
| II. Source-of-Truth Discipline            | PASS   | Figma, current auth boundary and approved decisions override assumptions; unverified Bottom Navigation destinations remain intentionally non-navigating. |
| III. Architecture and Security Invariants | PASS   | Server layout calls `getCurrentUser()`; client receives only mapped display profile; no client auth, tokens, secret or endpoint.                         |
| IV. Design and Quality Discipline         | PASS   | Exact desktop/mobile states, local exported Figma assets, tokens, keyboard/focus tests and all quality gates are planned.                                |
| V. Spec Kit Execution Boundary            | PASS   | This plan is planning only; later implementation is separately delegated after M2 approval.                                                              |

Post-design re-check: PASS. No constitution exception or complexity tracking is required.

## Project Structure

### Documentation

```text
specs/001-project-layout-shell/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── shell-ui-contract.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
src/
├── app/
│   └── project/
│       ├── layout.tsx                 # Server auth guard, profile mapper and children composition
│       ├── page.tsx                   # Existing minimal destination replaced only as needed for content slot
│       └── loading.tsx                # Surface-only content loading treatment
├── features/
│   ├── auth/
│   │   └── server/auth-server.ts      # Existing getCurrentUser/logout boundary, reused unchanged where possible
│   └── project-shell/
│       ├── assets/
│       │   ├── project-shell-assets.ts
│       │   └── svg/                    # Exact committed Figma SVG source exports for SVGR imports
│       ├── components/
│       │   ├── ProjectShell.tsx       # Narrow client interaction owner
│       │   ├── ProjectShell.test.tsx
│       │   ├── ProjectNavigation.tsx
│       │   ├── ProjectProfile.tsx
│       │   └── ProjectBottomNav.tsx
│       └── profile.ts                 # Server-safe profile mapping and initials helper
├── app/globals.css                    # Existing verified semantic tokens only if required by Figma evidence
next.config.ts                          # Add minimal SVGR webpack rule
```

**Structure Decision**: Use a route-local server layout for authorization and nested composition; group reusable shell UI and profile mapping under `features/project-shell`. Keep static/presentational pieces server-compatible where practical, but the stateful composition owner is one Client Component.

## Implementation Phases

1. Establish the one required SVGR configuration/development dependency, exact Figma asset inventory, server profile mapper and helper tests.
2. Add the server `/project/layout.tsx` guard and server-composed content slot.
3. Build the desktop header/sidebar states and wire existing logout through an accessible client action to its existing server route/boundary.
4. Build compact header/drawer and persistent Bottom Navigation, including exact z-index layering, Escape/overlay dismissal, focus and scroll interaction management.
5. Add surface-only loading treatment and focused interaction/auth/profile tests; run repository quality gates.

## Complexity Tracking

No constitution violations requiring justification.
