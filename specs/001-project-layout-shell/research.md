# Research: Authenticated Project Layout Shell

## Decision: Route layout is the authorization and composition boundary

**Rationale**: A `/project/layout.tsx` applies the same server authentication decision to `/project` and future nested routes once, then places `children` in the shell. This matches the App Router’s nested layout model and prevents an independent client auth request.

**Alternatives considered**: Repeating the guard in every Project page duplicates auth logic; a client guard would require exposing or fetching auth state unnecessarily.

## Decision: One narrow client state owner

**Rationale**: Desktop collapse and compact drawer are ephemeral shell interactions. One `ProjectShell` client boundary can receive a minimal serializable profile and server-composed children without importing server auth code.

**Alternatives considered**: Redux adds unsupported global state; independent client components risk state/co-ordination duplication.

## Decision: Defensive server profile mapper

**Rationale**: Signup writes `name` and optional `job_title`; verified legacy accounts may provide `department` instead. The repository’s raw authenticated-user type is broad and Postman has no response schema. Mapper safely narrows `name`, prefers non-empty `job_title`, falls back to non-empty legacy `department`, emits only displayName, optional jobTitle and initials, falls back to email/local-part for missing name, then to approved `User`/`US` when both name and email are unusable.

**Alternatives considered**: Passing raw authenticated user violates minimization and makes client typing depend on unverified backend fields.

## Decision: Compact navigation has two simultaneous structures

**Rationale**: Figma `1:401` visibly contains persistent Bottom Navigation while `1:553` contains the independent drawer state. Treat both as shell anatomy. Do not manufacture hrefs for labels whose routes do not yet exist.

**Alternatives considered**: Drawer-only or bottom-nav-only would omit an authoritative Figma element.

## Decision: Local Figma assets and existing tokens

**Rationale**: Exact temporary MCP exports cannot be shipped as remote dependencies. The repository currently has public string-path SVGs and no SVGR build configuration, which conflicts with Taskly’s mandatory SVGR workflow. Add the one necessary development dependency, `@svgr/webpack`, and a narrowly scoped Next webpack rule; commit exact Figma SVG bytes as source assets and import them as typed components. Reuse matching semantic tokens from `globals.css` and add only verified values.

**Alternatives considered**: Public string-path `<img>` usage is established for legacy auth assets but does not meet the current shell’s SVGR requirement; text glyphs, hand-authored SVGs and raw scattered colors violate Figma/token discipline.

## Decision: Compact drawer layering and dismissal

**Rationale**: Figma `1:553` establishes a drawer above its dim/blur overlay; the drawer must be highest, overlay next, underlying content and Bottom Navigation below it. Figma provides no dedicated close icon, so do not invent one. Escape and overlay dismissal restore focus to the burger; page scroll locks while open.

**Alternatives considered**: Putting Bottom Navigation above the overlay permits unintended interaction; a synthetic close glyph violates exact-asset discipline.

## Decision: Surface-only loading

**Rationale**: Product Owner permits background/surface + border/shadow but explicitly excludes inferred skeleton/spinner/fake data. A minimal route loading treatment must contain no simulated content.

**Alternatives considered**: Generic skeletons and spinners have no Figma evidence.
