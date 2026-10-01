# Proposal

## Why

Property owners and managers require an intuitive, robust interface and API to list and manage their real-estate inventory, configure rooms with granular leasing and furnishing criteria, track live availability statuses, and safely archive units without compromising historical financial or tenancy ledgers. Furthermore, strict concurrency safeguards are required to prevent simultaneous race conditions when approving applications for the same room.

## What Changes

- **Property Lifecycle Management**: Enable Owners and Managers to create, view, edit, and soft-delete (archive) properties with full metadata: address, type (`APARTMENT`, `HOUSE`, `PG`, `HOSTEL`, `STUDIO`, `CONDO`, `TOWNHOUSE`, `OTHER`), photos, amenities, description, and geolocation coordinates (`latitude`, `longitude`).
- **Room Inventory & Configuration**: Allow adding and configuring multiple rooms per property with room type (`PRIVATE`, `SHARED`), dimensions/size, furnishing status (`FURNISHED`, `SEMI_FURNISHED`, `UNFURNISHED`), monthly rent (integer cents), security deposit (integer cents), max occupants/capacity, photos, available-from date, minimum stay duration (in months), and customizable lease terms.
- **Availability State Tracking**: Manage room lifecycle states (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, and `ARCHIVED`) reflecting active application holds, confirmed tenancies, and maintenance periods.
- **Auditable Soft-Deletion**: Ensure archiving a property or room flags the entity as `ARCHIVED` and prevents new applications/leases while strictly preserving historical tenancy records, rent invoices, payments, and audit logs.
- **Concurrency & Double-Booking Prevention**: Prevent two simultaneous active applications from being approved for the same room via transactional optimistic locking (`room.version`) and auto-rejection of competing applications upon occupancy filling (§6.1).
- **Frontend Management UI**: Build Next.js 16 App Router responsive dashboard screens and forms for Owner/Manager property creation, property details, room list/grid, room configuration dialogs/pages, photo upload/preview, geolocation coordinates/map preview, and status transitions.
- **Backend API & Schema Synchronization**: Align Express 5/Prisma 8 schemas, validation, routes, and controllers in `../backend` to support `PG` and `HOSTEL` property types, ensure robust optimistic locking checks, and expose complete REST endpoints consumed by the frontend.

## Capabilities

### New Capabilities
- `property-management`: Covers Property creation, retrieval, updates, manager delegation, and soft-delete archiving with address, property type, amenities, photos, description, and geolocation.
- `room-management`: Covers Room configuration, room-level lease terms, availability status management (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, `ARCHIVED`), soft-delete archiving, and transactional double-booking prevention under concurrent application approvals.

### Modified Capabilities
<!-- None. No pre-existing specs in openspec/specs. -->

## Impact

- **Backend APIs (`../backend`)**:
  - `src/prisma/contract.prisma`: Ensure property type check constraint and schema accommodate `PG` and `HOSTEL`.
  - `src/modules/properties`: Validation schemas, service, controller, and routes for property CRUD, manager assignments, and archiving.
  - `src/modules/rooms`: Validation schemas, service, controller, and routes for room CRUD, versioned status transitions, and archiving.
  - `src/modules/applications`: Concurrency guarantees on `approveApplication` ensuring optimistic locking and competing application auto-rejections.
- **Frontend App (`./`)**:
  - `src/app/(dashboard)/properties`: Property listing, creation wizard, edit form, and detail view.
  - `src/app/(dashboard)/properties/[id]/rooms`: Room management table/grid, add room modal/page, edit room modal, and status badge switcher.
  - API client service layer / server actions connecting frontend to backend endpoints (`http://localhost:5000/api/v1`).
- **Dependencies & Standards**:
  - Currency handled in integer cents ($1,400.00 = 140000).
  - RBAC verification ensuring only authenticated `OWNER` or assigned `PropertyManager` can mutate property/room records.
