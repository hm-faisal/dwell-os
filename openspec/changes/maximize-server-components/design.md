# Design

## Context

The current application codebase marks almost all page routes and the primary dashboard layout with `"use client";`. This includes `src/app/(dashboard)/layout.tsx`, all authentication pages (`login`, `register`, `verify-email`, `auth/callback`), and property/room create and edit pages.

As a result:
- Server Component optimization is bypassed for layout chrome and static page structures.
- Next.js 16 App Router metadata export (`export const metadata: Metadata = { ... }`) cannot be utilized on those pages.
- Client JavaScript bundles include static wrappers, headers, card containers, and layout boilerplate.

The project runs Next.js 16 on React 19, where route parameters (`params`) are asynchronous `Promise` objects in Server Components, and client components using search parameters must be wrapped in `<Suspense>` boundaries. UI primitives in `src/components/ui/` (`Button`, `Input`, `Badge`, `Select`) do not contain `"use client";` and are already server-compatible.

## Goals / Non-Goals

**Goals:**
- Convert `src/app/(dashboard)/layout.tsx` into a React Server Component by separating interactive header/session controls into a client leaf.
- Convert authentication route pages (`/login`, `/register`, `/verify-email`, `/auth/callback`) into Server Components that export standard Next.js `metadata`.
- Convert property and room creation and editing pages into Server Components that resolve asynchronous route `params` and delegate form handling to client leaves.
- Ensure all client hooks (`useState`, `useEffect`, `useRouter`, `useSearchParams`, `useForm`) remain safely contained within leaf components.
- Ensure build verification passes under `bun run build` and `bun run lint`.

**Non-Goals:**
- Rewriting form state libraries or switching away from TanStack Form or Zod.
- Refactoring complex data-table/listing pages that rely entirely on client-side filtering and real-time state beyond this scope.
- Modifying backend API routes or altering payload schemas.

## Decisions

### 1. Leaf Client Component Extraction Strategy
- **Decision:** Extract interactive components into modular feature directories (`src/components/auth/`, `src/components/dashboard/`, `src/components/properties/`, `src/components/rooms/`).
- **Rationale:** Keeps route `page.tsx` files as lightweight, readable server shells responsible for metadata, structural containers, and parameter resolution, while leaving form interaction and state in reusable, testable client leaves.
- **Alternatives Considered:** Colocating private `_components/` folders inside route directories. Rejected to maintain architectural consistency with the existing `src/components/` structure.

### 2. Dashboard Layout & Navbar Separation
- **Decision:** Make `src/app/(dashboard)/layout.tsx` a pure Server Component rendering the outer grid/flex shell and breadcrumb container, while extracting navigation links, active path indicators, session badge, and `TokenModal` into `<DashboardNavbar />` (`"use client";`).
- **Rationale:** The dashboard shell HTML and layout scaffolding are delivered immediately as static markup, while hydration is restricted to the navbar navigation items and session status.
- **Alternatives Considered:** Keeping the entire layout client-side. Rejected because layout nesting causes all child pages to be treated within a client boundary context.

### 3. Next.js 16 Asynchronous Parameter Resolution
- **Decision:** In dynamic server page routes (`/properties/[id]/edit`, `/properties/[id]/rooms/new`, `/properties/[id]/rooms/[roomId]/edit`), define props as `params: Promise<{ id: string; roomId?: string }>` and resolve them using `const { id } = await params;` before passing plain string props to client leaf forms.
- **Rationale:** Aligns with Next.js 16 breaking changes where route `params` are asynchronous. Passing resolved primitives to client components prevents prop serialization issues and avoids client-side waterfall suspensions.
- **Alternatives Considered:** Passing unresolved promises to client components and unwrapping with React 19's `use(params)`. Rejected because server resolution is cleaner and provides immediate value to metadata generation and server child rendering.

### 4. Suspense Wrapping for Search Parameter Readers
- **Decision:** In `/verify-email` and `/auth/callback`, wrap client leaf components that call `useSearchParams()` inside `<Suspense fallback={<LoadingSpinner />}>` within the server `page.tsx`.
- **Rationale:** Next.js App Router requires client components reading query parameters to be suspended during server-rendering to preserve static generation and avoid de-optimizing the route.
- **Alternatives Considered:** Reading search params only on server via `searchParams: Promise<...>`. Kept on client leaf because email verification and auth callback triggers client API mutation calls and browser token storage immediately upon mounting.

### 5. Metadata Export Standards
- **Decision:** Export static `Metadata` objects on all server-rendered page shells (e.g. `export const metadata: Metadata = { title: "Create Property | DwellOS" }`).
- **Rationale:** Restores proper document titles and descriptions without needing `next/head` or client-side `document.title` manipulation.

## Risks / Trade-offs

- **[Risk]** Client-side session state hydration mismatch in `<DashboardNavbar />` (e.g. showing "Not Logged In" on server then switching to user profile).
  - *Mitigation:* Ensure initial client render matches server markup using clean skeleton or empty state until mounted, preventing React hydration mismatch warnings.
- **[Risk]** Prop drill complexity if client forms require deep parameters.
  - *Mitigation:* Only pass essential IDs (`propertyId`, `roomId`) from server page to client leaf forms; client leaf forms fetch and hydrate their own form schemas using existing services (`propertyApi`, `roomApi`).
- **[Risk]** Build breakage from missing `<Suspense>` around `useSearchParams()`.
  - *Mitigation:* Mandate `<Suspense>` wrapper in server shells for `verify-email` and `auth/callback` and test via `bun run build`.

## Migration Plan

1. **Phase 1: Dashboard Layout Refactor**: Create `DashboardNavbar.tsx`, update `(dashboard)/layout.tsx` to Server Component.
2. **Phase 2: Auth Pages Refactor**: Create `LoginForm.tsx`, `RegisterForm.tsx`, `VerifyEmailCard.tsx`, and `AuthCallbackHandler.tsx`. Update auth `page.tsx` files to Server Components with metadata and `<Suspense>`.
3. **Phase 3: Property & Room Form Refactor**: Create `CreatePropertyForm.tsx`, `EditPropertyForm.tsx`, `CreateRoomForm.tsx`, and `EditRoomForm.tsx`. Update respective `page.tsx` files to Server Components with `await params`.
4. **Phase 4: Quality & Build Verification**: Run `bun run lint` and `bun run build` to verify error-free compilation and clean RSC boundaries.
