# Quickstart Validation: Authenticated Project Layout Shell

## Prerequisites

- Local environment configured for existing server authentication.
- A valid signed-in session for manual authenticated checks.
- Node and pnpm versions matching repository policy.

## Focused checks

1. Run targeted shell/profile tests after implementation.
2. Sign in and request `/project`; confirm header display name, optional title, initials, content slot and logout-to-login behavior.
3. At >=1024px, verify 256px expanded and 80px collapsed sidebars, labelled/icon-only content and keyboard controls.
4. At <1024px, verify burger, 288px drawer, overlay, close/Escape/focus restoration and persistent 64px Bottom Navigation without obscuring content.
5. Verify missing-title, missing-name/email fallback, one-word and multi-word initials fixtures.
6. Verify loading display contains only approved surface/border/shadow treatment.

## Repository gates

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm format:check
pnpm build
git diff --check
```

Expected: every command exits successfully. Codex alone independently runs and claims these final acceptance gates after implementation review; agy may report only focused feature tests and proportionate local validation.
