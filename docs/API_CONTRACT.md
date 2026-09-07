# API Contract Registry

## Current knowledge

Taskly uses an existing Supabase database/API backend. Currently known backend-related domains are:

- Authentication
- Projects and ownership
- Project invitations and membership
- Epics
- Tasks and task statuses
- Calendar and task statistics

The sanitized Postman source is committed at `docs/api/taskly.postman_collection.json`. It is the verified request-contract evidence below; it contains placeholders only and no account credentials or tokens.

## Security boundary

The Supabase secret key is server-only. It must never appear in `NEXT_PUBLIC_*` variables, Client Components, browser bundles, logs, task reports, fixtures, or committed files. Privileged calls must flow through a Next.js server boundary. The exact key types, public-client capabilities, authentication mechanism, and row-level security behavior remain to be verified from the backend.

## Verification policy

Verify API details against the actual backend, Postman collections or documentation, and SQL/schema sources. When sources disagree, record the conflict and obtain a Codex decision before implementation. Do not invent conventional Supabase tables, REST paths, RPC names, responses, or permissions.

## Incremental contract records

Add verified entries as implementation progresses. Each operation record should include:

| Field | Required information |
| --- | --- |
| Domain and operation | User-facing purpose and verified backend operation |
| Backend primitive | Verified endpoint, RPC, query, or mutation identifier |
| Method and inputs | HTTP method or invocation form, parameters, body, and validation |
| Success response | Exact verified shape and reusable TypeScript type |
| Errors | Verified status/error shapes and expected UI handling |
| Authentication | Session or credential requirement |
| Authorization | Verified ownership, membership, or policy constraint |
| Evidence | Postman, SQL, backend documentation, or inspected response |

## Verified from Postman and live smoke test

All documented Auth requests require `apikey: {{api_key}}` and `Content-Type: application/json`; values remain server-only in the application. Postman supplies request definitions and only Login/Refresh test scripts; it supplies no saved success/error examples. The live smoke test verified Login, Get User, Refresh Token, and Logout success structurally, including the presence of access and refresh tokens, but did not retain or print payloads.

| Operation | Method and endpoint | Body | Additional authentication | Evidence |
| --- | --- | --- | --- | --- |
| Sign Up | `POST /auth/v1/signup` | `email`, `password`, `data.name`, `data.department` | None beyond `apikey` | Postman |
| Login | `POST /auth/v1/token?grant_type=password` | `email`, `password` | None beyond `apikey` | Postman; live success. Its script reads `access_token`, `refresh_token`, and `user.id`. |
| Get User | `GET /auth/v1/user` | None | `Authorization: Bearer {{access_token}}` | Postman; live success and authenticated-account match. |
| Update Password | `PUT /auth/v1/user` | `password` | `Authorization: Bearer {{access_token}}` | Postman only; not invoked. |
| Refresh Token | `POST /auth/v1/token?grant_type=refresh_token` | `refresh_token` | None beyond `apikey` | Postman; live success. Its script replaces both token variables. |
| Forgot Password | `POST /auth/v1/recover` | `email` | None beyond `apikey` | Postman only; not invoked. |
| Logout | `POST /auth/v1/logout` | None | `Authorization: Bearer {{access_token}}` | Postman; live success. |

Authenticated Projects, Epics, and Tasks requests consistently include both `apikey: {{api_key}}` and `Authorization: Bearer {{access_token}}`. This is verified request behavior, not proof of particular RLS policies. The collection identifies project RPCs (`get_projects`, `invite_member`, `accept_invitation`) and REST resources, but does not expose policy definitions.

## Inferred architecture decision

The frontend will use native `fetch` only through a Next.js server boundary. The server reads `SUPABASE_BASE_URL` and `SUPABASE_API_KEY`, performs the verified requests, normalizes only known-safe error fields once verified, and owns HttpOnly, Secure (in production), SameSite=Lax cookies. Browser code receives neither API key nor access/refresh token. A successful Login/Refresh response will be stored only in server-set cookies; server-side user lookup drives protected-page rendering and redirects. No Supabase client library, token localStorage, Redux token state, generic API wrapper, or Auth Context is justified.

## Still unknown / requires later verification

- Exact response and error JSON schemas, status codes, rate-limit behavior, signup confirmation/session behavior, recovery redirect configuration, password-update session requirements, logout invalidation semantics, token lifetimes/rotation, and refresh failure behavior.
- RLS policies, authorization scope, database claims, allowed redirect destinations, and whether `data.name`/`data.department` are persisted or consumed by application domain data.
- The Postman request definitions do not establish email-verification behavior or any specific post-auth route.

Maintain verified enums separately with their source, exact values, TypeScript representation, and affected operations. No enums have been verified yet.
