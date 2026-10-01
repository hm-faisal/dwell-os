# Design

## Context

DwellOS operates as a modular monolith backend (Express 5, TypeScript, Prisma 8, PostgreSQL, Redis) in `../backend` and a modern Next.js 16 App Router frontend in `./`. The system is designed for co-living, student housing, PG/hostel, and multi-unit residential management.

See `proposal.md` for the business motivation and `specs/` for behavioral contracts.

Currently:
- The backend contains `properties` and `rooms` modules with initial schema structures and controllers. However, the Property type check constraint and Zod schema need to include `PG` and `HOSTEL` to fulfill FR-1.1.
- Concurrency protection for application approvals is partially implemented in `ApplicationService.approveApplication` via `db.transaction` and `room.version` checking, but needs end-to-end verification and dedicated client-side handling.
- The frontend currently has only a fresh Next.js 16 App Router skeleton with no dashboard, property views, or room management screens.

## Goals / Non-Goals

**Goals:**
- Provide complete UI and API integration for Property lifecycle: creation with address, type (`APARTMENT`, `HOUSE`, `PG`, `HOSTEL`, `STUDIO`, `CONDO`, `TOWNHOUSE`, `OTHER`), photos array, amenities, description, and geolocation (`lat`/`lng`), editing, and soft-delete archiving.
- Provide complete UI and API integration for Room lifecycle: adding rooms under a property with room type (`PRIVATE`, `SHARED`), size, furnishing (`FURNISHED`, `SEMI_FURNISHED`, `UNFURNISHED`), monthly rent and security deposit (in integer cents), max occupants, photos, availability statuses (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, `ARCHIVED`), available-from date, minimum stay duration, and lease terms.
- Enforce soft-deletion guarantees: Archiving a property or room flags `status = 'ARCHIVED'` while preserving all historical leases, tenant records, payments, and audit logs.
- Enforce transactional double-booking prevention: Prevent two simultaneous active applications from being approved for the same room (§6.1) through database transaction, optimistic locking on `room.version`, and automatic rejection of competing applications.
- Build responsive, accessible Next.js 16 App Router pages and components for property and room management with optimistic UI updates and clear error states.

**Non-Goals:**
- Tenant-facing checkout and Stripe payment processing UI (handled in payment module).
- Tenant rental application submission form and KYC document verification portal (handled in application and verification modules).
- Interactive paid mapping provider SDKs (e.g. Mapbox GL / Google Maps JS SDK with API keys); simple coordinate input, validation, and OpenStreetMap/static preview links are used instead.

## Decisions

### 1. Property Type Support (`PG` & `HOSTEL`)
- **Choice**: Update the Prisma schema check constraint `property_type_check_9b6fee13` and the Zod enum in `properties.schemas.ts` to include `'PG'` and `'HOSTEL'`.
- **Rationale**: Paying guests (PG) and hostels are primary target markets for co-living platforms. Storing them directly in the enum/check constraint ensures strict type safety and enables filtered queries.
- **Alternatives Considered**: Storing them under `OTHER` with custom tags. Rejected because PG and Hostel have distinct inventory and roommate dynamics that require top-level classification.

### 2. Auditable Soft-Deletion Archival
- **Choice**: Mark `status = 'ARCHIVED'` on the `Property` and `Room` records and record an audit log with actor ID and before/after states. The room archive service checks whether any active leases exist (`status = 'ACTIVE'`); if found, it rejects archiving with a 409 Conflict.
- **Rationale**: Hard deletion would violate database foreign key constraints and destroy financial and tenancy audit trails. Archiving prevents the room from appearing in public search or accepting new applications while keeping all historical leases and rent invoices queryable.
- **Alternatives Considered**: Adding a separate `deletedAt` column. Rejected because `status: 'ARCHIVED'` is already modeled in the Prisma schema check constraint `(status = ANY (ARRAY['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE', 'ARCHIVED']))`.

### 3. Concurrency & Double-Booking Prevention (§6.1 / FR-1.6)
- **Choice**: Execute application approval inside `db.transaction()`:
  1. Read the room within the transaction.
  2. Verify that `occupiedSlots + 1 <= maxOccupants` and that `room.status !== 'OCCUPIED'`.
  3. Validate `expectedRoomVersion` if supplied by the caller.
  4. Increment `room.version`, increment `occupiedSlots`, update `status` (to `OCCUPIED` if fully filled), and commit the `Lease` and `LeaseTenant`.
  5. In the same transaction, if the room is now fully occupied, find all competing applications with status `SUBMITTED` or `UNDER_REVIEW` and transition them to `REJECTED`, logging audit events and issuing notifications.
- **Rationale**: Guarantees zero race conditions even if two managers or background jobs simultaneously attempt to approve applications for the same room.

### 4. Monetary Values in Integer Cents
- **Choice**: All rent, deposits, and fee amounts are transmitted and stored strictly in integer minor units (cents). For instance, $1,500/month is `150000`.
- **Rationale**: Eliminates IEEE 754 floating-point rounding errors across database storage, API transport, and billing calculations. The frontend encapsulates currency conversion in helper utilities (`formatCentsToCurrency` and `parseCurrencyToCents`).

### 5. Frontend Architecture & Next.js 16 App Router Conventions
- **Choice**:
  - `src/app/(dashboard)/properties`: Management dashboard layout and property listing.
  - `src/app/(dashboard)/properties/new`: Property creation form.
  - `src/app/(dashboard)/properties/[id]`: Property details and management hub.
  - `src/app/(dashboard)/properties/[id]/rooms`: Room inventory view with grid/table and room detail drawer.
  - `src/app/(dashboard)/properties/[id]/rooms/new`: Add room form.
  - Centralized API client module (`src/lib/api.ts`) adhering to the `{ data, error }` unified response envelope.
  - Note: Next.js 16 requires dynamic route params in page components to be treated as Promises (`const { id } = await params;`).

## Risks / Trade-offs

- **[Risk]** Database check constraint update on existing PostgreSQL instance when adding `PG` and `HOSTEL`.
  - *Mitigation*: Execute a safe `ALTER TABLE "property" DROP CONSTRAINT IF EXISTS property_type_check_9b6fee13;` followed by adding the expanded check constraint in SQL migration.
- **[Risk]** Next.js 16 async route parameters breaking component compilation.
  - *Mitigation*: Ensure all page components await `params` and `searchParams` in accordance with Next.js 16 breaking changes.
- **[Risk]** Network latency or concurrent edits causing 409 Conflict errors during room updates.
  - *Mitigation*: Frontend displays friendly conflict notifications with an option to refresh and reload the latest room state.

## Migration Plan

1. Backend: Update `src/prisma/contract.prisma` check constraint and run database migration to support `PG` and `HOSTEL`.
2. Backend: Update `src/modules/properties/properties.schemas.ts` and verify `properties` and `rooms` services and controllers.
3. Backend: Validate application approval concurrency test cases (§6.1).
4. Frontend: Implement typed API client, shared types, currency formatters, and responsive Property & Room UI components.
5. Integration: Verify end-to-end flows with manual and automated API checks.
