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
