# Tasks: Authenticated Project Layout Shell

**Input**: Design documents from `/specs/001-project-layout-shell/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/shell-ui-contract.md`, `quickstart.md`

**Tests**: Focused unit/component/route tests are required by the feature and Taskly quality rules. Write them before or alongside their bounded implementation task as stated below.

## Phase 1: Setup and shared foundations

**Purpose**: Establish exact asset and safe identity foundations before any composed shell UI.

- [x] T001 Add the required development-only `@svgr/webpack` dependency and minimal SVG import rule in `package.json`, `pnpm-lock.yaml`, and `next.config.ts`; record that this is the sole planned package addition required by Taskly SVG policy
- [x] T002 Download exact Figma shell SVG exports into `src/features/project-shell/assets/svg/` and register typed SVGR component imports in `src/features/project-shell/assets/project-shell-assets.ts`: logo, Projects, Epics, Tasks, Members, Details, collapse, expand, burger, logout, and five compact Bottom Navigation icons; do not create a close icon because Figma nodes provide none
- [x] T003 [P] Add server-safe `ShellUserProfile` mapping and initials helpers reading only safely narrowed `user_metadata.name` and `user_metadata.job_title`, using approved email then `User`/`US` fallbacks, in `src/features/project-shell/profile.ts`
- [x] T004 [P] Add unit tests for exact profile truth-table cases, malformed metadata and no raw-profile leakage in `src/features/project-shell/profile.test.ts`

**Checkpoint**: Exact assets and display-only profile contract are ready; no raw auth data crosses a client boundary.

---

## Phase 2: Foundational server route boundary

**Purpose**: Create the reusable authenticated layout and retain server-composed nested content.

- [x] T005 Add route-layout tests for authenticated rendering, unauthenticated `/login` redirect, minimal profile props and nested `children` composition in `src/app/project/layout.test.tsx`
- [x] T006 Implement async auth guard, `getCurrentUser()` call, server-side profile mapping and `children` composition in `src/app/project/layout.tsx`
- [x] T007 Remove duplicate `getCurrentUser()`/redirect logic and make the existing route content-only in `src/app/project/page.tsx`

**Checkpoint**: `/project` and future nested Project routes share one authenticated server boundary.

---

## Phase 3: User Story 1 - Reach the authenticated workspace (Priority: P1) 🎯 MVP

**Goal**: Deliver identity header, safe logout and reusable content frame.

**Independent Test**: With a valid profile fixture, render header identity and a child page; activate logout and verify `/login`; unauthenticated layout redirects without identity output.

- [x] T008 [US1] Create the narrow interaction-only shell frame and accessible header/profile presentation using only `ShellUserProfile` props in `src/features/project-shell/components/ProjectShell.tsx` and `src/features/project-shell/components/ProjectProfile.tsx`
- [x] T009 [US1] Wire only `POST /api/auth/logout` from the client shell; disable duplicate activation while pending, redirect to `/login` after an accepted response, and retain current route with existing safe auth error messaging on failure in `src/features/project-shell/components/ProjectShell.tsx`
- [x] T010 [US1] Add focused profile/header/logout pending/failure tests in `src/features/project-shell/components/ProjectShell.test.tsx`

**Checkpoint**: Authenticated users see safe identity and can terminate their session; server `children` remain visible inside the shell.

---

## Phase 4: User Story 2 - Use desktop navigation efficiently (Priority: P2)

**Goal**: Deliver exact desktop expanded/collapsed shell states for widths >=1024px.

**Independent Test**: At desktop width, toggle keyboard/pointer collapse and verify 256px labelled and 80px icon-only states, content retention and accessible state.

- [x] T011 [US2] Implement CSS-first >=1024px desktop header/sidebar navigation, active Projects treatment, 256px expanded state and 80px collapsed state from Figma `1:986` and `1:733` in `src/features/project-shell/components/ProjectNavigation.tsx` and `src/features/project-shell/components/ProjectShell.tsx`
- [x] T012 [US2] Add desktop collapse, exact-1024px and accessible-control tests in `src/features/project-shell/components/ProjectShell.test.tsx`

**Checkpoint**: Desktop shell matches both verified sidebar states without creating future navigation destinations.

---

## Phase 5: User Story 3 - Use compact navigation on tablet and mobile (Priority: P3)

**Goal**: Deliver burger drawer and persistent Bottom Navigation below 1024px.

**Independent Test**: At compact width, burger opens a 288px drawer; Escape or overlay dismissal restores focus; Bottom Navigation remains visible and does not obscure content.

- [x] T013 [US3] Implement CSS-first <1024px burger header, labelled 288px drawer above its dim/blur overlay, Escape/overlay dismissal, focus restoration and scroll lock from Figma `1:553` and `1:401`; do not add a close icon absent from Figma in `src/features/project-shell/components/ProjectShell.tsx` and `src/features/project-shell/components/ProjectNavigation.tsx`
- [x] T014 [US3] Implement persistent 64px compact Bottom Navigation beneath the open overlay, with reserved content space, exact Figma labels/assets, Projects as only `Link`, and accessible non-link semantics for Epics/Tasks/Members/Details in `src/features/project-shell/components/ProjectBottomNav.tsx`
- [x] T015 [US3] Add compact breakpoint, drawer layering/Escape/overlay/focus/scroll-lock and Bottom Navigation non-link interaction tests in `src/features/project-shell/components/ProjectShell.test.tsx`

**Checkpoint**: Compact shell contains both authoritative navigation systems and remains keyboard usable.

---

## Phase 6: Loading and cross-cutting quality

**Purpose**: Add only the approved loading treatment, verify responsive visual-token use and independently run quality gates.

- [x] T016 Add a surface/background plus subtle border/shadow-only loading presentation, without skeleton/spinner/fake data, in `src/app/project/loading.tsx`
- [x] T017 Review shell styles against Figma `1:986`, `1:733`, `1:553`, `1:401`, and Style Guide `76:1757`; use or minimally extend verified semantic tokens only in `src/app/globals.css` and project-shell components
- [x] T018 Run proportionate feature tests and local validation; record results without claiming Codex final acceptance gates in `.ai/reports/project-layout-shell-implementation.md`

## Dependencies & Execution Order

- T001 must precede T002. T003/T004 may proceed in parallel after their source contract is agreed; both precede T006/T008.
- T005-T007 establish the server boundary before the client shell work.
- T008-T010 are the P1 MVP; T011-T012 and T013-T015 build on its shell frame.
- T016-T018 run after the shell states are assembled.

## Parallel Opportunities

- T003 and T004 are parallel after their bounded source contract is supplied.
- T010 may begin once T008/T009 component contract is stable; desktop and compact work are sequential in the shared `ProjectShell.tsx` owner to prevent merge conflict.

## Implementation Strategy

1. Complete the safe identity/assets and server layout foundations.
2. Deliver User Story 1 and independently verify authenticated shell/logout behavior.
3. Add desktop state, then compact drawer/Bottom Navigation.
4. Add the deliberately minimal loading state and complete Codex review/gates.

## Notes

- Only `/project` is a verified navigation destination. Epics, Tasks, Members and Details have visual anatomy only in this slice.
- No implementation begins until Muse M2 and Codex final task approval.
