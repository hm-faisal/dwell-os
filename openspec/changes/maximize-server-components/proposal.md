# Proposal

## Why

Currently, almost every layout and page route in the application (`(dashboard)/layout.tsx`, all authentication pages, and property/room create and edit pages) is marked with `"use client";`. This disables React Server Components (RSC) optimization, bloats client-side JavaScript bundles with static layout and chrome, and prevents pages from exporting Next.js server `metadata` for titles and SEO. Migrating pages and layouts to Server Components while isolating client interactivity to small leaf components aligns the project with modern Next.js 16 App Router architecture and maximizes initial load speed and cacheability.

## What Changes

- **Dashboard Layout**: Convert `src/app/(dashboard)/layout.tsx` into a Server Component. Extract interactive navigation, token management modal, and user session display into a dedicated `<DashboardNavbar />` client component.
- **Authentication Pages**:
  - Convert `src/app/(auth)/login/page.tsx` to a Server Component with exported `Metadata`, moving interactive form logic into `<LoginForm />`.
  - Convert `src/app/(auth)/register/page.tsx` to a Server Component with exported `Metadata`, moving interactive form logic into `<RegisterForm />`.
  - Convert `src/app/(auth)/verify-email/page.tsx` and `src/app/auth/callback/page.tsx` to Server Components wrapping client handlers in `<Suspense>`.
- **Property & Room Forms**:
  - Convert `src/app/(dashboard)/properties/new/page.tsx` to a Server Component with `Metadata`, extracting `<CreatePropertyForm />`.
  - Convert `src/app/(dashboard)/properties/[id]/rooms/new/page.tsx` to a Server Component resolving `await params`, extracting `<CreateRoomForm />`.
  - Convert `src/app/(dashboard)/properties/[id]/edit/page.tsx` and `src/app/(dashboard)/properties/[id]/rooms/[roomId]/edit/page.tsx` to Server Components resolving route `params` asynchronously (Next.js 16 convention) and rendering client form loaders at the leaf level.
- **Metadata Support**: Add statically and dynamically generated metadata (`title`, `description`) to all server-rendered page routes.

## Capabilities

### New Capabilities
- `server-components`: Architecture standards, component boundary separation, static server shells, Next.js 16 async route parameters, and leaf-level Client Component isolation across the Next.js App Router.

### Modified Capabilities
<!-- None: existing UI components and form validation schemas remain fully functional without requirement regressions. -->

## Impact

- **Bundle Size**: Significant reduction in client JavaScript bundle size for initial page visits by excluding layout shells, breadcrumbs, and static headers.
- **SEO & Browser Navigation**: Native support for Next.js 16 `metadata` across all dashboard and authentication routes.
- **File Structure**: Introduces clean leaf client components in `src/components/auth/` and `src/components/dashboard/` while making route `page.tsx` and `layout.tsx` files pure Server Components.
