# Taskly Delivery Workflow

The repository uses pnpm 11.23.0 with Node 24.20.0. Use `pnpm install` and
`pnpm run <script>` for local and CI workflows.

## Standard task loop

`Acceptance criteria + exact Figma + verified API/backend evidence -> Context Engineering -> Muse M1 -> Codex decision -> Spec Kit artifacts -> Muse M2 -> Codex task approval -> Delegate Skill -> bounded agy work -> Codex review/gates -> Codex manual convergence -> report -> acceptance -> commit`

1. Work on a feature branch and read `AGENTS.md` plus relevant project documentation.
2. Define acceptance criteria and verify exact Figma nodes and relevant backend/API evidence. Record missing or conflicting evidence as open questions; do not invent behavior.
3. For every meaningful feature slice, use the read-only `planning` lane for Muse M1: requirements analysis, alternatives, edge cases, and risks.
4. Codex makes the final requirements and architecture decision.
5. For meaningful features, Codex uses `$speckit-specify`, then `$speckit-clarify` only when verified evidence can resolve an ambiguity, followed by `$speckit-plan`, `$speckit-tasks`, and `$speckit-analyze`.
6. Use Muse M2 to review the resulting specification, plan, and tasks. Codex resolves analysis findings and gives final task approval before implementation.
7. Codex sends agy a bounded, self-contained Delegate Skill brief with scope, evidence, exclusions, and actual validation commands.
8. Codex reviews the complete working-tree diff and requests focused fixes or tests when needed.
9. Codex independently runs lint, typecheck, tests, and production build. A delegate's gate claims are not accepted as evidence.
10. Codex performs a manual artifact-to-diff convergence review against acceptance criteria, `spec.md`, `plan.md`, `tasks.md`, exact Figma evidence, verified API/backend evidence, the complete diff, tests, and gates. Each gap becomes a Codex-approved bounded correction task.
11. Write the factual task report, including unresolved risks and exact gate outcomes. Codex accepts and commits only after verification and authorization apply.

`$speckit-checklist` is optional for requirements-quality review. `$speckit-constitution` is reserved for adoption or principle changes. `$speckit-implement`, `$speckit-taskstoissues`, and `$speckit-converge` are excluded from normal Taskly use: the first executes implementation directly, the second creates GitHub issues, and the third requires prior `$speckit-implement` execution.

## Lite-path exemption

Codex may exempt typo-only changes, tiny visual corrections, narrow test-only fixes, and trivial maintenance from the full Spec Kit path only when the change has no meaningful product behavior, API, security, architecture, or composed UI effect. The lite path still requires applicable AGENTS.md rules, proportionate validation, Codex diff review, and Codex acceptance.

## Specs lifecycle

Commit `specs/<feature>/` with meaningful feature work. After merge, they are historical feature-local decision records, not standing product truth. Promote durable project-wide decisions into the owning `docs/*` file. Never include secrets, credentials, tokens, PII, or raw production data. Mark superseded specifications with the superseding decision or artifact.

## Muse graceful fallback

Every eligible M1 and M2 pass attempts the read-only `planning` (Muse) lane first. The project-local `scripts/muse-planning-fallback.mjs` wrapper owns this sequence; it is the required dispatch path for eligible planning passes.

When Muse completes, use its advisory result and do not call agy. When it fails, the wrapper deny-lists fallback by default: only unambiguous provider evidence such as HTTP 429, quota exceeded, usage limit reached/exhausted, or rate limit reached/exhausted permits the read-only `planningFallback` lane. It passes the identical bounded planning brief to `planningFallback` (agy high, plan mode) and Codex independently analyzes the work and retains final authority. No implementation or write lane is selected by this wrapper.

Authentication/authorization errors, invalid models or configuration, PATH/runtime/preflight and sandbox failures, EEXIST, network/DNS errors, timeouts without explicit quota evidence, and unknown failures stop the planning pass. Do not silently fall back and do not poll Muse.

On quota fallback, surface this user notice exactly in meaning: Muse fallback was activated for a verified Muse/OpenCode quota or rate-limit condition; planning review is temporarily redistributed to agy high read-only advisory review plus Codex independent final analysis; Muse will be retried at the next eligible M1/M2 pass. Do not claim a remaining quota or reset time. The wrapper keeps only a fallback-active flag in Git-local delegate metadata. Every new eligible pass retries Muse first; a later Muse success clears that flag and surfaces that normal Muse M1/M2 workflow is restored.

When fallback is actually used, record in the task report that the affected M1/M2 was unavailable because of verified quota/rate-limit, `planningFallback` / agy high read-only advisory was used, and Codex performed independent final analysis. Never report fallback when it was not used.

## When Codex should not delegate

- The change is trivial, such as a typo-only change or tiny visual correction.
- Architecture, authentication, authorization, secret handling, security, or another sensitive decision is central to the task.
- Requirements, Figma behavior, API contracts, or acceptance criteria are unclear.
- Implementation depends on a decision that Codex or the user has not made.
- The task cannot be bounded into a self-contained brief with objective review criteria.

Codex may still request read-only analysis from Muse for alternatives or risks, while retaining the decision.

## Delegation boundaries

- The `planning` lane is read-only and exists for analysis, discussion, and second opinions.
- The `frontend`, `fixes`, and `tests` lanes use agy for bounded frontend work after Codex approval.
- Configured lanes do not authorize unrelated work or override the current phase.
- During Phase 0, do not invoke agy, scaffold the application, install packages, or implement features.
- Codex reviews every delegated diff, reruns gates, owns final acceptance, and decides whether to commit.
- Preserve the approved repository-specific `.delegate/config.json`; do not ignore or silently modify it.

## Reporting

Store task reports under `.ai/reports/` using the format in `.ai/reports/README.md`. Reports must be concise, factual, and free of secrets. A gate that was not run must be labeled not run or not configured.
