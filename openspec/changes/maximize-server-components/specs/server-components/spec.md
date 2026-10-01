# Spec Delta

## Purpose

Establishes React Server Component (RSC) architectural standards, layout boundaries, metadata exports, and leaf-level Client Component isolation across the Next.js App Router.

## ADDED Requirements

### Requirement: Server Component Layouts and Chrome
The system SHALL render page shells, dashboard layout wrappers, and structural HTML as React Server Components without `"use client";`. Interactive layout elements such as navigation links, user session menus, and auth token modals SHALL be isolated into dedicated leaf Client Components.

#### Scenario: Dashboard layout rendered on server
- **WHEN** a user requests a dashboard route (e.g. `/properties`)
- **THEN** Next.js server-renders the HTML layout shell and streams interactive navbar elements via a client component boundary without shipping layout markup in client JS bundles

#### Scenario: Dynamic user session in client navbar
- **WHEN** the browser client mounts the interactive navbar
- **THEN** the navbar synchronizes active session and authentication status while leaving the surrounding layout hierarchy server-rendered

### Requirement: Server Component Page Shells and Metadata
The system SHALL define page routes (`/login`, `/register`, `/verify-email`, `/properties/new`, etc.) as React Server Components that export standard Next.js `metadata` definitions (page title, description) and render page layout structure.

#### Scenario: Static metadata on authentication pages
- **WHEN** a user or search engine navigates to `/login` or `/register`
- **THEN** the server returns full HTML document title and description meta tags configured via Next.js metadata API

#### Scenario: Dynamic route parameter handling
- **WHEN** accessing dynamic routes such as `/properties/[id]/rooms/new` or edit routes
- **THEN** the Server Component resolves the asynchronous route parameters (`await params`) in compliance with Next.js 16 conventions and passes resolved IDs down to client leaves

### Requirement: Leaf-Level Client Component Isolation
The system SHALL strictly isolate client-side hooks (`useState`, `useEffect`, `useForm`, `useRouter`, `usePathname`), browser storage access (`localStorage`), and event listeners to focused leaf components, preventing `"use client";` from propagating upwards into page roots.

#### Scenario: Form submission within client leaf
- **WHEN** a user interacts with and submits an auth, property, or room form
- **THEN** the client leaf component handles validation, form state, and API submission without requiring the parent page to be a client component

#### Scenario: Search parameters reading wrapped in Suspense
- **WHEN** a page reads URL search parameters on the client (such as email verification token)
- **THEN** the client component is wrapped in a `<Suspense>` boundary to maintain server streaming compatibility
