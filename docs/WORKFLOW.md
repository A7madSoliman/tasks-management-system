# Taskly Delivery Workflow

The repository uses pnpm 11.23.0 with Node 24.20.0. Use `pnpm install` and
`pnpm run <script>` for local and CI workflows.

## Standard task loop

`Context -> Figma/API inspection when relevant -> planning -> optional Muse second opinion -> Codex decision -> bounded agy implementation when appropriate -> diff review -> gates -> fixes -> final report -> Codex acceptance -> commit`

1. Work on a feature branch and read `AGENTS.md` plus relevant project documentation.
2. Define the task and its acceptance criteria. Inspect exact Figma nodes and verified API sources whenever UI or backend behavior is involved.
3. Plan the smallest coherent change. Use the read-only `planning` lane when alternatives, edge cases, or a second opinion would reduce planning load.
4. Codex resolves open decisions and approves the plan. Muse advises but does not decide or edit.
5. When appropriate, Codex sends agy a bounded, self-contained implementation brief with scope, evidence, exclusions, and the repository's actual validation commands.
6. Codex reviews the complete working-tree diff and checks scope, correctness, architecture, types, security, accessibility, responsive behavior, and tests.
7. Codex independently runs lint, typecheck, tests, and production build. A delegate's gate claims are not accepted as evidence.
8. If needed, request focused fixes and repeat review and gates.
9. Write the factual task report, including unresolved risks and exact gate outcomes.
10. Codex makes the final acceptance decision and commits only after the work is verified and commit authorization applies.

## When Codex should not delegate

- The change is so small that delegation overhead exceeds the work.
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
