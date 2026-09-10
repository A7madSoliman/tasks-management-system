# Project Layout Shell — M2 Brief

## Approved Product Requirements

Implement only the reusable authenticated `/project` layout shell. It contains a header/profile, desktop sidebar, local desktop expand/collapse, responsive burger drawer below 1024px, persistent compact Bottom Navigation, reusable nested-content slot, existing logout, and surface-only loading treatment. No Project page data feature is included.

Approved responsive rule: width >=1024px is desktop; width <1024px is compact burger navigation. Approved profile fallback: valid name is displayed with computed initials; missing title omits its line; missing name displays email and derives initials from email local-part. Approved logout ends the accepted server session and returns to `/login`. Only `/project` is a verified navigation destination.

## Approved Architecture

- Async `src/app/project/layout.tsx` calls server-only `getCurrentUser()`, redirects unauthenticated users, maps a minimal `ShellUserProfile`, and composes nested `children`.
- One narrow Client `ProjectShell` owns only local sidebar collapse, compact drawer and accessibility interaction state.
- Server-composed children must remain supported. No Redux, browser auth fetch, client Supabase integration, new endpoint or dependency.

## Exact Figma Evidence

File `oL1WORO4G2iuQfSGPd4qvS`, inspected with Figma MCP:

- `1:986`: desktop expanded, 256px `#F1F3FF` sidebar, active Projects, labelled icon nav, profile header, Collapse/Logout anatomy.
- `1:733`: desktop collapsed, 80px sidebar, 64px header, 48px icon-only nav controls.
- `1:553`: compact open, 64px header, 288px labelled drawer, dimmed/blurred overlay, drawer Logout.
- `1:401`: compact closed, burger header and independent persistent 64px Bottom Navigation (Projects, Epics, Tasks, Members, Details).
- `76:1757`: Inter and verified semantic color/radius/elevation foundations. Exact Figma-exported SVG assets are mandatory; temporary MCP URLs are not runtime dependencies.

## Verified Backend/Auth Evidence

- Existing server-only `getCurrentUser()` reads HttpOnly session cookies and makes server-side `GET /auth/v1/user`; it returns null for no/invalid session.
- Signup writes metadata `name` and optional `job_title`.
- Raw authenticated-user type is broad and `/auth/v1/user` has no saved response schema, so mapper must narrow unknown values server-side.
- Existing accepted logout is reused. No token, API key, raw auth user or arbitrary metadata reaches a Client Component.

## Planned Implementation Tasks

`specs/001-project-layout-shell/tasks.md` contains 17 ordered tasks:

1. Exact assets; safe profile mapper and helper tests.
2. Server route layout/children guard and temporary page replacement.
3. P1 header/profile/logout shell and focused tests.
4. P2 desktop expanded/collapsed navigation and tests.
5. P3 compact drawer, Bottom Navigation and accessibility tests.
6. Surface-only loading, token/Figma review and Codex quality-gate task.

## Security Constraints

- Browser -> Next.js server boundary -> Supabase remains intact.
- Auth server module must not enter a client import graph.
- Client props are exactly safe display values; no raw AuthUser, cookie, access/refresh token, server key or secret.
- Validate/narrow unknown metadata at server boundary. No Supabase library, Redux, dependency, endpoint, permission or route addition.

## Responsive / Navigation Contract

- > =1024px: expanded 256px sidebar by default; collapse to icon-only 80px state; local non-persistent state.
- <1024px: burger opens 288px labelled drawer and dim/blur overlay; Bottom Navigation remains persistently visible with reserved main-content space.
- Visual labels and active treatment come from Figma. Inactive unverified items must not gain hrefs or behavior; use semantics/accessibility that do not promise unavailable navigation.

## Profile Mapping Contract

`ShellUserProfile` contains only non-empty `displayName`, optional non-empty `jobTitle`, and non-empty `initials`.

- Valid multi-word name: first character of first two whitespace-delimited words.
- Valid single-word name: first two characters.
- Missing/unusable name: display email and derive initials from email local-part.
- Missing title: omit line.
- Tests must cover whitespace/malformed metadata and avoid blank/unsafe presentation.

## Loading Contract

`src/app/project/loading.tsx` uses only approved background/surface with subtle border/shadow treatment. It contains no skeleton, spinner, fake data or invented timing behavior.

## Accessibility Contract

- Pointer and keyboard operation, visible focus and accessible names/state for controls.
- Compact open moves focus into drawer; close button, Escape and overlay dismiss it; focus returns to burger.
- Background interaction and scrolling are handled safely while drawer is open.
- Desktop collapse and logout controls remain keyboard accessible.

## Test Expectations

- Unit tests: profile metadata narrowing and all specified initials/fallback cases.
- Route/layout tests: authenticated rendering, unauthenticated redirect, minimal props and server-composed children.
- Component tests: header/profile/logout, desktop toggle, compact drawer/overlay/Escape/focus restoration, Bottom Navigation, loading contract as applicable.
- Before acceptance Codex independently runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

## Explicit Exclusions

Projects data/list/creation, Epics, Tasks, Members behavior, Dashboard data/FAB, invitations, backend endpoints, new permissions, invented routes/hrefs, new dependencies, Redux, Supabase client, fake statistics, generic skeletons/spinners, logout redesign, commits and pushes.

## Questions Muse Should Challenge

1. Are all 17 tasks sufficiently bounded, ordered and independently delegable?
2. Does the server layout + one Client shell preserve Server Component children without accidental client auth/data leakage?
3. Is `ShellUserProfile` mapping/fallback/initials handling safe for all malformed/edge values?
4. Is the breakpoint exact at 1024px, including 1024 itself, and do the desktop/mobile contracts cover each state without gap?
5. Do desktop collapse and compact drawer plus persistent Bottom Navigation coexist correctly without inventing navigation destinations?
6. Is existing logout correctly and minimally wired to `/login`?
7. Are exact Figma assets, loading limits, focus/Escape/overlay/scroll-lock handling and test coverage sufficiently explicit?
8. Do any planned abstractions or dependencies exceed the scope or make agy implementation ambiguous?
