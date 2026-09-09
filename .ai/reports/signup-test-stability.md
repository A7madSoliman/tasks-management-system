# Task Report

## What changed

- Added a test-only teardown drain to `src/app/(auth)/sign-up/page.test.tsx`.
- The teardown awaits an empty React `act` cycle, allowing queued React scheduler work to flush while the jsdom environment remains available.
- No application code, Muse fallback behavior, delegate configuration, dependencies, or CI configuration changed.

## Files changed

- `src/app/(auth)/sign-up/page.test.tsx`
- `.ai/reports/signup-test-stability.md`

## Decisions

- GitHub Actions run `#13` (`34371842815`) showed all 20 test files and 161 assertions passing, followed by two unhandled `ReferenceError: window is not defined` exceptions from React 19's scheduler (`react-dom-client` → `scheduler` → `processImmediate`).
- The proven root cause is a React scheduler callback surviving the synchronous page-test lifecycle and firing after Vitest tore down that file's jsdom environment. Assertions had completed, but Vitest separately reports late unhandled exceptions and exits non-zero.
- The fix is a deterministic React `act` lifecycle drain in the affected test file. It is not a retry, arbitrary delay, error suppression, cleanup disablement, or application behavior change.

## Validation

- Baseline reproduction review: GitHub CI log for run `34371842815` confirmed the two post-test `window is not defined` errors and the React scheduler stack.
- Baseline local stress: 10 isolated page runs, page + `SignUpForm` run, and 3 full-suite runs passed locally without reproducing the CI timing race.
- Fixed isolated page test: 5 sequential runs with the final `act` drain passed; 3 tests per run; zero unhandled errors.
- Fixed page + `SignUpForm` tests: 2 files and 19 tests passed with the final `act` drain; zero unhandled errors.
- Fixed full-suite stress: 3 sequential runs passed with the final `act` drain; each reported 20 files and 161 tests; zero unhandled errors.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: passed in repeated full-suite runs, 161 tests each.
- Targeted Prettier for the changed test: passed with LF end-of-line.
- `pnpm build`: passed.
- `git diff --check`: passed.
- `pnpm format:check`: unavailable as a clean gate on this baseline; it reports 50 pre-existing files, including unrelated files. No mass-formatting was performed.
- `pnpm check`: reached the same repository-wide `format:check` step after lint, typecheck, and 161 tests passed, then failed because of those 50 existing formatting issues.
- No dependencies were added and no model/delegate calls were made.

## Issues / Risks

- The CI race was timing-sensitive and did not reproduce in the local Windows runs, but the GitHub scheduler stack directly identified the teardown boundary and the focused lifecycle drain removes that boundary race.
- Repository-wide formatting remains pre-existing and outside this narrow fix; it intentionally remains unresolved to avoid unrelated changes.

## Next step

Review the narrow pull request on `fix/signup-test-stability`; merge remains a human decision.
