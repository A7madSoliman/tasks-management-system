# Task Report

## What changed

- Added the exact Figma `icon/eye-off` SVG export from node `11556:61` at `public/assets/eye-off.svg`.
- Registered the asset as `AUTH_ASSETS.eyeOff` and applied the hidden/visible icon state to every Auth password visibility toggle: Login Password; Sign Up Password and Confirm Password; Reset Password New Password and Confirm Password.
- Preserved the existing hidden state (`type="password"` with `eye.svg`) and made the visible state use `type="text"` with `eye-off.svg`; existing labels, pressed state, keyboard behavior, focus styles, disabled state, validation, and autocomplete remain unchanged.
- Removed the state-dependent `opacity-60` from the Login and Sign Up password-icon images. Both the hidden `eye.svg` and visible `eye-off.svg` now render at full opacity in all five Auth password toggles; Reset Password was already full opacity.
- Normalized the Forgot Password page and desktop header background to `#f9f9ff`.

## Files changed

- `public/assets/eye-off.svg`
- `src/features/auth/assets/auth-assets.ts`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/SignUpForm.tsx`
- `src/features/auth/components/ResetPasswordForm.tsx`
- `src/features/auth/components/LoginForm.test.tsx`
- `src/features/auth/components/SignUpForm.test.tsx`
- `src/features/auth/components/ResetPasswordForm.test.tsx`
- `src/app/(auth)/forgot-password/page.tsx`

## Decisions

- Inspected Figma Sign Up mobile frame `1:923` and exact `icon/eye-off` node `11556:61` through Figma MCP. The committed `public/assets/eye-off.svg` is the exact 20x20 node asset, not a hand-authored or temporary MCP URL.
- Sized the rendered icon within the existing input-button structure at 20x20 with `object-contain` to preserve the exact glyph and alignment.
- The existing `public/assets/eye.svg` remains byte-for-byte unedited and uses its original `fill="#737685"`; the faded hidden state was caused by component-level `opacity-60`, not the SVG glyph or color.
- The Forgot Password `#f9f9ff` desktop background is an explicit product-owner override of the differing Figma background, not a Figma transcription correction.
- Confirmed no Auth API, server, session, schema, copy, or dependency behavior changed.

## Validation

- `pnpm lint` — passed.
- `pnpm typecheck` — passed.
- `pnpm test` — passed: 19 files, 138 tests.
- `pnpm build` — passed.
- `git diff --check` — passed.
- Targeted Prettier check for every changed supported TypeScript, test, and Markdown report file — passed after formatting only the eight changed TypeScript files. The exact Figma SVG is excluded because Prettier has no parser for `.svg` in this project.
- `pnpm format:check` — still fails with 40 findings, all outside this task's changed supported files.
- Formatting investigation: `core.autocrlf=true`; no `.gitattributes` exists; `.prettierrc.json` does not configure end-of-line behavior; and `git ls-files --eol` reports checked-in `i/lf` but Windows working-tree `w/crlf` for representative untouched files (`.github/workflows/ci.yml`, `package.json`, and `src/app/page.tsx`). This explains the local repository-wide Prettier baseline noise. Formatting only the eight current task TypeScript files reduced the global findings from 48 to 40 and left the targeted check clean.

## Issues / Risks

- The local repository-wide `format:check` remains non-zero because of the proven Windows CRLF baseline noise. Per the task instruction, the bounded diff may be committed because all changed supported task files pass the targeted Prettier check; CI on the clean checkout is the authoritative repository-wide formatting verification.

## Next step

- Review the scoped diff, commit it, push `fix/auth-visual-polish`, and create or update its PR to `main`; do not merge.
