# Design

## Context

The DwellOS frontend is built on Next.js 16 (App Router with Turbopack), React 19, and Tailwind CSS v4. Global UI components (`Input`, `Select`, `Button`, `Modal`, `Badge`) and global toast notifications (`showToast` with `sonner`) were recently standardized to shadcn/ui conventions.

Currently, form state across authentication, property creation/editing, room inventory, and manager assignment is handled imperatively using multiple `useState` hooks per field, manual event handler wiring, and separate loading/error variables. Migrating to TanStack Form (`@tanstack/react-form`) and `zod` establishes a unified, declarative, reactive architecture for form validation and lifecycle management.

See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Install and configure `@tanstack/react-form` and `zod` within `frontend`.
- Migrate all seven client-side forms to TanStack Form:
  1. `src/app/(auth)/login/page.tsx`
  2. `src/app/(auth)/register/page.tsx`
  3. `src/app/(dashboard)/properties/new/page.tsx`
  4. `src/app/(dashboard)/properties/[id]/edit/page.tsx`
  5. `src/app/(dashboard)/properties/[id]/rooms/new/page.tsx`
  6. `src/app/(dashboard)/properties/[id]/rooms/[roomId]/edit/page.tsx`
  7. `src/app/(dashboard)/properties/[id]/page.tsx` (Add Manager modal form)
- Implement schema-driven validation using Zod schemas matching existing DTO interfaces (`CreatePropertyDTO`, `UpdateRoomDTO`, etc.).
- Connect field errors directly to shadcn `Input.error` and `Select.error` props with touched/dirty awareness.
- Bind form submission state (`form.state.isSubmitting`) directly to `Button.isLoading`.
- Maintain 100% visual styling, toast notifications, accessibility, and API payload compatibility.

**Non-Goals:**
- Altering backend API contracts or DTO payloads.
- Modifying server components, layout structures, or non-form presentation pages.
- Replacing the global UI component contracts (`Input`, `Select`, `Button`).

## Decisions

### Decision 1: Library Pairing - `@tanstack/react-form` + `zod`
- **Choice**: Use `@tanstack/react-form` with `zod` for schema validation.
- **Rationale**: TanStack Form offers headless, fine-grained reactivity, minimal re-renders, and full React 19 support. Zod provides declarative schemas, custom error strings, and clean type inference that aligns with the existing TypeScript interfaces in `src/types/`.
- **Alternatives considered**:
  - *React Hook Form*: Popular, but TanStack Form offers tighter TypeScript safety, modern signals-based reactivity, and zero DOM ref coupling.
  - *Ad-hoc validator functions*: Lacks composition and creates duplicate validation code across forms.

### Decision 2: Field Integration Pattern with shadcn Components
- **Choice**: Use TanStack Form's `<form.Field>` render-prop pattern directly with existing `Input` and `Select` components:
  ```tsx
  <form.Field
    name="email"
    validators={{
      onChange: loginSchema.shape.email,
    }}
  >
    {(field) => (
      <Input
        label="Email Address"
        type="email"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        error={
          field.state.meta.isTouched && field.state.meta.errors.length
            ? field.state.meta.errors[0]?.message
            : undefined
        }
      />
    )}
  </form.Field>
  ```
- **Rationale**: Direct composition avoids bloated wrapper layers and ensures existing component props (`label`, `helperText`, `className`) remain immediately accessible.

### Decision 3: Handling Numeric Inputs and Currency Formatting
- **Choice**: Keep room rent and security deposits as string values in form state (e.g., `"1400.00"`), validate numeric format via Zod `regex` or `coerce`, and perform `dollarsToCents` conversion inside `handleSubmit`.
- **Rationale**: Storing raw strings in form input fields prevents caret jumping, unexpected zero-formatting, and decimal parsing issues during typing, while guaranteeing integer cents are sent to the backend.

### Decision 4: Asynchronous Form Initialization for Edit Views
- **Choice**: For `properties/[id]/edit` and `rooms/[roomId]/edit`, retain the `loadData` effect and populate form state via `form.reset(...)` or instantiate `useForm` once data is loaded.
- **Rationale**: Ensures the form is populated with the authoritative server version, including `version` tokens needed for optimistic concurrency checks.

### Decision 5: Dynamic Collections (Amenities, Photos, House Rules)
- **Choice**: Manage array-based fields (e.g., `amenities: string[]`, `photos: string[]`, `houseRules: string[]`) as top-level form state properties, updated via `form.setFieldValue` or array push/filter helpers.
- **Rationale**: Preserves the existing UI for toggling tags and adding photo URLs without altering user interaction flow.

## Risks / Trade-offs

- **[Risk]** React 19 peer dependency conflicts during package installation.
  → **Mitigation**: `@tanstack/react-form` v0.41+ supports React 19. Install with `bun add @tanstack/react-form zod` and verify peer dependency resolution.
- **[Risk]** Decimal coordinate input parsing in property forms.
  → **Mitigation**: Accept string inputs for latitude/longitude, validate bounds (-90 to 90 and -180 to 180) via Zod, and convert to `Number.parseFloat` on submit.
- **[Risk]** Untouched fields submitted with invalid empty data.
  → **Mitigation**: Call `form.handleSubmit()` which triggers full schema validation across all fields before running the submission callback.
