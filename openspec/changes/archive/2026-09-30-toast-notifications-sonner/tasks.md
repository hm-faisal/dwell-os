# Tasks

## 1. Setup & Utilities Scaffolding

- [x] 1.1 Install `sonner`, `clsx`, and `tailwind-merge` packages via `bun add sonner clsx tailwind-merge` in `frontend`; verify `package.json` dependencies and lockfile.
- [x] 1.2 Implement `src/lib/utils.ts` exporting the standard shadcn `cn(...)` utility; verify module export and type compatibility.
- [x] 1.3 Implement `src/components/ui/Sonner.tsx` implementing the shadcn Toaster component with Tailwind CSS v4 class names and dark-mode support; verify component syntax and export.
- [x] 1.4 Implement `src/lib/toast.ts` providing standardized `showToast` helpers (`success`, `error`, `warning`, `info`, `promise`, and `verificationRequired`); verify TypeScript compilation and helper exports.
- [x] 1.5 Mount `<Toaster />` in `src/app/layout.tsx` so toasts are globally available across public and authenticated routes; verify root layout compiles cleanly without SSR hydration errors.

## 2. Global UI Components Modernization (shadcn/ui)

- [x] 2.1 Refactor `src/components/ui/Button.tsx` to shadcn design conventions using `cn()`, focus-visible rings (`focus-visible:ring-2 focus-visible:ring-offset-2`), and refined variant styles while maintaining `isLoading`, `variant`, and `size` prop compatibility; verify rendering and states.
- [x] 2.2 Refactor `src/components/ui/Input.tsx` to shadcn input tokens (`border-input`, `focus-visible:ring-2`), preserving label, error, and helperText support; verify input rendering and focus ring.
- [x] 2.3 Refactor `src/components/ui/Badge.tsx` to shadcn badge tokens with subtle borders and pill styling, preserving `BadgeProps` variants and the `StatusBadge` domain mapping; verify badge variants.
- [x] 2.4 Refactor `src/components/ui/Modal.tsx` to shadcn Dialog standards (`bg-black/60 backdrop-blur-xs`, `rounded-xl`, subtle border, accessible close button, and focus trap); verify modal open and dismiss transitions.
- [x] 2.5 Refactor `src/components/ui/Select.tsx` to match shadcn input aesthetic with custom chevron dropdown indicator and label/error handling; verify select interactions.

## 3. Authentication & Email Verification Toast Integration

- [x] 3.1 Integrate toast feedback in `src/app/(auth)/login/page.tsx` displaying positive feedback upon successful authentication and error toasts on invalid credentials; verify submission behavior.
- [x] 3.2 Integrate toast feedback in `src/app/(auth)/register/page.tsx` displaying welcome toast upon registration and error toasts on validation failure; verify submission behavior.
- [x] 3.3 Integrate toast feedback in `src/app/(auth)/verify-email/page.tsx` and `src/components/auth/EmailVerificationBanner.tsx` for verification link clicks, resend dispatch success, and resend error states; verify toast triggers.
- [x] 3.4 Enhance `src/lib/api.ts` with toast integration for `EMAIL_VERIFICATION_REQUIRED` errors and global network failures; verify that forbidden actions pop an actionable toast.

## 4. Property & Room Management Toast Integration

- [x] 4.1 Integrate toast feedback in `src/app/(dashboard)/properties/new/page.tsx` and property edit views for property creation success, update success, and validation error alerts; verify toast display.
- [x] 4.2 Integrate toast feedback in `src/app/(dashboard)/properties/[id]/rooms/new/page.tsx` and room edit/archive actions for room creation, updates, and deletion; verify toast display.

## 5. Verification, Lint & Build Validation

- [x] 5.1 Run Biome linter (`bun run lint`) across all frontend files and fix any formatting or lint issues; verify 0 errors and 0 warnings.
- [x] 5.2 Run Next.js production build (`bun run build`) with Turbopack to verify zero build errors, type mismatches, or SSR prerender issues.
