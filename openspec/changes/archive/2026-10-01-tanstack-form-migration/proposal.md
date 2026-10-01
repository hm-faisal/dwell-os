# Proposal

## Why

Currently, forms across the DwellOS frontend (Authentication, Property Management, Room Inventory, and Delegated Access) manage form state through manual `useState` hooks, ad-hoc `onSubmit` event handlers, and manual state synchronization. This leads to duplicate validation logic, boilerplate state tracking, uncontrolled re-renders, inconsistent error state handling across field boundaries, and fragile dirty/isSubmitting lifecycle management. 

Migrating all forms to **TanStack Form** (`@tanstack/react-form`) standardizes reactive, type-safe form state management across the application. It brings declarative schema validation, fine-grained field-level reactivity, automatic touch and dirty state tracking, and standardized error messaging that integrates seamlessly with our shadcn/ui components (`Input`, `Select`, `Button`) and toast notifications.

## What Changes

- Install and configure `@tanstack/react-form` and `zod` for declarative, type-safe client-side schema validation and reactive form lifecycle control.
- Migrate Authentication forms:
  - **Login Form** (`src/app/(auth)/login/page.tsx`): Migrate credentials form to TanStack Form with email formatting and password presence validation.
  - **Registration Form** (`src/app/(auth)/register/page.tsx`): Migrate registration form to TanStack Form with strong password complexity rules, confirm password matching validator, role selection, and terms acceptance.
- Migrate Property Management forms:
  - **New Property Form** (`src/app/(dashboard)/properties/new/page.tsx`): Migrate multi-section property details, address, geolocation bounds, amenities, rules, and photo arrays to TanStack Form with typed schema validators.
  - **Edit Property Form** (`src/app/(dashboard)/properties/[id]/edit/page.tsx`): Migrate property update form with asynchronous default value population, status transitions, and dirty-state submission.
  - **Add Manager Form** (`src/app/(dashboard)/properties/[id]/page.tsx`): Migrate property manager delegation modal form to TanStack Form with user ID validation and permission array selection.
- Migrate Room Management forms:
  - **New Room Form** (`src/app/(dashboard)/properties/[id]/rooms/new/page.tsx`): Migrate room creation form with numeric currency/deposit validation, occupancy limits, dates, and furnishing options to TanStack Form.
  - **Edit Room Form** (`src/app/(dashboard)/properties/[id]/rooms/[roomId]/edit/page.tsx`): Migrate room edit form with optimistic version tracking, currency conversion, status selection, and concurrency error handling.
- Integrate all migrated forms with existing global UI components (`Input`, `Select`, `Button`) and `showToast` notifications, maintaining complete visual consistency and accessibility.

## Capabilities

### New Capabilities
- `form-management`: Standardizes type-safe, reactive form state management, field validation rules, asynchronous submission lifecycle, dirty/touched tracking, and accessible error message association across all platform forms using TanStack Form.

### Modified Capabilities
<!-- None: No existing capability requirements are modified. -->

## Impact

- **Dependencies**: Adds `@tanstack/react-form` and `zod` to `package.json`.
- **Components & Pages**: Refactors form logic in `login/page.tsx`, `register/page.tsx`, `properties/new/page.tsx`, `properties/[id]/edit/page.tsx`, `properties/[id]/rooms/new/page.tsx`, `properties/[id]/rooms/[roomId]/edit/page.tsx`, and `properties/[id]/page.tsx`.
- **Validation**: Replaces ad-hoc string and manual regex validations with centralized declarative schemas.
- **Backward Compatibility & UX**: Retains identical external behavior, API payloads, toast notifications, and UI appearance while improving responsiveness and input error feedback.
