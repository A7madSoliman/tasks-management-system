# Taskly Project Context

Repository tooling uses pnpm 11.23.0 and the Node 24.20.0 engine policy.

## Product

Taskly is a tasks management system inspired by products such as ClickUp. It is a training project intended to practice a professional frontend workflow: requirements discovery, design-to-code implementation, typed integration with an existing backend, responsive UI, testing, review, and deployment to Vercel.

## Known users and roles

The currently known actors are:

- Authenticated users
- A project owner
- People invited to a project by its owner
- Project members

The exact permissions, invitation lifecycle, authentication behavior, and distinctions between invited people and active members are not yet verified. They must come from the backend contract and relevant Figma flows.

## Known domain concepts

- Authentication
- Projects and project ownership
- Invitations and project membership
- Epics
- Tasks
- Task statuses
- Calendar and task statistics
- Dashboard

These names establish investigation areas, not complete domain models. Fields, relationships, enums, invariants, and authorization rules remain provisional until verified.

## Current feature areas

The known product areas include authentication, project and member management, epics and tasks, task-status workflows, invitations, dashboard information, calendar/statistics views, and responsive desktop/mobile experiences.

## Sources of truth

- Figma is the source of truth for UI scope, visual behavior, component states, and responsive presentation.
- The existing Supabase/API contract, Postman material, and SQL definitions are the source of truth for data shapes, operations, enums, authentication, and authorization.
- Repository architecture documents govern implementation decisions after they have been approved by Codex.

## Scope discipline

Do not infer unsupported product behavior from ClickUp or other products. Before implementing a feature, verify its exact Figma nodes and relevant backend contract. Record conflicts or missing information as open questions; do not resolve them by inventing screens, flows, endpoints, fields, roles, or permissions.
