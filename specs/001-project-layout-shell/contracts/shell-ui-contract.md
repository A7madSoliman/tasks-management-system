# Shell UI Contract

## Server-to-shell profile contract

The server route layout passes only `ShellUserProfile` to the client interaction shell:

```text
displayName: non-empty string
jobTitle?: non-empty string
initials: non-empty string
```

No raw authenticated user record, HTTP-only cookie, access token, refresh token, API key or arbitrary backend metadata may cross this boundary.

The mapper safely narrows only `user.user_metadata.name`, `user.user_metadata.job_title`, and verified legacy `user.user_metadata.department`. A valid non-empty `job_title` wins; otherwise a valid non-empty `department` supplies the legacy `jobTitle` fallback. It uses a valid email only as fallback display data. If neither usable name nor email exists, it emits `displayName: "User"`, `initials: "US"`, and omits `jobTitle`.

## Responsive contract

| Condition      | Required shell behavior                                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Width >=1024px | Expanded 256px desktop sidebar by default; collapse to 80px icon-only state.                                                                                                        |
| Width <1024px  | Header burger controls 288px labelled drawer with dimmed overlay; persistent 64px Bottom Navigation is visible while closed and is underneath/non-interactive while drawer is open. |

## Interaction contract

- Controls have accessible names and visible keyboard focus.
- Drawer open action moves focus inside; Escape and overlay dismiss; dismissal restores focus to burger. No visual close icon is added unless an exact Figma export is available.
- Existing logout ends the server-managed session and the resulting route is `/login`.
- The only verified navigation destination is `/project`; no other href is defined in this feature.
- Epics, Tasks, Members and Details use accessible non-link semantics with no fake `href="#"`.

## Loading contract

Route loading uses only verified surface/background, border and shadow treatment. It contains no skeleton, spinner, fake data or invented timing behavior.

## Exact SVG asset inventory

Commit the exact exported bytes from the named Figma layer into the shell SVGR source-asset directory. Do not persist temporary MCP URLs, recreate paths, substitute Material/text glyphs, or reuse a legacy public asset unless its exported geometry is verified identical.

| Asset purpose              | Figma evidence / layer                                                            | Notes                                                              |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Taskly logo                | `1:986` layer `2:26`; `1:733` layer `2:32`; `1:553` layer `2:54`                  | Use the export associated with the rendered target state.          |
| Projects                   | `1:986` `1:1180`; `1:733` `1:740`; `1:553` `1:694`; `1:401` `15:269`              | Compact Bottom Navigation export is separately inventoried.        |
| Epics                      | `1:986` `1:1185`; `1:733` `1:746`; `1:553` `1:699`; `1:401` `15:274`              | Preserve exact responsive export.                                  |
| Tasks                      | `1:986` `1:1190`; `1:733` `1:752`; `1:553` `1:704`; `1:401` `15:279`              | Preserve exact responsive export.                                  |
| Members                    | `1:986` `1:1195`; `1:733` `1:758`; `1:553` `1:709`; `1:401` `15:284`              | Preserve exact responsive export.                                  |
| Details                    | `1:986` `1:1200`; `1:733` `1:764`; `1:553` `1:714`; `1:401` `15:289`              | Preserve exact responsive export.                                  |
| Collapse                   | `1:986` `1:1206`                                                                  | Expanded desktop action.                                           |
| Expand                     | `1:733` collapsed sidebar action using its rendered container asset after `1:764` | Verify the exact exported layer during T002; no replacement glyph. |
| Burger                     | `1:401` `1:517`; `1:553` `1:661`                                                  | Reuse only after geometry comparison.                              |
| Logout                     | `1:986` `1:1211`; `1:733` `2:43`; `1:553` `2:48`                                  | Use matching responsive state export.                              |
| Bottom Navigation Projects | `1:401` `15:269`                                                                  | 18px export.                                                       |
| Bottom Navigation Epics    | `1:401` `15:274`                                                                  | 20px × 18px export.                                                |
| Bottom Navigation Tasks    | `1:401` `15:279`                                                                  | 20px × 15.075px export.                                            |
| Bottom Navigation Members  | `1:401` `15:284`                                                                  | 22px × 16px export.                                                |
| Bottom Navigation Details  | `1:401` `15:289`                                                                  | 20px export.                                                       |

No close icon is represented by Figma `1:553` or `1:401`; do not create one. The avatar photograph and dashboard/FAB assets shown in `1:553` are out of scope.
