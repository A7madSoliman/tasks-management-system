# Task Report
## What changed

- No runtime implementation, Authentication Slice 1 file, package, lockfile, formatting, Git history, or CI file was changed.
- This audit inspected the current `feat/authentication` working tree, the complete Authentication working-tree file set, the current package/scripts/CI/folder structure, the authoritative TM-01 Notion page, and the accessible Figma Style Guide copy.
- This report is the only new repository artifact created by this audit.

## Files changed

- `.ai/reports/tm-01-foundation-reconciliation.md`

Reviewed but intentionally unchanged:

- Current Authentication files under `src/features/auth/`, `src/app/login/`, and `src/app/api/auth/`.
- `package.json`, `package-lock.json`, `src/app/globals.css`, `vitest.config.mts`, `.github/workflows/ci.yml`, `.gitignore`, `.env.example`, and existing documentation.

## Decisions

### TM-01 requirement matrix

| TM-01 area | Status | Current evidence | Reconciliation decision |
| --- | --- | --- | --- |
| TypeScript | ✅ compliant | Strict TypeScript is enabled in `tsconfig.json`; current typecheck previously passed. | Keep. |
| React / Next.js | ✅ compliant | React 19, Next 16.3.4, App Router, and `src/app/` are present. | Keep; no rebuild. |
| Tailwind CSS | ✅ compliant | Tailwind 4.3.3 and `@tailwindcss/postcss` are configured; `globals.css` imports Tailwind. | Keep; centralize remaining verified tokens incrementally. |
| pnpm package manager | conflicting | Repository uses npm scripts, `package-lock.json`, and CI `npm ci`. | Migrate deliberately to pnpm; do not execute in this audit. |
| `packageManager` configuration | adjustment required | `package.json` has no `packageManager` field. | Add a pinned pnpm version after confirming the repository’s supported Node/corepack path. |
| npm/package-lock usage | conflicting | `package-lock.json` is tracked and current scripts/CI use npm. | Generate `pnpm-lock.yaml`, verify equivalence, then remove `package-lock.json` only in the approved migration change. |
| ESLint | ✅ compliant | `eslint.config.mjs` uses Next core-web-vitals and TypeScript configs; `npm run lint` previously passed. | Keep configuration; change invocation to pnpm later. |
| Prettier | conflicting | No Prettier config, dependency, or script exists. | Add the minimum approved Prettier configuration and `format` script. |
| `prettier-plugin-tailwindcss` | conflicting | Not installed/configured. | Add with Prettier during foundation correction; expect class-order-only diffs and review them. |
| `tailwind-merge` | conflicting | Not installed or used. | Add because TM-01 explicitly requires it; introduce usage only where a shared class-composition need exists. |
| `format` script | adjustment required | `package.json` has no `format` command. | Add a deterministic `pnpm format` command after selecting Prettier scope/config. |
| `.gitignore` | adjustment required | Common Next/dependency/debug ignores exist, including pnpm logs. `.env*` ignores `.env.example`. | Preserve protections; add an explicit exception for the non-secret `.env.example` so it can be committed. |
| `.env.example` | adjustment required | It exists locally with placeholder Supabase/test variable names but is ignored and not tracked. | Commit the placeholder file during foundation correction; never add values. |
| Folder structure | ✅ compliant / ⚪ verification required | `src/app`, `src/features/auth`, and colocated tests provide a scalable starting point. TM-01 gives no mandatory exact tree. | Keep current structure; document/extend by feature as future screens arrive. No reorganization for its own sake. |
| Centralized colors | adjustment required | `globals.css` has an `@theme` with verified auth colors, but Login still repeats raw Tailwind values extensively. | Reuse existing semantic variables/classes and add only verified roles; migrate incrementally. |
| Typography tokens | adjustment required | `@theme` provides a font family, but no complete semantic typography roles. Login repeats raw sizes/leading/tracking. | Add verified semantic typography roles after token naming is approved; do not invent unverified roles. |
| Spacing/sizing tokens | adjustment required | No explicit spacing/sizing token layer; Login uses repeated arbitrary values such as `8`, `16`, `24`, `48`, and control heights. | Add only the minimum verified semantic scale/aliases; preserve screen-specific dimensions where Figma requires them. |
| Border-radius tokens | adjustment required | Radius values are repeated in component classes and not centralized semantically. | Add verified radius roles for observed `2`, `4`, `8`, and `12` usage; verify whether these are intended as global tokens before naming. |
| Dependency policy | ✅ compliant for current work / adjustment required for TM-01 | React Hook Form and Zod were explicitly justified for Login; no forbidden data/client packages were added. TM-01 explicitly requires three missing formatting/class utilities. | Add only `prettier`, `prettier-plugin-tailwindcss`, and `tailwind-merge` in the foundation change; do not upgrade unrelated packages. |
| CI package-manager commands | conflicting | `.github/workflows/ci.yml` uses `cache: npm`, `npm ci`, and `npm run check`. | Pin/setup pnpm, use pnpm cache/install, and run the pnpm-equivalent check. |
| Current quality scripts | adjustment required | `lint`, `typecheck`, `test`, `build`, and `check` exist; `check` chains npm commands; no `format`. | Preserve script intent, convert invocations to pnpm usage, add format, and verify all required commands. |
| Documentation that references npm | adjustment required | Repository scripts and CI are npm-based; the audit search found no direct npm command requirements in core docs, but docs should be checked after migration. | Update command examples and workflow references that become stale; retain historical API/report evidence where npm is not a package-manager instruction. |
| Clean initial Git structure | ⚪ verification required | The current branch intentionally contains uncommitted Auth work and the prior implementation report. | Do not call the current feature worktree a clean initial structure; preserve it and assess cleanliness after foundation correction. |

### Authoritative TM-01 requirements extracted

TM-01 requires TypeScript, React/Next.js or Angular, Tailwind CSS, pnpm, ESLint, Prettier, `prettier-plugin-tailwindcss`, and `tailwind-merge`; no additional dependency without requirement and approval. It requires a scalable folder structure, Tailwind design tokens without repeated hardcoded values, TypeScript-aware ESLint with unused-variable/problem detection, a Prettier config and `pnpm format`, pnpm as the package manager, a committed placeholder `.env.example`, appropriate `.gitignore`, and successful `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`, and `pnpm format`.

Definition of Done explicitly includes successful initialization, TypeScript/Tailwind/pnpm/ESLint/Prettier configuration, successful pnpm install/dev/build/lint/format, `.env.example`, recommended folder structure, centralized Figma colors, typography, spacing/sizing, border-radius tokens, no unnecessary dependencies, no repeated hardcoded design values, and adherence to ESLint/Prettier rules.

### Figma source and design-system reconciliation

- TM-01’s original Figma URL is recorded as requirement provenance/reference: `https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Taskly--Tasks-Management-?node-id=31261-50&t=QvLoAPhbUC3q8qnP-0`.
- The accessible Dev Mode-capable copy is the implementation/design-inspection source: `https://www.figma.com/design/oL1WORO4G2iuQfSGPd4qvS/Taskly--Tasks-Management---Copy-`.
- Accessible Style Guide node inspected: `76:1757`. No binary-equality comparison with the original file was attempted or needed.
- Verified color evidence includes primary `#003D9B`, primary container `#0052CC`, surface highest `#D7E2FF`, surface low `#F1F3FF`, background `#F9F9FF`, navy `#041B3C`, muted slate `#4F5F7B`, border slate `#C3C6D6`, success `#82F9BE`, error `#BA1A1A`, and warning `#FFB300`.
- Verified typography evidence uses Inter, including Display-LG 56px/56px, Headline-LG 32px/40px, Title-MD 18px/27px, Body-MD 14px/22.75px, and label/system examples at 11px/16.5px and 10px/15px. These are evidence from the Style Guide showcase, not a claim that every semantic token name is already defined in code.
- Verified usage evidence includes spacing/gaps and dimensions at 4, 8, 12, 16, 24, 32, 48, and 96px, control heights around 48px, 64px, and 96px, and radius usage at 2px, 4px, 8px, and 12px. The accessible Style Guide does not expose a complete formal spacing/sizing/radius registry, so the correction must not invent additional token values or names.
- Verified reusable design-system evidence includes button variants at Style Guide node `76:1936`, form controls at `76:1946`, and Material Symbols Outlined iconography at `76:1981`.
- Exact screen-level implementation still requires a user-provided node-specific frame URL when a future screen is reached. No exact frame is invented by this audit; the user will provide the frame link when needed.

### Authentication Slice 1 impact

KEEP AS-IS:

- Server-only Supabase boundary, native fetch contract, cookie names/options, current-user lookup, one refresh attempt, safe error normalization, and token non-exposure.
- Login schema, route contracts, test intent, responsive Login structure, Figma source decision, and current approved dependency versions.

ADJUST later:

- Package-manager commands and CI after the pnpm migration.
- Prettier configuration and formatting; this may change whitespace and Tailwind class ordering only.
- Replace repeated verified raw design values in Login with centralized tokens incrementally.
- Add `tailwind-merge` only at an actual shared class-composition seam; do not mechanically rewrite Login around it.
- Review asset handling when the project’s committed SVG/SVGR workflow is established; this is separate from the TM-01 package-manager correction.

MOVE: none identified.

REWRITE: none identified. TM-01 does not technically require rebuilding the project or Authentication.

### pnpm migration plan — not executed

1. Preserve the current Auth work with a reversible WIP-preservation method approved at implementation time; record status and complete diff first.
2. Add a pinned `packageManager` field for the selected pnpm version compatible with the existing Node `24.20.0` engine/CI image.
3. Keep exact current dependency versions wherever technically possible. Add only TM-01’s required `prettier`, `prettier-plugin-tailwindcss`, and `tailwind-merge`; do not opportunistically upgrade Next/React/Auth packages.
4. Generate `pnpm-lock.yaml` from `package.json`, compare dependency resolution and scripts, and remove `package-lock.json` only after the pnpm lockfile and clean install are verified.
5. Update scripts to remain behaviorally equivalent, add `format`, and add format to the documented validation sequence without silently changing test/build behavior.
6. Update CI to provision/pin pnpm, enable pnpm caching, run `pnpm install --frozen-lockfile`, and invoke `pnpm run check` (with the required format verification explicitly included in the chosen check strategy).
7. Verify with a clean-install environment: `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm run format:check` or the agreed format command, `pnpm run check`, and `git diff --check`.
8. Update stale repository command documentation and verify Node/corepack/pnpm compatibility in CI and local development instructions.

### Design-system gap plan — not executed

- Retain the current Tailwind v4 `@theme` foundation and expand it only with Style Guide-backed semantic roles.
- Consolidate the already verified color values into role-based names used by components; remove duplicate raw values from Login incrementally, preserving exact Figma appearance.
- Define semantic typography roles from the verified Inter examples, then migrate repeated Login text classes without changing copy or responsive behavior.
- Define only the observed spacing/sizing/radius aliases after deciding whether TM-01 wants a small semantic scale or direct token names. Mark any value not present in `76:1757` for a specific Figma node/user confirmation.
- Do not create a new component library, redesign the palette, or reorganize Auth merely to satisfy tokenization.

### Safe Git recovery strategy

- Do not run stash, reset, checkout, clean, commit, or branch deletion during this audit.
- Safest operational option once implementation is explicitly authorized: create a temporary WIP commit containing the preserved Auth Slice 1 work, including untracked files, after reviewing its exact contents. This protects the complete state while package-manager/foundation changes are made and is reversible/squashable during final acceptance.
- A reversible alternative is `git stash push -u` with an explicit message, followed by verification using `git stash show --stat` and a controlled apply. Because the foundation work overlaps `package.json`, `package-lock.json`, and `globals.css`, a WIP commit is less conflict-prone than stashing and editing from the base state.
- After TM-01 correction and validation, continue on `feat/authentication`, restore/reconcile Auth, rerun all gates, review the complete combined diff, and only then decide whether a final commit is authorized.

### Recommended correction order

1. Architecture approval of this reconciliation and the pinned pnpm version.
2. Preserve Auth Slice 1 safely.
3. Add Prettier configuration/dependencies, `tailwind-merge`, packageManager pin, `.env.example` tracking exception, and pnpm lockfile; update scripts and CI.
4. Run clean pnpm install and foundation quality gates.
5. Add the minimum verified design tokens and migrate repeated values without changing Auth behavior.
6. Restore/reconcile Auth Slice 1, run visual review against exact user-provided frame URLs when required, and rerun lint/typecheck/test/build/format checks.

No rebuild is recommended. A rebuild should be considered only if later evidence proves the current Next/Tailwind architecture cannot satisfy TM-01, and no such evidence exists in this audit.

## Validation

- Read `AGENTS.md`, current package/scripts, lockfiles, CI, `.gitignore`, `.env.example`, source structure, current design/API/architecture docs, and the complete current Auth working-tree file set.
- Current branch/status recorded: `feat/authentication`; HEAD `44a9cf2af0944b088e57785a83dbb1fba87c7772`; uncommitted Auth implementation and report remain present; no implementation files were changed by this audit.
- Extracted the complete authoritative TM-01 Notion page from the supplied public page, including all technical requirements, expected commands, and Definition of Done items.
- Inspected accessible Figma copy Style Guide node `76:1757`, including palette, Inter typography examples, spacing/dimension/radius usage, buttons `76:1936`, inputs `76:1946`, and iconography `76:1981`.
- Confirmed `.env.example` exists locally but is ignored by `.gitignore` and is not tracked.
- Reviewed the prior Authentication Slice 1 validation record: lint passed, typecheck passed, 36/36 tests passed, production build passed, and `git diff --check` passed. These gates were not rerun because this task is audit/reconciliation planning only.
- No package install, format run, runtime implementation, Git mutation, or destructive operation was performed.

## Issues / Risks

- Notion requires pnpm while the current repository and CI use npm; migration must be done as an explicit lockfile/CI change and not mixed with an unreviewed dependency upgrade.
- Adding Tailwind sorting can create broad class-order diffs in the uncommitted Login implementation. This is expected formatting impact, not a reason to rewrite behavior; review the diff after formatting.
- `.env.example` is currently locally present but ignored/untracked; changing `.gitignore` requires care so real `.env*` secrets remain ignored.
- The Style Guide provides strong value evidence but not a complete formal token registry. Missing semantic token names/scales must be verified or approved before invention.
- Exact future screen implementation still needs node-specific Figma frame links from the user. The original TM-01 Figma link remains provenance only; the accessible copy is the working source.
- Current Auth work remains uncommitted and must not be discarded during correction.
- No corrections have been implemented, no packages were installed/uninstalled, and no commit/push/PR was created.

## Next step

Stop for architecture review. After approval, preserve the Auth work with the selected reversible Git strategy, then execute the pnpm/Prettier/token foundation correction in the documented order without rebuilding the project.
