# Project Layout Shell — M1 Brief

## Product Goal

Make `/project` the authenticated destination and establish a reusable authenticated App Router shell: persistent header, desktop sidebar with expanded and collapsed states, mobile/tablet header and drawer, mobile bottom navigation, authenticated identity, and a `children` content slot for later Project routes. This M1 is planning only; it must not implement UI, endpoints, or dependencies.

## Acceptance Criteria

- Only authenticated users can render the `/project` shell; unauthenticated users redirect to `/login`.
- The header presents the authenticated user’s name, job title, and initials avatar. Initials: first letters of first two whitespace-delimited name words; one word uses its first two characters (for example Ahmed Soliman → AS, Ahmed Ali Soliman → AA, Ahmed → AH).
- Desktop sidebar toggles expanded (icon + label) and collapsed (icon-only) states.
- Tablet/mobile provides the Figma burger-menu closed/open states with keyboard-usable controls and focus handling.
- The Figma mobile closed node includes Bottom Navigation. It must be included as shell anatomy; no unverified future route behavior is invented.
- Main page content is provided by nested layout `children`; loading content uses only the verified surface/border/shadow language, without invented skeletons.
- No Redux, Supabase browser client, raw token exposure, API endpoint, or dependency addition.

## Exact Figma Evidence

Source file: `oL1WORO4G2iuQfSGPd4qvS`; inspected through Figma MCP with `figma-design-to-code` guidance.

- `1:986` — Desktop expanded: left sidebar is `256px`, `#F1F3FF`, 16px padding; header uses `#F9F9FF`, 24px horizontal / 12px vertical padding and a subtle bottom border. Sidebar navigation uses 4px gaps; active Projects is white, 4px radius, 12px/10px padding and 0 1px 1px shadow. Header identity is name (Inter semibold 14/20, `#041B3C`), uppercase title (Inter bold 10px, tracking 1px, `#003D9B`), and 40px / 8px-radius initials avatar. Bottom sidebar contains Collapse and Logout anatomy.
- `1:733` — Desktop collapsed: sidebar is `80px`; top bar starts at x=80, is exactly 64px tall and uses 32px horizontal padding. Nav buttons are icon-only 48px square; active Projects remains white, 4px radius and 0 1px 1px shadow. This validates the 256/80 desktop states and 64px desktop header.
- `1:553` — Mobile menu open: header is 390px wide × 64px, 32px horizontal padding. It includes a dimmed `rgba(4,27,60,0.4)` backdrop with 2px blur and a left drawer 288px wide, `#F1F3FF`, 16px padding, shadow `0 25px 50px -12px rgba(0,0,0,.25)`. Drawer nav has full labels, active Projects, Logout, and a separate close control. It visually contains page/dashboard material and a contextual FAB, which are outside this shell slice.
- `1:401` — Mobile menu closed: header is 390px wide with 24px horizontal / 12px vertical padding and a burger control. It explicitly has a 390px × 64px BottomNavBar (`#F1F3FF`) with labels Projects, Epics, Tasks, Members, Details. The visual node does not establish destination routes or activation semantics for those future areas.
- `76:1757` — Style Guide: Inter; background `#F9F9FF`; surface low `#F1F3FF`; surface highest `#D7E2FF`; primary `#003D9B`; primary container `#0052CC`; text `#041B3C`, `#4F5F7B`, `#C3C6D6`; semantic error `#BA1A1A`; success `#82F9BE`; warning `#FFB300`; iconography is Material Symbols Outlined. Existing project tokens already encode most of these exact values.

Figma generated temporary SVG export URLs for every logo/nav/control asset. Implementation must download exact Figma exports into the project’s asset/SVGR workflow (or reuse an existing glyph only when visually identical); no text glyphs, emoji, or hand-authored SVGs.

## Existing Repository State

- Next.js 16.3.4 App Router, strict TypeScript, Tailwind v4, React 19, React Hook Form and Zod are installed. No Redux or Supabase SDK.
- `src/app/project/page.tsx` is an async Server Component that calls `getCurrentUser()`, redirects unauthenticated visitors to `/login`, then renders a temporary centred success message. No `/project/layout.tsx` exists.
- Root `src/app/layout.tsx` is Server Component. `src/app/globals.css` exposes compatible semantic Tailwind tokens (`background`, `surface-low`, `surface-highest`, primary/action, text and border roles) and Inter.
- No shared component directory currently exists. `src/features/auth/assets/auth-assets.ts` is the established lookup pattern for local Figma SVG exports, and `public/assets/` currently contains only auth assets.
- Relevant current server boundary is `src/features/auth/server/auth-server.ts`; API `GET /api/auth/user` simply serializes its `getCurrentUser()` result, but the shell should call the server function directly rather than fetch its own route.

## Auth / User Data Contract

- Verified transport: `getCurrentUser()` reads only HttpOnly `taskly_access_token` / refresh cookies server-side; it calls `GET ${SUPABASE_BASE_URL}/auth/v1/user` with server `apikey` and `Authorization: Bearer <access token>`, `cache: "no-store"`; it clears invalid sessions and returns `null` if no valid user. Browser-side credentials are neither read nor exposed.
- Its current declared type is deliberately broad: `AuthUser = { id: string; email?: string; [key: string]: unknown }`. It returns the entire validated backend record after requiring only `id`, so `user_metadata` is not typed/narrowed.
- Verified signup request writes `data: { name, ...(job_title ? { job_title } : {}) }` to `/auth/v1/signup` (`auth-server.ts` and signup route test). Job title is optional.
- The supplied Postman authority validates request headers but has no saved `GET /auth/v1/user` response schema. Repository tests of that endpoint only establish `id` and optional `email`, not the runtime `user_metadata` container or field types.
- Therefore M1 must not assert that a raw `AuthUser` has usable `user_metadata.name` / `.job_title`. The implementation plan should add a focused server-side mapper that defensively narrows `unknown` metadata into a minimal serializable `ShellUserProfile` (and never passes the raw auth object). Exact fallback display behaviour when name or job title is absent remains a product/API ambiguity until the runtime response schema is confirmed.

## Proposed Server / Client Boundary

- Add `src/app/project/layout.tsx` as the async Server Component authorization and composition boundary. It calls `getCurrentUser()` once per layout render, redirects to `/login` when null, maps verified/narrowed data to the minimal profile view model, and renders the shell with `children`.
- Keep header profile presentation, static navigation data, and loading/surface markup server-rendered where possible.
- Use one narrowly scoped Client Component for the interactive shell frame. It receives only `ShellUserProfile` and `children`; local React state controls desktop collapsed state and mobile drawer open state. It must not import `auth-server`, access cookies, call Supabase, or use Redux.
- Optionally split purely presentational server-compatible components from the client state owner only if that reduces duplication; do not create abstractions whose contract is speculative.

## Responsive State Model

- Desktop: `sidebarExpanded: boolean` initializes expanded; toggle drives 256px/80px side-nav and corresponding content/header offset. It is page-shell-local state, not global persistent state (Figma does not establish persistence).
- Mobile/tablet: `mobileDrawerOpen: boolean`; burger opens it; close button, backdrop click, Escape and navigation action close it. On open, lock background scroll and move keyboard focus into the drawer; restore focus to the burger on close. Use an accessible dialog/drawer pattern and labelled controls.
- Exact breakpoint thresholds are not present in the four supplied nodes. M1 should retain this as an implementation measurement/design question rather than fabricate a number. The shell must cover desktop and mobile designs; tablet follows burger navigation as required but needs a verified cutoff before pixel implementation.

## Navigation / Bottom Nav Findings

- Desktop expanded and drawer label sequence: Projects, Project Epics, Project Tasks, Project Members, Project Details; Projects is the selected visual state in supplied shell nodes.
- Mobile closed Bottom Navigation is a distinct persistent 64px shell element with shorter labels: Projects, Epics, Tasks, Members, Details. It is not a replacement only for the open drawer; it remains present in the closed design.
- The supplied screens do not verify whether inactive items navigate, are disabled, or point to routes. This slice must render their Figma anatomy/accessibility without inventing future destinations. Link semantics and active-state routing must be resolved in Spec Kit against actual future route contracts; `/project` may be the sole verified route today.
- Bottom nav needs reserved main-content bottom space so future content is not obscured. The exact treatment of the Figma contextual FAB is excluded; it appears attached to dashboard/page content, not established shell chrome.

## Existing Components / Tokens / Assets To Reuse

- Reuse `bg-background`, `bg-surface-low`, `bg-surface-highest`, text/action/border/radius tokens from `src/app/globals.css`; extend semantic tokens only from verified Style Guide values during later implementation.
- Reuse Inter supplied by root tokens. Reuse current auth asset module conventions, not its specific auth icons except the existing logo only after visual comparison.
- Obtain and commit the exact Figma SVG exports for shell assets during implementation through the established local asset workflow. The temporary Figma URLs are evidence only and expire.

## Loading Surface Contract

No dedicated loading/skeleton node was found among `1:986`, `1:733`, `1:553`, or `1:401`. Product Owner requires loading page content to use the background/surface plus border/shadow treatment. Implement only a content-area surface treatment based on `#F9F9FF`, `#F1F3FF`, subtle `#C3C6D6` border and verified low elevation as applicable; do not invent skeleton blocks, fake data, spinners, or timing behaviour. The exact loading content/design remains unresolved.

## Risks / Ambiguities

- `GET /auth/v1/user` metadata response shape is unverified. Need a safe schema/sample or approved server-only read-only probe that does not print tokens/secrets before finalizing name/title fallback behaviour.
- Figma target nodes provide 1280px desktop and 390px mobile frames but no explicit tablet breakpoint.
- All navigation labels are visually present, but only `/project` is an existing verified route; future destinations and interaction contract are unknown.
- Figma desktop shows Logout, while mobile open drawer also includes it. Existing server logout capability is safe to reuse, but whether M1 implementation should wire it must be confirmed from the exact Figma interaction/feature scope rather than redesign it.
- Figma frame includes Dashboard-like page content and FAB; they are not shell requirements and must remain excluded.

## Explicit Exclusions

- Projects list/data, creation, epics/tasks/members/details/dashboard data, invitations, permissions, statistics, endpoints, backend changes, Supabase client, Redux, dependencies, fabricated routes, fake statistics, generic skeletons, and logout redesign.
- No UI implementation, Spec Kit artifacts, agy invocation, package installation, commit, or push occurs in this M1 pass.

## Questions Muse Should Challenge

1. Is a server `/project/layout.tsx` plus one local-state Client shell the smallest safe route/layout arrangement for nested future routes?
2. Does keeping `children` under a Client Component create an avoidable Server Component boundary issue; what composition pattern preserves server-rendered future route content while retaining local UI state?
3. How should the two Figma mobile navigation systems (drawer and persistent Bottom Navigation) coexist without inventing routing behavior?
4. Is local, non-persisted collapse/drawer state sufficient given Figma evidence?
5. What is the strictest safe mapper/type for `user_metadata.name` / `user_metadata.job_title` given the broad raw type and absent saved response schema? Which fallback requirements must be blocked rather than invented?
6. Are initials rules robust for whitespace, one-character names, Unicode graphemes, or malformed metadata without displaying unsafe/empty output?
7. Which keyboard/focus, Escape, backdrop, inert/scroll-lock, touch target and active-state details are required for a compliant responsive drawer/bottom navigation?
8. How can the future nested-route layout avoid duplicate auth requests, duplicate shell chrome, or speculative global state/dependencies?
9. What Figma/API evidence is still insufficient for implementation, especially breakpoints, icon export inventory, Bottom Nav actions, logout behavior and loading surface?
