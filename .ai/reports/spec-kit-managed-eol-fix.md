# Task Report

## What changed

- Added four narrow LF rules to `.gitattributes` for Codex skills and shared Spec Kit scripts, templates, and local ignore metadata.
- Restored the 22 managed Spec Kit files through Git checkout operations; no managed content was manually edited.
- The root cause was Windows CRLF worktree conversion under `core.autocrlf=true`. All 22 files had EOL-only drift with no semantic/content differences.

## Files changed

- `.gitattributes`
- `.ai/reports/spec-kit-managed-eol-fix.md`

## Decisions

- Preserve the existing `.delegate/config.json text eol=lf` rule.
- Add only the approved narrow rules:
  - `.agents/skills/** text eol=lf`
  - `.specify/scripts/powershell/** text eol=lf`
  - `.specify/templates/** text eol=lf`
  - `.specify/.gitignore text eol=lf`
- No Spec Kit managed content was intentionally changed, and no broader repository EOL rule was added.

## Validation

- `specify integration status`: OK; v1.0.5, Codex-only, 0 modified, 0 missing, 0 invalid manifest paths.
- `specify integration status --json`: status `ok`; both manifests readable with empty modified, missing, and invalid lists.
- `pnpm check`: passed; final process exit code `0` (20 test files, 161 tests).
- `git diff --check`: passed; exit code `0`.
- Real diff review confirmed no managed Spec Kit content diff; only `.gitattributes` had repository content before this report.
- Stale status entries were phantom EOL/index effects; no managed content was staged or modified intentionally.

## Issues / Risks

- Windows clones using older checkout state may need a fresh checkout or controlled Git restoration for the LF attributes to materialize locally.
- No commit, push, or managed-file customization beyond EOL attributes was performed in this step.

## Next step

Review the two-file diff and commit `fix: preserve Spec Kit managed LF` when authorized. Push only after commit review.
