# API Contract Registry

## Current knowledge

Taskly uses an existing Supabase database/API backend. Currently known backend-related domains are:

- Authentication
- Projects and ownership
- Project invitations and membership
- Epics
- Tasks and task statuses
- Calendar and task statistics

No endpoint, table, RPC, field, enum, authorization rule, or payload shape is considered verified merely because its domain is listed here.

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

No operations have been verified yet.

Maintain verified enums separately with their source, exact values, TypeScript representation, and affected operations. No enums have been verified yet.
