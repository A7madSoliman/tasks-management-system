# Taskly

Taskly is a task management system inspired by products such as ClickUp.  
The project is being built as a professional frontend training project with a strong focus on architecture, strict TypeScript, responsive design, testing, Git review, and a CLI-first development workflow.

## Current Status

Taskly is under active development.

Completed foundations so far:

- Project initialization with Next.js App Router and strict TypeScript
- Tailwind CSS design foundation and centralized styling approach
- ESLint, Prettier, type checking, Vitest, and production build gates
- Feature-oriented project structure
- Authentication login slice
  - React Hook Form + Zod validation
  - Server-side Supabase authentication boundary
  - HttpOnly session cookies
  - Current-user lookup and refresh handling
  - Safe error handling
  - Authentication tests
- Project layout shell foundation
- SVGR support for committed SVG assets
- Project documentation and agent workflow rules

Upcoming product areas include projects, members, invitations, epics, tasks, task statuses, dashboard, calendar, and task statistics.

## Tech Stack

- **Next.js 16**
- **React 19**
- **TypeScript 6**
- **Tailwind CSS 4**
- **React Hook Form**
- **Zod**
- **SVGR**
- **tailwind-merge**
- **Vitest**
- **Testing Library**
- **ESLint**
- **Prettier**
- **Supabase** as the backend
- **Vercel** as the deployment target

## Requirements

- **Node.js:** `>=24.20.0 <25`
- **pnpm:** `11.23.0`

This project uses **pnpm only**. Do not use npm or Yarn to install dependencies.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/A7madSoliman/tasks-management-system.git
cd tasks-management-system
```

Install dependencies:

```bash
pnpm install
```

Create your local environment file from the example:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Add the required local values to `.env.local`.

> Never commit real secrets. Supabase secret credentials must remain server-only and must never be exposed through `NEXT_PUBLIC_*`.

Start the development server:

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Available Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm test
pnpm test:watch
pnpm format
pnpm format:check
pnpm check
```

`pnpm check` runs the main quality gates:

```text
lint → typecheck → tests → format check → production build
```

## Architecture

Taskly uses the **Next.js App Router** with Server Components as the default.

Preferred data direction:

```text
Browser
  ↓
Next.js server boundary
  ↓
Supabase
```

Privileged Supabase access and secrets must stay on the server. Client Components must never import server-only modules or receive backend secrets.

The project prefers:

1. Server-derived state
2. URL state where appropriate
3. Local component state
4. Focused React Context
5. Redux Toolkit + Thunk only when genuine cross-feature global client state requires it

Redux is not used as a default server-data cache.

## Forms and Validation

Interactive forms use:

```text
React Hook Form
      +
     Zod
```

Validation schemas should be reusable and strongly typed. Untrusted input must also be validated at the server boundary.

## Design System

Figma is the UI source of truth.

Implementation rules:

- Inspect the exact Figma node before implementing a screen
- Reuse existing components and design tokens
- Support both desktop and mobile designs
- Use actual Figma assets
- Use SVGR for committed SVG assets
- Avoid repeated hardcoded design values

The design foundation uses Inter typography, reusable action colors, tonal surfaces, semantic colors, reusable controls, and shared iconography.

## Project Structure

The codebase follows feature-oriented boundaries:

```text
src/
├─ app/          # Next.js routes, layouts, and server boundaries
├─ features/     # Feature-specific UI and domain logic
├─ test/         # Shared test setup/utilities
└─ types/        # Shared application types
```

Current feature areas include:

```text
src/features/auth/
src/features/project-shell/
```

The structure should evolve from verified product requirements rather than from speculative abstractions.

## Backend

The backend is Supabase.

Known domain areas include:

- Authentication
- Projects
- Project ownership
- Members
- Invitations
- Epics
- Tasks
- Task statuses
- Dashboard
- Calendar and task statistics

Product behavior must be verified from Figma, the Supabase SQL contract, Postman/API material, or existing implementation requirements. Behavior should not be invented from similar products.

## Security Rules

- Never expose server secrets through `NEXT_PUBLIC_*`
- Never use backend secrets inside Client Components
- Never commit secrets
- Never log secrets
- Prefer server-side data access
- Keep error messages safe and non-sensitive

## Development Workflow

Meaningful work follows this flow:

```text
Read context
  ↓
Inspect Figma / API contract
  ↓
Plan
  ↓
Optional read-only planning review
  ↓
Final architecture decision
  ↓
Bounded implementation
  ↓
Review git diff
  ↓
Run quality gates
  ↓
Fix issues
  ↓
Final acceptance
  ↓
Commit
```

The project currently uses an AI-assisted CLI workflow:

```text
Muse / OpenCode
→ read-only planning and second opinion

Codex
→ orchestration, architecture, final decisions, review, and acceptance

agy
→ bounded frontend implementation, fixes, and tests
```

Codex remains the final technical decision maker and independently reviews delegated work.

## Quality Policy

Before meaningful implementation is accepted, the project should pass the applicable quality gates:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

A gate must not be reported as passed unless it was actually executed.

## Project Documentation

Important project context lives in:

```text
AGENTS.md
docs/PROJECT_CONTEXT.md
docs/ARCHITECTURE.md
docs/DESIGN_SYSTEM.md
docs/API_CONTRACT.md
docs/WORKFLOW.md
```

Task reports are stored under:

```text
.ai/reports/
```

Repository documentation is the long-term source of truth for architecture and workflow decisions.

## Repository

https://github.com/A7madSoliman/tasks-management-system

---

Taskly is currently in active development. This README reflects the project state and workflow as of September 2026.
