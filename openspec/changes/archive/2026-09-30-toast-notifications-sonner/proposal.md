# Proposal

## Why

Users currently lack uniform, accessible, and reactive visual feedback when completing asynchronous actions or encountering errors across the application. Many critical workflows—such as property creation, room publishing, login, registration, verification email resend, and permission rejections (e.g. `EMAIL_VERIFICATION_REQUIRED`)—either rely on static in-form error alerts or silent console logging without transient feedback. Furthermore, existing global UI components (`Button`, `Input`, `Badge`, `Modal`, `Select`) have bespoke styling that deviates from modern shadcn/ui design conventions. Integrating shadcn's `sonner` component alongside refactoring the global UI primitives to shadcn standards provides DwellOS with an accessible, polished, cohesive component library with dark-mode awareness, consistent focus rings, and reactive feedback across all routes.

## What Changes

- Install `sonner`, `clsx`, and `tailwind-merge` in `frontend/package.json`.
- Implement `src/lib/utils.ts` providing the standard shadcn `cn(...)` class merging utility.
- Integrate the shadcn-compatible `Toaster` component (`src/components/ui/Sonner.tsx`) and mount it globally in `src/app/layout.tsx`.
- Provide a standardized notification helper (`src/lib/toast.ts`) wrapping `toast` from `sonner` with typed helpers (`success`, `error`, `warning`, `info`, `promise`, and `verificationRequired`).
- Refactor all existing global UI components in `src/components/ui/` to conform to shadcn/ui design tokens, focus-visible states, subtle borders, and smooth transitions, maintaining 100% backward compatibility with existing component props:
  - `Button.tsx`: shadcn variants (default/primary, secondary, destructive/danger, outline, ghost), size tokens, focus-visible rings, and loading state.
  - `Input.tsx`: shadcn input styling (`border-input`, `focus-visible:ring-2`, placeholder text, label, helperText, and error states).
  - `Badge.tsx`: shadcn badge variants with subtle background tints and status badge mappings (`ACTIVE`, `AVAILABLE`, `RESERVED`, etc.).
  - `Modal.tsx`: accessible dialog overlay (`bg-black/80` or `backdrop-blur-sm`), header, title, description, and accessible close button.
  - `Select.tsx`: styled native select matching shadcn input aesthetic with custom dropdown indicator, label, and error display.
- Connect toast feedback to core workflows:
  - **Auth**: Success toasts on login, registration, email verification dispatch, and session refresh; error toasts on invalid credentials or session expiration.
  - **Email Verification & Access Control**: Warning/action toasts when operations fail due to unverified email status (`EMAIL_VERIFICATION_REQUIRED`) with direct CTA to verify.
  - **Properties & Rooms**: Success toasts on property creation, update, room addition, and soft-delete/archiving; error toasts on submission failures or conflict rejections.
  - **Global API Interceptor**: Automatic error toast notifications when uncaught HTTP 4xx/5xx network or API errors occur.

## Capabilities

### New Capabilities
- `toast-notifications`: Centralized toast notification system powered by shadcn `sonner` providing success, error, warning, info, and promise-based transient user feedback across all platform workflows.
- `ui-components`: Standardized, accessible shadcn/ui component system (`Button`, `Input`, `Badge`, `Modal`, `Select`) with unified Tailwind styling, focus-visible rings, and dark mode support.

### Modified Capabilities
<!-- None: existing capability requirements in authentication-security, data-protection-compliance, and role-based-access-control remain intact. -->

## Impact

- **Dependencies**: Adds `sonner`, `clsx`, `tailwind-merge` to `frontend/package.json`.
- **UI Components**: Adds `src/components/ui/Sonner.tsx`, `src/lib/utils.ts`, `src/lib/toast.ts`; modernizes `Button.tsx`, `Input.tsx`, `Badge.tsx`, `Modal.tsx`, `Select.tsx`.
- **Layout**: Mounts `<Toaster />` in `src/app/layout.tsx`.
- **Routes & Views**: Upgrades `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/verify-email/page.tsx`, `src/components/auth/EmailVerificationBanner.tsx`, `src/app/(dashboard)/properties/new/page.tsx`, `src/app/(dashboard)/properties/[id]/rooms/new/page.tsx`, and `src/lib/api.ts` to trigger sonner toasts.
