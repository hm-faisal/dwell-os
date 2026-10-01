# Tasks

## 1. Backend Schema & Model Alignment (`../backend`)

- [x] 1.1 Update `src/prisma/contract.prisma` to include `PG` and `HOSTEL` in the Property model check constraint and run Prisma db push or SQL migration; verify with `pnpm --dir ../backend exec prisma validate`.
- [x] 1.2 Update `src/modules/properties/properties.schemas.ts` to include `PG` and `HOSTEL` in `createPropertySchema` and `updatePropertySchema`; verify by running existing property unit/schema tests in backend.
- [x] 1.3 Audit `src/modules/properties/properties.services.ts` and `src/modules/rooms/rooms.services.ts` to confirm soft-delete archiving sets `status = 'ARCHIVED'` without deleting relational records; verify via manual script or unit test that historical leases and invoices remain queryable.
- [x] 1.4 Validate application approval concurrency logic (§6.1 / FR-1.6) in `src/modules/applications/applications.services.ts` to ensure `room.version` check and competing application auto-rejections prevent double-booking; verify with a concurrency test simulating two simultaneous approvals.

## 2. Frontend Infrastructure & API Client (`./`)

- [x] 2.1 Define TypeScript domain interfaces and DTOs in `src/types/property.ts` and `src/types/room.ts` covering Property, Room, Availability Status, Furnishing Status, and Property Type.
- [x] 2.2 Create API client utility in `src/lib/api.ts` supporting standard authentication headers, unified `{ data, error }` response unwrapping, and typed error handling for 400, 403, 404, and 409 Conflict responses.
- [x] 2.3 Create currency and date formatting utilities in `src/lib/formatters.ts` converting between integer cents and dollar displays ($1,400.00 <-> 140000 cents) and formatting ISO dates; verify with unit test or helper assertions.

## 3. Frontend Property Management UI

- [x] 3.1 Create Property List dashboard view at `src/app/(dashboard)/properties/page.tsx` displaying active and archived properties with status badges, search filter, and property summary cards.
- [x] 3.2 Build Property Creation page at `src/app/(dashboard)/properties/new/page.tsx` with form fields for name, property type dropdown (`APARTMENT`, `HOUSE`, `PG`, `HOSTEL`, `STUDIO`, `CONDO`, `TOWNHOUSE`, `OTHER`), street address, city, state, zip code, country, photos list, amenities multi-select tags, description, and geolocation (`latitude`, `longitude`); verify form validation and submission against backend API.
- [x] 3.3 Build Property Detail view at `src/app/(dashboard)/properties/[id]/page.tsx` displaying property metadata, photos carousel/grid, geolocation preview link, manager assignment panel, and quick navigation to rooms.
- [x] 3.4 Implement Property Edit and Archive actions in `src/app/(dashboard)/properties/[id]/edit/page.tsx` allowing Owners and Managers to update details or soft-delete (archive) the property with confirmation dialog; verify property status changes to ARCHIVED in backend.

## 4. Frontend Room Management UI

- [x] 4.1 Build Room Inventory view at `src/app/(dashboard)/properties/[id]/rooms/page.tsx` showing all rooms grouped or listed by availability status (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, `ARCHIVED`) with occupancy indicators and rent/deposit badges.
- [x] 4.2 Build Add Room form/modal at `src/app/(dashboard)/properties/[id]/rooms/new/page.tsx` capturing room name, room type (`PRIVATE`, `SHARED`), size, furnishing status (`FURNISHED`, `SEMI_FURNISHED`, `UNFURNISHED`), monthly rent, security deposit, max occupants, photos, available-from date, minimum stay months, and lease terms; verify room creation in backend.
- [x] 4.3 Build Edit Room modal/page at `src/app/(dashboard)/properties/[id]/rooms/[roomId]/edit/page.tsx` enabling owners/managers to modify room configuration, set status (Available <-> Under Maintenance), pass `expectedVersion`, and handle 409 Conflict errors gracefully.
- [x] 4.4 Implement Room Archive action with confirmation dialog, ensuring that rooms with active tenancies display a warning and archive requests transition the room status to ARCHIVED without deleting historical records.

## 5. End-to-End Verification & Integration

- [x] 5.1 Run full end-to-end user flow: register landlord, create a property of type `PG`/`HOSTEL`, add multiple rooms with different configurations, update room availability to `MAINTENANCE`, and archive a room; verify DB records and API responses match specs.
- [x] 5.2 Test concurrency protection: simulate two simultaneous approval attempts for a room to verify the second attempt fails with 409 Conflict and competing applications are auto-rejected.
- [x] 5.3 Run frontend build (`bun run build` or `npm run build`) and linting (`bun run lint`) to verify strict Next.js 16 and Biome compliance with zero errors.
