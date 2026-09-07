# Task Report

## What changed

Produced the reviewed Phase 1 scaffold and tooling plan only. No application scaffold, dependency installation, product feature, Figma-derived UI, Supabase integration, Redux store, staging, or commit was performed.

## Files changed

- `.ai/reports/phase-1-scaffold-plan.md`

Existing Phase 0 files and `.delegate/config.json` remain unchanged.

## Decisions

### 1. Proposed scaffold approach

Use npm and the pinned official `create-next-app@16.3.4` generator. Because this repository already contains authoritative documentation and delegate configuration, generate an empty application in a uniquely named system temporary directory with installation disabled, then review and merge only scaffold files into the repository.

Planned generator command:

```powershell
npx create-next-app@16.3.4 taskly-scaffold `
  --typescript `
  --eslint `
  --tailwind `
  --app `
  --src-dir `
  --turbopack `
  --import-alias "@/*" `
  --empty `
  --use-npm `
  --disable-git `
  --skip-install `
  --no-react-compiler `
  --no-agents-md `
  --yes
```

The flags and defaults are documented by the [Next.js create-next-app CLI](https://nextjs.org/docs/app/api-reference/cli/create-next-app). `--disable-git` prevents a nested repository; `--no-agents-md` preserves Taskly's existing constitution; `--skip-install` avoids installing twice. The merge allowlist is the generated application/config files only. Review `.gitignore` as a union rather than overwriting it, ensure `.delegate/config.json` is not ignored, retain the existing project docs and reports, and replace generic template copy/assets with a neutral non-product scaffold.

Before implementation, upgrade and verify Node.js `24.20.0` LTS. Record it in `.nvmrc` and set `package.json.engines.node` to `>=24.20.0 <25`. The official [Node.js release table](https://nodejs.org/en/about/previous-releases) identifies Node 24 as LTS and `24.20.0` as the latest LTS patch on the planning date.

Use exact direct dependency versions in `package.json` and commit the generated `package-lock.json` only after a future reviewed implementation. Re-query the authoritative registry immediately before implementation; if any approved version has changed, report the difference rather than silently changing this plan.

### 2. Exact initial dependencies

Version snapshot: 2026-09-07, from official npm registry metadata and framework documentation.

Runtime dependencies:

| Package | Version | Why it is needed |
| --- | ---: | --- |
| `next` | `16.3.4` | Current stable App Router framework and Vercel runtime integration |
| `react` | `19.2.8` | React runtime required by Next.js |
| `react-dom` | `19.2.8` | DOM renderer required by Next.js |

Development dependencies:

| Package | Version | Why it is needed |
| --- | ---: | --- |
| `typescript` | `7.0.2` | Strict static typing and typecheck gate |
| `@types/node` | `24.13.3` | Node 24 APIs without incorrectly targeting the current Node 26 type line |
| `@types/react` | `19.2.18` | React 19 TypeScript declarations |
| `@types/react-dom` | `19.2.7` | React DOM TypeScript declarations |
| `tailwindcss` | `4.3.3` | Required utility styling foundation |
| `@tailwindcss/postcss` | `4.3.3` | Tailwind v4 PostCSS integration for Next.js |
| `postcss` | `8.5.28` | CSS transformation host used by the Tailwind plugin |
| `eslint` | `10.10.0` | Standalone lint gate; Next.js 16 no longer runs lint during build |
| `eslint-config-next` | `16.3.4` | Next.js Core Web Vitals and TypeScript flat-config rules |
| `vitest` | `5.0.0` | Fast unit/component test runner |
| `vite` | `8.2.2` | Explicit compatible peer for Vitest tooling and the React test plugin |
| `@vitejs/plugin-react` | `6.1.1` | React transform used by the Vitest configuration |
| `vite-tsconfig-paths` | `6.1.1` | Keeps Vitest resolution aligned with the `@/*` TypeScript alias |
| `jsdom` | `30.0.1` | Browser-like DOM for component tests |
| `@testing-library/react` | `16.3.3` | User-facing React component test utilities |
| `@testing-library/dom` | `10.4.1` | Explicit peer and semantic DOM query foundation |
| `@testing-library/jest-dom` | `7.0.1` | Readable DOM assertions integrated with Vitest |

The [Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest) supports the Vitest, React Testing Library, jsdom, React plugin, and alias-plugin setup. The Vite and plugin versions have compatible peer ranges.

Do not install these during the initial scaffold:

- React Hook Form, `@hookform/resolvers`, Zod, and sonner: add only with the first verified form/toast requirement.
- `@testing-library/user-event`: add with the first interactive behavior test.
- `@playwright/test`: add before the first async Server Component or critical browser flow; Vitest does not support async Server Components.
- `@svgr/webpack`: add with the first verified Figma SVG, then prove the documented Turbopack loader rule with a real asset. The [Next.js Turbopack documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) explicitly supports `@svgr/webpack`, but an unused loader is not justified yet.
- Redux Toolkit/Thunk, Supabase libraries, MSW, Axios, TanStack Query, React Router, Prettier, Husky, and lint-staged: there is no current requirement justifying them. Axios, TanStack Query, and React Router remain forbidden.

### 3. Proposed test and tooling stack

- Vitest with a jsdom environment for pure logic, synchronous Server Components, and Client Components.
- React Testing Library with semantic queries and jest-dom assertions.
- One neutral scaffold smoke test proving the root page renders; no product behavior or visual design is implied.
- `vitest.config.mts` uses `@vitejs/plugin-react`, `vite-tsconfig-paths`, and `src/test/setup.ts`.
- Tests are colocated as `*.test.ts` or `*.test.tsx`; shared test setup lives in `src/test/`.
- No coverage threshold in the scaffold. Establish a meaningful threshold after real application code exists.
- No Playwright or MSW yet. Their triggers are documented above.

### 4. Proposed scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --max-warnings=0",
  "lint:fix": "eslint . --fix --max-warnings=0",
  "typecheck": "next typegen && tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "check": "npm run lint && npm run typecheck && npm run test && npm run build"
}
```

Next.js 16 uses Turbopack by default, so the normal `next dev` and `next build` scripts remain portable. `next typegen` generates App Router route-aware helpers before standalone TypeScript checking, as documented in the [Next.js TypeScript reference](https://nextjs.org/docs/app/api-reference/config/typescript). ESLint uses the generated flat configuration with `core-web-vitals` and TypeScript rules, following the [Next.js ESLint reference](https://nextjs.org/docs/app/api-reference/config/eslint).

### TypeScript and Tailwind setup

Start from the official generated `tsconfig.json`, retain `strict`, `noEmit`, `isolatedModules`, bundler resolution, the Next plugin, and generated-type includes, then set:

```json
{
  "allowJs": false,
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "forceConsistentCasingInFileNames": true
}
```

Enable stable `typedRoutes: true` in `next.config.ts`. Use `unknown` and narrowing at untrusted boundaries; do not create speculative domain types. If strict optional/indexed access exposes third-party declaration defects rather than application defects, Codex will evaluate a narrowly documented workaround before relaxing a project-wide rule.

Use Tailwind v4's CSS-first setup: `@tailwindcss/postcss` in `postcss.config.mjs` and `@import "tailwindcss"` in the global stylesheet, following the [official Tailwind Next.js guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs). Do not create a Tailwind v3-style configuration or invent Taskly colors, spacing, breakpoints, or typography tokens before Figma MCP inspection.

### 5. Proposed initial directory structure

```text
.
|-- .ai/reports/                 # existing reports
|-- .delegate/config.json        # existing trusted project lanes
|-- docs/                        # existing project context
|-- scripts/copy-report.ps1      # existing report helper
|-- src/
|   |-- app/
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx             # neutral scaffold health page only
|   `-- test/
|       `-- setup.ts
|-- .gitignore
|-- .nvmrc
|-- AGENTS.md                    # existing constitution, preserved
|-- eslint.config.mjs
|-- next.config.ts
|-- package-lock.json
|-- package.json
|-- postcss.config.mjs
|-- tsconfig.json
`-- vitest.config.mts
```

Do not create placeholder `components`, `features`, `lib/server`, `types`, routes, or domain models. Add those boundaries only when the first verified implementation needs them. Do not add Supabase environment names or examples until the actual backend contract identifies the required variables.

### Architecture boundary

The scaffold contains no backend client or data call. Future privileged access remains `Browser -> Next.js server boundary -> Supabase`. Server Components remain the default, Client Components stay narrow, and secrets must never use `NEXT_PUBLIC_*` or cross into client imports. Redux remains absent until durable cross-feature global client state is demonstrated.

Muse's read-only review supported the isolated scaffold, dependency deferrals, strict TypeScript direction, and testing split. Codex independently decided to pin Vite because it is an explicit plugin peer and to enable typed routes because route safety is a stable, zero-runtime-cost foundation. Muse made no repository changes.

## Validation

- Read `AGENTS.md` and all five governing files in `docs/` before planning.
- Inspected the repository branch, status, file inventory, and local tool versions. The repository remains documentation-only on `docs/phase-0-project-context`; all work is uncommitted and there is no prior commit.
- Verified local tools: Node `24.12.0`, npm `11.19.0`, Git `2.53.0.windows.1`.
- Queried official npm registry metadata for every proposed package version and relevant engine/peer constraints. No packages were installed.
- Checked official Next.js 16.3.4 CLI, installation, TypeScript, ESLint, Vitest, and Turbopack documentation; checked official Tailwind v4 setup and Node release status.
- Ran the configured OpenCode/Muse `planning` lane with the read-only plan agent. The run completed and changed no files.
- Copied this completed report with `scripts/copy-report.ps1` and verified the clipboard contains the full UTF-8 text.
- Application lint, typecheck, tests, and build were not run because the scaffold does not exist and this task is planning-only.

## Issues / Risks

- **Blocker before installation:** local Node `24.12.0` is below jsdom 30's Node 24 requirement (`>=24.15.0`). Upgrade to and verify Node `24.20.0` first.
- All Phase 0 and Phase 1 files remain untracked because the repository has no commits. The next implementation diff will include the full repository unless Phase 0 is reviewed and committed separately by the authorized owner.
- Tailwind v4 requires modern browsers. Confirm that Taskly may target its documented baseline before accepting the scaffold; otherwise Tailwind 3.4 would be a deliberate compatibility exception.
- Exact package versions can move after this dated plan. Re-verify before implementation and surface changes for approval.
- SVGR, forms, toasts, browser E2E, API mocking, Supabase integration, global state, Figma tokens, and product features are intentionally unresolved/deferred until a concrete verified need exists.
- `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` intentionally trade some ergonomics for stronger correctness; assess real third-party friction rather than weakening them preemptively.
- The current branch name references Phase 0. Do not create branch churn while the repository has no commits; resolve the initial commit/branch strategy before landing scaffold work.

## Next step

Review and explicitly accept or revise this Phase 1 scaffold plan. After acceptance, upgrade Node, generate the isolated scaffold, merge only the approved files, install the exact approved dependencies, and have Codex independently run `npm run check`. Do not implement product features or commit without separate review and authorization.
