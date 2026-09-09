# Taskly Delivery Workflow

The repository uses pnpm 11.23.0 with Node 24.20.0. Use `pnpm install` and
`pnpm run <script>` for local and CI workflows.

## Standard task loop

`Context -> Figma/API inspection when relevant -> Muse M1 -> Codex decision -> Muse M2 -> bounded agy implementation when appropriate -> diff review -> gates -> fixes -> final report -> Codex acceptance -> commit`

1. Work on a feature branch and read `AGENTS.md` plus relevant project documentation.
2. Define the task and its acceptance criteria. Inspect exact Figma nodes and verified API sources whenever UI or backend behavior is involved.
3. For every meaningful feature slice, use the read-only `planning` lane for Muse M1: requirements analysis, alternatives, edge cases, and risks.
4. Codex makes the final architecture and specification decision. Muse advises but does not decide or edit.
5. For every meaningful feature slice, use Muse M2 to review specification, plan, and task consistency; identify missing cases; and review risks.
6. Codex gives final acceptance of the plan and decides whether implementation should proceed.
7. When appropriate, Codex sends agy a bounded, self-contained implementation brief with scope, evidence, exclusions, and the repository's actual validation commands.
8. Codex reviews the complete working-tree diff and checks scope, correctness, architecture, types, security, accessibility, responsive behavior, and tests.
9. Codex independently runs lint, typecheck, tests, and production build. A delegate's gate claims are not accepted as evidence.
10. If needed, request focused fixes and repeat review and gates.
11. Write the factual task report, including unresolved risks and exact gate outcomes.
12. Codex makes the final acceptance decision and commits only after the work is verified and commit authorization applies.

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
