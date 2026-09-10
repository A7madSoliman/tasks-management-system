# Feature Specification: Authenticated Project Layout Shell

**Feature Branch**: `feat/project-layout-shell`
**Created**: 2026-09-09
**Status**: Ready for planning

## Evidence and Scope Context

UI authority is Figma file `oL1WORO4G2iuQfSGPd4qvS`, inspected at desktop expanded `1:986`, desktop collapsed `1:733`, mobile open `1:553`, mobile closed `1:401`, and Style Guide `76:1757`. Authentication authority is the existing server-only `getCurrentUser()` boundary, `GET /auth/v1/user`, signup metadata `name` plus optional `job_title`, verified legacy `department` metadata, and existing logout capability. No unverified response schema is assumed.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Reach the authenticated workspace (Priority: P1)

An authenticated user reaches `/project` and sees a consistent workspace frame around supplied page content, including identity and logout.

**Why this priority**: The shell is the authenticated destination and foundation for future Project pages.

**Independent Test**: Sign in with a named user, open `/project`, verify identity/initials and nested content, then log out and verify `/login`.

**Acceptance Scenarios**:

1. **Given** a valid session, **When** the user visits `/project`, **Then** the shell renders header, navigation frame and supplied page content.
2. **Given** no valid session, **When** a visitor requests `/project` or a nested Project page, **Then** they are redirected to `/login` without shell identity information.
3. **Given** a named user with a job title, **When** the shell loads, **Then** the header displays name, job title and initials avatar.
4. **Given** an authenticated user, **When** they activate Logout, **Then** the existing logout capability ends the session and returns them to `/login`.

---

### User Story 2 - Use desktop navigation efficiently (Priority: P2)

At desktop widths, an authenticated user can switch shell navigation between the expanded and collapsed visual states without losing page content.

**Why this priority**: Desktop navigation must match both supplied Figma states while keeping a reusable page frame.

**Independent Test**: At 1024px or wider, toggle using keyboard and pointer; verify the 256px labelled state, 80px icon-only state, retained content and accessible control state.

**Acceptance Scenarios**:

1. **Given** a viewport at least 1024px wide, **When** the shell renders, **Then** it shows an expanded 256px sidebar with navigation icons and labels.
2. **Given** the expanded sidebar, **When** Collapse is activated, **Then** it shows an 80px icon-only sidebar and usable content.
3. **Given** the collapsed sidebar, **When** its expansion control is activated, **Then** the 256px labelled sidebar returns.

---

### User Story 3 - Use compact navigation on tablet and mobile (Priority: P3)

At widths below 1024px, an authenticated user uses a burger control and drawer while retaining Figma’s persistent mobile Bottom Navigation.

**Why this priority**: Responsive behavior is distinct UI, not scaled desktop; Bottom Navigation must not be omitted.

**Independent Test**: Below 1024px, open the drawer with the burger and dismiss it with Escape or overlay; verify focus, 288px drawer and visible 64px Bottom Navigation with no obscured content.

**Acceptance Scenarios**:

1. **Given** a viewport below 1024px, **When** the shell renders, **Then** it shows the compact header/burger and persistent Bottom Navigation.
2. **Given** compact navigation, **When** the burger opens, **Then** a 288px labelled drawer and dimmed overlay appear and can be dismissed by Escape or overlay.
3. **Given** mobile closed navigation, **When** Bottom Navigation is viewed, **Then** it shows Projects, Epics, Tasks, Members and Details without directing users to unverified destinations.

### Edge Cases

- Missing `job_title` omits the title line without an empty visual gap.
- Missing or unusable name displays email and derives avatar initials from its local-part. If both are unusable, display `User` with initials `US` and no job-title line.
- A one-word valid name supplies its first two characters; a multi-word name supplies first characters of its first two words.
- Whitespace-only or one-character profile values do not create malformed avatar output; mapping provides a safe fallback.
- Drawer closing restores focus to the burger and normal page interaction.
- Loading content uses only the verified background/surface, subtle border and shadow; no skeleton, spinner, fake data or timing behavior.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST make the authenticated layout available at `/project` and future nested Project pages through one reusable content slot.
- **FR-002**: The system MUST redirect unauthenticated Project-shell requests to `/login` before displaying shell content or identity.
- **FR-003**: The system MUST display a valid name, optional job title and initials avatar without exposing raw session credentials, secrets or backend payloads.
- **FR-004**: The system MUST omit missing job title; if name is missing, it MUST display email and derive initials from the email local-part; if both name and email are unusable, it MUST display `User` with initials `US` without exposing raw identifiers or metadata.
- **FR-005**: The system MUST derive initials from the first characters of the first two words for multi-word names, and first two characters for a one-word name.
- **FR-006**: At widths >=1024px, the system MUST provide expanded 256px icon-and-label and collapsed 80px icon-only desktop sidebars.
- **FR-007**: At widths <1024px, the system MUST provide the burger-driven compact states of Figma `1:553` and `1:401`, including 288px drawer, dimmed overlay, Escape and overlay dismissal. No visual close icon is added unless an exact Figma asset exists.
- **FR-008**: At widths <1024px, the system MUST retain persistent Bottom Navigation with Projects, Epics, Tasks, Members and Details, reserve content space, and not invent destinations for unverified items.
- **FR-009**: The system MUST use the accepted existing logout capability and return the user to `/login`.
- **FR-010**: The system MUST support pointer/keyboard operation, visible focus, meaningful labels/states, Escape dismissal, focus restoration, drawer scroll lock and accessible drawer/overlay behavior. While the drawer is open, Bottom Navigation is beneath the overlay and non-interactive.
- **FR-011**: The shell MUST use Figma-exported assets and Style Guide foundations rather than invented icon glyphs. SVGs MUST use the configured SVGR component workflow; its necessary build configuration and `@svgr/webpack` development dependency are an explicit, limited exception to the otherwise no-new-package scope.
- **FR-012**: Loading presentation MUST use only approved surface/background plus border/shadow treatment and MUST NOT introduce skeletons, spinners or fabricated data.

### Key Entities

- **Shell User Profile**: Minimal display-only identity: safe display name, optional job title and initials; contains no token, secret or raw backend payload.
- **Navigation Item**: A Figma-labelled shell item with icon, active treatment and responsive placement. Only `/project` is currently a verified destination.
- **Shell State**: Transient desktop sidebar expansion and compact drawer visibility.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Authenticated and unauthenticated route tests cover 100% of `/project` and nested Project access cases, respectively rendering the shell/content or redirecting to `/login` with no identity disclosure.
- **SC-002**: Interaction checks verify both 256px and 80px desktop states at >=1024px, and 288px drawer plus persistent Bottom Navigation below 1024px.
- **SC-003**: 100% of fixtures for multi-word name, one-word name, missing job title and missing name/email produce required identity and non-empty initials fallback.
- **SC-004**: Keyboard checks verify all controls are reachable, drawer Escape/overlay dismissal works, and focus returns to the burger after dismissal.
- **SC-005**: Loading review verifies only approved surface/border/shadow treatment and no skeleton, spinner or fabricated-content element.

## Assumptions

- Existing server-managed authentication remains authoritative for identity and logout.
- Exact Figma asset exports are committed through established project asset workflow during implementation; temporary MCP URLs are not runtime dependencies.
- Collapse/drawer preferences are local and non-persistent because no evidence requires persistence.
- Bottom Navigation is required anatomy; unverified entries remain non-navigating until a future feature verifies destinations.
- Projects data/list, Epics, Tasks, Members behavior, Dashboard data/FAB, invitations, endpoints, permissions and dependencies are excluded.
