# Task Report

## What changed

- Added the trusted `planningFallback` lane: agy, high effort, read-only.
- Added `scripts/muse-planning-fallback.mjs`, a Codex-owned planning wrapper. It always attempts Muse through `planning` first, calls `planningFallback` only after conservative explicit quota/rate-limit classification, passes the same bounded brief, and never selects a write lane.
- Added synthetic Vitest coverage for success, quota evidence, deny-by-default failures, same-brief fallback, and recovery.
- Updated Taskly policy and workflow documentation with normal, fallback, stop, notification, recovery, no-polling, and report requirements.

## Files changed

- `.delegate/config.json`
- `AGENTS.md`
- `docs/WORKFLOW.md`
- `scripts/muse-planning-fallback.mjs`
- `scripts/muse-planning-fallback.test.mjs`
- `.ai/reports/muse-graceful-fallback.md`

## Decisions

- `planningFallback` resolves to `agy` with `{ "effort": "high", "readOnly": true }`; agy's installed relay maps read-only to `--mode plan`.
- The wrapper reads relay result fields and text artifacts (`stderrTail`, `finalMessage`, OpenCode `events.jsonl`) because relay HTTP status is not reliably structured. Its pure classifier allowlists explicit HTTP 429, quota exceeded/exhausted, usage limit reached/exceeded/exhausted, and rate limit reached/exceeded/exhausted. All other evidence is non-fallback.
- The minimal fallback-active boolean is stored only in Git-local `.git/delegate-skills/muse-planning-fallback.json`; no prompts, responses, credentials, or secrets are retained. A later Muse success clears it and emits the normal-workflow-restored notice.
- Phase 1 was the user-approved Codex bootstrap exception for delegation infrastructure. Phase 2 added only the user-approved minimal read-only smoke requests; no quota failure was induced.

## Validation

- Delegate config validation: passed; five lanes recognized.
- Official Delegate Setup project trust load: passed; `projectTrusted: true`. A final trust refresh/write attempt was blocked by the restricted Codex sandbox with `EPERM` on `.git/delegate-skills/project-config.sha256`; no repository file was changed.
- Lane resolution: passed for `planning`, `planningFallback`, `frontend`, `fixes`, and `tests`.
- Focused synthetic fallback tests: passed, 16 tests.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed, 20 files and 161 tests.
- `pnpm build`: passed.
- Targeted Prettier: passed for all six changed supported files.
- `git diff --check`: passed.
- Final source review: passed after adding deny precedence for explicit non-quota evidence coexisting with quota-looking text. The wrapper uses only the installed OpenCode/agy relays and fixed planning lanes; it neither bypasses project trust nor selects a write lane.
- Final focused synthetic fallback tests: passed, 23 tests. The suite verifies explicit quota/provider-429 paths forward the same brief to `planningFallback`, while non-quota evidence stops after `planning`.
- Real Muse smoke: the restricted Codex sandbox hit the known OpenCode `EEXIST` version-preflight failure; this correctly stopped with no fallback and did not dispatch a model. The same trusted `planning` relay then succeeded in the normal local CLI environment: OpenCode 1.18.30, `agent: plan`, model `opencode/muse-spark-1.3-contributor-free`, variant `high`, response `MUSE_PLANNING_SMOKE_OK`.
- Real planningFallback smoke: succeeded through `planningFallback` only: agy 1.1.28, `effort: high`, `readOnly: true`, `readOnlyViolation: false`, no dangerous-permission flag, response `AGY_PLANNING_FALLBACK_SMOKE_OK`.
- Real wrapper success path: succeeded with `status: muse`; it invoked `planning` first, returned `MUSE_PLANNING_SMOKE_OK`, did not invoke `planningFallback`, and left fallback state absent.
- Delegate write check: before/after repository status was identical for every real smoke. Delegates produced no repository writes.
- Actual model calls: 3 successful read-only calls (2 Muse/OpenCode, 1 agy). OpenCode reported `$0` for both Muse calls; provider quota/reset visibility is otherwise unavailable. The quota-failure path was intentionally not forced and remains synthetic.

## Issues / Risks

- The current Codex/OpenCode restricted sandbox preflight limitation remains known and is intentionally classified as non-quota; it stops without fallback. The normal local CLI environment safely completed the approved read-only Muse smoke without weakening relay permissions.
- Real quota failover was intentionally not tested to avoid quota exhaustion. It is validated through source review and synthetic tests only.
- Remaining quota and reset timing are intentionally unavailable and never inferred.

## Next step

Use `scripts/muse-planning-fallback.mjs` for the next eligible M1/M2 pass; it will attempt Muse first. Review and commit this branch only after final acceptance.
