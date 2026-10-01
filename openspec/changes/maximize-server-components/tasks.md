# Tasks

## 1. Dashboard Layout & Navbar Isolation

- [x] 1.1 Create `src/components/dashboard/DashboardNavbar.tsx` as a Client Component (`"use client";`) extracting interactive navigation, path matching (`usePathname`), session display, and `TokenModal`, verifying component compiles with strict typing.
- [x] 1.2 Refactor `src/app/(dashboard)/layout.tsx` to remove `"use client";`, rendering the outer server layout shell and embedding `<DashboardNavbar />`, verifying the layout operates as a React Server Component.

## 2. Authentication Pages & Leaf Form Isolation

- [x] 2.1 Create `src/components/auth/LoginForm.tsx` as a Client Component with TanStack Form handling, and convert `src/app/(auth)/login/page.tsx` to a Server Component with exported `metadata`, verifying form validation and server title metadata.
- [x] 2.2 Create `src/components/auth/RegisterForm.tsx` as a Client Component with registration state, and convert `src/app/(auth)/register/page.tsx` to a Server Component with exported `metadata`, verifying form submission and server title metadata.
- [x] 2.3 Create `src/components/auth/VerifyEmailCard.tsx` as a Client Component, and convert `src/app/(auth)/verify-email/page.tsx` to a Server Component wrapping the card in a `<Suspense>` boundary, verifying email token reading.
- [x] 2.4 Create `src/components/auth/AuthCallbackHandler.tsx` as a Client Component, and convert `src/app/auth/callback/page.tsx` to a Server Component wrapping the handler in `<Suspense>`, verifying OAuth query callback processing.

## 3. Property & Room Server Page Shells & Forms

- [x] 3.1 Create `src/components/properties/CreatePropertyForm.tsx` as a Client Component, and refactor `src/app/(dashboard)/properties/new/page.tsx` to a Server Component with exported `metadata`, verifying property creation form workflow.
- [x] 3.2 Create `src/components/properties/EditPropertyForm.tsx` as a Client Component, and refactor `src/app/(dashboard)/properties/[id]/edit/page.tsx` to a Server Component resolving `await params` and passing `propertyId`, verifying property fetching and editing.
- [x] 3.3 Create `src/components/rooms/CreateRoomForm.tsx` as a Client Component, and refactor `src/app/(dashboard)/properties/[id]/rooms/new/page.tsx` to a Server Component resolving `await params` and passing `propertyId`, verifying room creation workflow.
- [x] 3.4 Create `src/components/rooms/EditRoomForm.tsx` as a Client Component, and refactor `src/app/(dashboard)/properties/[id]/rooms/[roomId]/edit/page.tsx` to a Server Component resolving `await params` and passing `propertyId` and `roomId`, verifying room editing workflow.

## 4. Verification & Integration

- [x] 4.1 Run project linter (`bun run lint`) and verify zero Biome / TypeScript errors across all modified and newly created components and routes.
- [x] 4.2 Run project production build (`bun run build`) and verify Turbopack Next.js 16 build succeeds, verifying static route generation and RSC separation pass cleanly.
