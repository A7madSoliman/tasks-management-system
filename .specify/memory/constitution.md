<!--
Sync Impact Report
- Version change: unratified template -> 1.0.0
- Modified principles: placeholder template -> Taskly's five governing principles
- Added sections: Authoritative References, Artifact Lifecycle
- Removed sections: none
- Follow-up TODOs: none
-->

# Taskly Constitution

## Core Principles

### I. Authority and Evidence-First Decisions

Codex is the final requirements, architecture, task-approval, acceptance, and Git authority.
Every meaningful feature specification MUST cite verified requirements evidence and MUST NOT invent
missing product behavior.

### II. Source-of-Truth Discipline

`AGENTS.md` and `docs/*` retain their established ownership. Exact Figma evidence and verified
backend evidence are authoritative over stale summaries. Conflicts and unknowns MUST remain explicit
until Codex resolves them.

### III. Architecture and Security Invariants

Specifications and plans MUST honor `AGENTS.md`, `docs/ARCHITECTURE.md`, and
`docs/API_CONTRACT.md` without duplicating endpoints, versions, or implementation detail. Spec Kit
artifacts MUST NOT contain secrets, credentials, tokens, PII, or raw production payloads.

### IV. Design and Quality Discipline

Meaningful UI work MUST use exact desktop and mobile Figma evidence, preserve accessibility and
responsive behavior, and reuse verified project tokens and components. Codex independently owns
acceptance gates.

### V. Spec Kit Execution Boundary

Spec Kit creates and reviews planning artifacts; it never authorizes implementation.
`$speckit-implement`, `$speckit-taskstoissues`, and `$speckit-converge` are excluded from Taskly's
normal workflow. Implementation remains `Delegate Skill -> agy -> Codex review and gates`.

## Artifact Lifecycle

`specs/<feature>/` is committed with meaningful feature work and remains a historical,
feature-local decision record after merge. Durable project-wide decisions MUST be promoted to the
owning `docs/*` file. Superseded specifications MUST identify the superseding decision or artifact.

## Authoritative References

Detailed rules and current project facts live in `AGENTS.md`, `docs/PROJECT_CONTEXT.md`,
`docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/API_CONTRACT.md`,
`docs/WORKFLOW.md`, and `.delegate/config.json`.

## Governance

This constitution is subordinate to `AGENTS.md` and `docs/*` and governs Spec Kit artifacts within
that boundary. Codex reviews compliance during specification, planning, task approval, and
acceptance. Amendments require a Codex decision, a documented semantic-version bump, and review of
affected artifacts; they never silently redefine product, API, Figma, delegation, or Git facts.

**Version**: 1.0.0 | **Ratified**: 2026-09-09 | **Last Amended**: 2026-09-09
