# Initial Frontend Architecture

This document defines initial constraints, not a finished system design. Concrete structure must evolve from the verified product, Figma, and backend contracts after the Next.js scaffold exists.

## Platform

- Use the latest stable Next.js release selected at scaffold time.
- Use the App Router and strict TypeScript.
- Target Vercel deployment.
- Use Tailwind CSS for styling and translate verified design foundations into reusable tokens.

## Server and client boundaries

Server Components are the default. Use Client Components only for interaction, browser APIs, or client-local state that requires them. Keep client boundaries narrow and pass serializable, minimally necessary data across them.

Supabase secrets and privileged data access must remain in server-only modules and execute only through appropriate Next.js server boundaries, such as Server Components, Route Handlers, or Server Actions when their use is justified. Client Components must never import server-only modules or receive secrets.

## Data access

The preferred direction is:

`Browser -> Next.js server boundary -> Supabase`

Prefer native `fetch` and server-side Next.js data patterns initially. Define data access behind focused interfaces so transport details do not leak through UI components. Do not add a Supabase client library until a concrete requirement is documented and approved.

API operations, caching, revalidation, mutations, authentication requirements, and error contracts must be derived from the verified backend rather than guessed.

## Forms and validation

Use React Hook Form for interactive form state and Zod for schemas where forms are implemented. Treat browser validation as user experience, not a security boundary. Validate untrusted input again at the server boundary and map verified backend errors into useful field-level or form-level messages.

## State management

Prefer, in order, server-derived state, URL/search parameters, local component state, and focused React context. Add Redux Toolkit with Thunk only when durable, cross-feature global client state has been demonstrated and simpler ownership is inadequate. Codex must approve and document that decision. Do not mirror server data into a global client store by default.

## Types and organization

- Define precise reusable domain types from verified request, response, and database contracts.
- Keep transport types distinct from view models when their responsibilities differ.
- Avoid `any`; narrow `unknown` at boundaries. Any exceptional explicit `any` requires a documented reason and Codex approval.
- Organize code by clear feature and responsibility boundaries, keeping shared UI truly reusable and domain logic out of presentation components.
- Do not freeze a detailed folder tree before the scaffold and first verified features reveal the necessary boundaries.

## UI states and responsiveness

Every data-backed experience must deliberately handle loading, error, empty, success, and relevant disabled states based on the design and API contract. Errors must be actionable without leaking sensitive details.

Implement both desktop and mobile designs from their exact Figma nodes. Responsive behavior is a designed requirement, not an automatic collapse of desktop layouts. Preserve accessibility, keyboard behavior, focus treatment, readable content, and touch-target usability.

## Dependency policy

Use platform and existing-project capabilities first. Add a package only for a concrete requirement, after assessing maintenance, bundle, security, and overlap costs, and record the reason in the task report. Axios, TanStack Query, and React Router are forbidden. Testing packages will be selected during scaffold/setup from actual testing needs.
