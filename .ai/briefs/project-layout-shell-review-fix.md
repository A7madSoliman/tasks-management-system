# Project Layout Shell — Codex Review Fix

Apply only these corrections to the current Project Layout Shell implementation. Do not commit or push.

1. In `src/features/project-shell/profile.ts`, when name is unusable and email is the fallback, omit `jobTitle` even if `user_metadata.job_title` is valid. The approved truth table requires the title only with a valid name. Update focused tests.
2. Replace inactive Epics/Tasks/Members/Details `role="button"` / `aria-disabled` elements with honest, accessible non-link presentation semantics. They must have no fake href, be non-interactive, and must not claim a button role.
3. Remove the hand-written Vitest SVG-to-React transformer from `vitest.config.mts`. It is an unnecessary new architecture and uses `dangerouslySetInnerHTML`. Configure SVG module handling only as minimally necessary for tests, without an additional package or hand-authored SVG markup. Preserve the approved `@svgr/webpack` production configuration.
4. Keep all current approved behavior, tests, assets, server/client boundaries, and report contract intact. Run focused tests for the changed behavior and update the implementation report factually; rerun its clipboard round-trip.
