# Data Model: Authenticated Project Layout Shell

## Shell User Profile

Display-only serializable view model derived server-side from the authenticated user record.

| Field         | Type             | Rules                                                                                                                                                                        |
| ------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `displayName` | non-empty string | Use valid trimmed name; otherwise valid email; otherwise literal `User`.                                                                                                     |
| `jobTitle`    | optional string  | Include non-empty trimmed `job_title`; otherwise use non-empty trimmed legacy `department`; omit the line when both are absent or malformed.                                 |
| `initials`    | non-empty string | Name: first character of first two words; one word: first two characters. Email fallback: derive from local-part. If neither usable name nor email exists, use literal `US`. |

**Security rule**: This model MUST NOT contain raw `AuthUser`, cookies, access/refresh token, server API key, arbitrary metadata or secret.

## Shell State

| Field                | Type    | Lifecycle                                                                                                      |
| -------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `isSidebarCollapsed` | boolean | Local desktop UI state; initial state expanded; no persistence requirement.                                    |
| `isMobileDrawerOpen` | boolean | Local compact UI state; toggled by burger; dismissed by Escape or overlay. Figma supplies no close-icon asset. |

## Navigation Item

| Field             | Rules                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| label             | Exact Figma label in its responsive context.                                                         |
| asset             | Exact locally committed Figma SVG export.                                                            |
| active appearance | Projects uses the supplied active visual treatment.                                                  |
| destination       | `/project` only where verified; all other currently unverified entries must not gain invented hrefs. |
