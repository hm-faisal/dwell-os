# Design

## Context

See `proposal.md` for motivation.

DwellOS frontend is built on Next.js 16 (Turbopack), React 19, and Tailwind CSS v4. Currently, the user interface handles asynchronous errors and completion states through inline component state variables (e.g. `errorMessage`, `resendSuccessMessage`) or native browser behaviors. Furthermore, existing global UI components in `src/components/ui/` (`Button`, `Input`, `Badge`, `Modal`, `Select`) use manual class concatenations without clean variant composition or standard focus rings.

Shadcn's component architecture pairs headless accessibility with Tailwind utility classes and the `clsx` + `tailwind-merge` (`cn`) helper pattern. Integrating `sonner` and modernizing `src/components/ui/` brings a unified, accessible, and reactive design language to DwellOS.

## Goals / Non-Goals

**Goals:**
- Provide a standardized, globally accessible toast notification infrastructure via `sonner` and a shadcn-compatible `Toaster` component.
- Provide a typed, centralized notification helper (`src/lib/toast.ts`) supporting `success`, `error`, `warning`, `info`, and `promise` variants with unified styling.
- Wire toast notifications into critical user interaction touchpoints: authentication (login, register, logout), verification flow (resend email, email verified), property creation/editing, and room addition.
- Provide a dedicated `showToast.emailVerificationRequired()` toast that displays a direct action button to `/verify-email`.
- Modernize all existing global UI components (`Button`, `Input`, `Badge`, `Modal`, `Select`) to shadcn/ui design tokens (`border-input`, `focus-visible:ring-2`, `ring-offset`, smooth transitions, accessible contrast).
- Maintain 100% backward compatibility with existing component prop interfaces (`variant`, `size`, `isLoading`, `error`, `helperText`, etc.) so that all existing views continue working without breaking changes.

**Non-Goals:**
- Persistent in-app notification inbox / bell notification history (out of scope; this change focuses on transient viewport feedback).
- Replacing entire pages with new layouts (the scope is the global UI component primitives and reactive feedback).

## Decisions

### Decision 1: Use `sonner` as the Toast Engine
- **Choice**: `sonner` with shadcn Tailwind component wrapper.
- **Alternatives Considered**:
  - *react-hot-toast*: Popular, but older design language and less cohesive with modern shadcn/Tailwind v4 theme classes.
  - *radix-ui/react-toast*: Highly unstyled and requires manual portal, state, and animation orchestration.
  - *Custom DOM portals*: High maintenance and lacks swipe-to-dismiss or keyboard accessibility out of the box.
- **Rationale**: `sonner` is lightweight (< 5kb), fully headless-accessible (ARIA live regions), supports dark mode, and is the standard toast system recommended by shadcn/ui.

### Decision 2: Centralized `showToast` Helper (`src/lib/toast.ts`)
- **Choice**: Provide an abstraction module that wraps `toast` from `sonner`.
- **Alternatives Considered**: Import `toast` directly from `sonner` in every component.
- **Rationale**: Direct imports lead to inconsistent duration, custom styling duplication, and inconsistent error string parsing. Wrapping it allows:
  - Standard error extraction from `ApiError`, `Error`, or unknown catch objects.
  - Custom branded icons and colors matching the DwellOS zinc/emerald/rose aesthetic.
  - Pre-packaged action buttons (e.g., "Verify Email" button on 403 `EMAIL_VERIFICATION_REQUIRED`).

### Decision 3: Global Portal Mounting in Root Layout
- **Choice**: Place `<Toaster />` inside `src/app/layout.tsx`.
- **Rationale**: Mounting at the root layout guarantees toasts survive Next.js client-side route transitions (such as redirecting from `/login` to `/properties` after successful authentication).

### Decision 4: Standardize Class Composition via `cn()` (`src/lib/utils.ts`)
- **Choice**: Introduce `clsx` and `tailwind-merge` in `src/lib/utils.ts` exporting `cn(...inputs: ClassValue[])`.
- **Rationale**: This is the universal standard in shadcn/ui. It safely merges conflicting Tailwind utility classes and handles conditional class expressions without manual template literal interpolation errors.

### Decision 5: Backward-Compatible Modernization of Existing UI Primitives
- **Choice**: Refactor existing components in-place preserving current prop contracts while upgrading internal classes and DOM attributes to shadcn/ui standards:
  - **`Button.tsx`**: Add `focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 focus-visible:ring-offset-2`, refine variant classes (`default`/`primary`, `secondary`, `danger`/`destructive`, `outline`, `ghost`), support `size` (`sm`, `md`, `lg`), preserve `isLoading` spinner.
  - **`Input.tsx`**: Refactor to `border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:opacity-50`, retain optional label, helperText, and error prop.
  - **`Badge.tsx`**: Refactor to shadcn rounded-full badges with subtle border and text tints (`border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300`), preserving `StatusBadge` domain mapper.
  - **`Modal.tsx`**: Upgrade overlay to `bg-black/60 backdrop-blur-xs`, dialog container with `rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl`, animated entrance, and keyboard accessibility.
  - **`Select.tsx`**: Style select dropdown with shadcn input tokens and custom SVG chevron down indicator.

## Risks / Trade-offs

- **[Risk] React 19 Client Component Hydration**:
  - *Mitigation*: Mark `src/components/ui/Sonner.tsx` as `"use client"`. Sonner defers DOM insertion until client mount, preventing SSR hydration mismatches.
- **[Risk] Breaking Consumer Page Styles**:
  - *Mitigation*: Strictly keep existing prop names (`isLoading`, `error`, `helperText`, `variant`, `size`) and render hierarchies identical so existing forms (`login`, `register`, `properties/new`) work seamlessly without requiring API rewrites.
- **[Risk] Unstyled Toasts in Tailwind v4**:
  - *Mitigation*: Configure `classNames` on the Toaster component mapping `toast`, `description`, `actionButton`, and `cancelButton` to Tailwind classes compatible with CSS variables and dark mode.

## Migration Plan

1. Install `sonner`, `clsx`, `tailwind-merge` in `frontend/package.json`.
2. Create `src/lib/utils.ts` exporting `cn(...)`.
3. Create `src/components/ui/Sonner.tsx` implementing shadcn Toaster.
4. Create `src/lib/toast.ts` with standardized helper functions.
5. Modernize existing UI components in `src/components/ui/`:
   - `Button.tsx`
   - `Input.tsx`
   - `Badge.tsx`
   - `Modal.tsx`
   - `Select.tsx`
6. Mount `<Toaster />` in `src/app/layout.tsx`.
7. Enhance existing pages and actions with toast notifications:
   - `src/app/(auth)/login/page.tsx`
   - `src/app/(auth)/register/page.tsx`
   - `src/app/(auth)/verify-email/page.tsx`
   - `src/components/auth/EmailVerificationBanner.tsx`
   - `src/app/(dashboard)/properties/new/page.tsx`
   - `src/app/(dashboard)/properties/[id]/rooms/new/page.tsx`
   - `src/app/(dashboard)/layout.tsx` (on manual token change or logout)
8. Verify styling, accessibility, and build with `bun run lint` and `bun run build`.
