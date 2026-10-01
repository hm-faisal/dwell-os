# Tasks

## 1. Dependencies & Form Utilities Setup

- [x] 1.1 Install `@tanstack/react-form` and `zod` packages via `bun add @tanstack/react-form zod` in `frontend`; verify `package.json` dependencies and clean resolution.
- [x] 1.2 Implement reusable validation schemas in `src/lib/validations/` for authentication (`auth.ts`), properties (`property.ts`), and rooms (`room.ts`) using Zod; verify schema exports and TypeScript types.

## 2. Authentication Forms Migration

- [x] 2.1 Migrate `src/app/(auth)/login/page.tsx` to TanStack Form using `loginSchema`; verify email format validation, field-level error messages, submit button loading state, and toast feedback.
- [x] 2.2 Migrate `src/app/(auth)/register/page.tsx` to TanStack Form using `registerSchema`; verify password complexity rules, confirm password matching validator, role selection, terms acceptance, and submission toast triggers.

## 3. Property Management Forms Migration

- [x] 3.1 Migrate `src/app/(dashboard)/properties/new/page.tsx` to TanStack Form using `createPropertySchema`; verify property details, address fields, geographic coordinate bounds (-90..90, -180..180), dynamic arrays (amenities, photos, house rules), and toast on creation.
- [x] 3.2 Migrate `src/app/(dashboard)/properties/[id]/edit/page.tsx` to TanStack Form; verify asynchronous server data hydration, status selection, property update payload dispatch, and toast feedback.
- [x] 3.3 Migrate `src/app/(dashboard)/properties/[id]/page.tsx` Add Manager modal form to TanStack Form; verify manager user ID validation, permission toggle array, and assignment toast feedback.

## 4. Room Management Forms Migration

- [x] 4.1 Migrate `src/app/(dashboard)/properties/[id]/rooms/new/page.tsx` to TanStack Form using `createRoomSchema`; verify positive currency validation, `dollarsToCents` conversion, occupancy/stay rules, and room creation toast.
- [x] 4.2 Migrate `src/app/(dashboard)/properties/[id]/rooms/[roomId]/edit/page.tsx` to TanStack Form; verify async room data hydration, currency conversion, optimistic concurrency error handling, and update/archive toasts.

## 5. Verification, Lint & Build Validation

- [x] 5.1 Run Biome linter (`bun run lint`) across all frontend files and fix any formatting or lint issues; verify 0 errors and 0 warnings.
- [x] 5.2 Run Next.js production build (`bun run build`) with Turbopack to verify zero build errors, type mismatches, or SSR prerender issues.
