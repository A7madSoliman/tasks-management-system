# Taskly Agent Constitution

Read this file before changing the repository. These rules apply to every coding agent.

## Authority and delegation

- Codex is the main orchestrator, senior frontend architect, reviewer, and final decision maker. Codex approves plans, reviews every implementation diff, reruns quality gates, accepts work, and decides when to commit.
- OpenCode through the `planning` lane is a read-only planning assistant and second-opinion partner. It may analyze alternatives and risks but does not make final decisions or edit the repository.
- Antigravity (`agy`) is the preferred implementer for bounded frontend, UI, responsive, form, feature, fix, and appropriate test tasks after Codex supplies an approved, self-contained brief.
- A configured lane is not authorization to use it. During Phase 0, do not invoke agy. Do not begin Phase 1, scaffold Next.js, install packages, or implement features without explicit user approval.
- Do not create a Codex delegation lane. Codex remains outside the fleet.

## Required technical direction

- Use the latest stable Next.js with the App Router, strict TypeScript, Tailwind CSS, React Hook Form, Zod, SVGR, and sonner when the relevant capability is implemented.
- Prefer Server Components and server-side Next.js patterns. Add Client Components only where browser APIs, client interaction, or local client state require them.
- Prefer native `fetch`. Introduce Redux Toolkit with Thunk only for demonstrated global client state, with Codex approval and a documented reason.
- Do not use Axios, TanStack Query, React Router, casual or implicit `any`, or unnecessary third-party packages.

## Architecture, types, and security

- Keep the data path `Browser -> Next.js server boundary -> Supabase` unless a verified requirement and Codex-approved decision says otherwise.
- Supabase secrets are server-only. Never expose them through `NEXT_PUBLIC_*`, Client Components, browser bundles, logs, reports, or committed files.
- Do not add a Supabase client library without first documenting a concrete technical reason and receiving Codex approval.
- Model domain data with reusable, precise types derived from verified Figma and backend contracts. Do not guess fields, enums, permissions, routes, endpoints, or product behavior.
- Validate untrusted input at the server boundary. Keep server-only data-access code out of client import graphs.

## Figma and UI

- Figma is the UI source of truth. Inspect the exact target node through Figma MCP before implementing a screen; never reproduce an existing screen from memory.
- Respect both desktop and mobile designs. Reuse established tokens and components before creating new ones.
- Use the project's SVGR workflow for SVG assets. Do not invent icon glyphs when the Figma asset exists.
- Convert verified Style Guide values into reusable tokens; do not scatter raw values or invent missing values.

## Dependencies and quality gates

- Add a dependency only for a concrete requirement after checking that platform or existing-project capabilities are insufficient. Record the reason in the task report.
- Tests are required. Before accepting implementation, Codex must independently run the repository's lint, typecheck, test, and production-build commands.
- Never claim a gate passed unless Codex ran it and observed success. If a gate is unavailable or not yet configured, report that plainly.

## Git and review

- Work on a feature branch. Understand the task, inspect relevant Figma/API context, plan, then delegate only bounded work when appropriate.
- Agents must not stage, commit, push, rewrite history, or modify unrelated work unless explicitly authorized. Codex owns final acceptance and commit decisions.
- Preserve `.delegate/config.json` as repository-specific configuration. Do not change it or add it to `.gitignore` without explicit approval.
- Review the complete diff for scope, correctness, security, accessibility, responsive behavior, and unintended changes before acceptance.

## Required final report

Every task ends with a concise, factual report containing:

1. What changed
2. Files changed
3. Decisions
4. Validation, including exact commands and outcomes
5. Issues / risks and intentionally unresolved items
6. Next step
