# Spec Delta

## Purpose

Enables owners and managers to configure room inventories, manage availability lifecycles, and enforce concurrency locks during application approvals.

## ADDED Requirements

### Requirement: Room Inventory Creation and Configuration
The system SHALL allow the Property Owner or assigned Manager to add one or more rooms to an active property. Each room MUST specify: a name/identifier (e.g. "Room 101-A"), room type (PRIVATE or SHARED), physical size in square feet or square meters, furnishing status (FURNISHED, SEMI_FURNISHED, or UNFURNISHED), monthly rent in integer cents, security deposit in integer cents, maximum occupant capacity, photos list, available-from date, minimum stay duration in months, and customizable lease terms text. The initial status SHALL default to AVAILABLE.

#### Scenario: Owner adds a fully configured room to a property
- **WHEN** an authenticated Owner submits room details including name "Room 101", type "PRIVATE", furnishing "FURNISHED", rent 140000 cents ($1,400.00), deposit 140000 cents ($1,400.00), size 250, maxOccupants 1, availableFrom "2026-10-01T00:00:00.000Z", minStayMonths 6, and lease terms
- **THEN** the system creates the room with status "AVAILABLE", occupiedSlots 0, version 1, associates it with the property, records an audit log, and returns the room object

#### Scenario: Validation fails on negative monetary values or missing room name
- **WHEN** a user attempts to create a room with negative rent or empty name
- **THEN** the system rejects the request with a 400 Bad Request validation error specifying the constraints

---

### Requirement: Room Availability Status Management
Each room SHALL maintain an explicit availability status among: AVAILABLE, RESERVED (hold during application in progress), OCCUPIED, MAINTENANCE, and ARCHIVED. The system SHALL allow Owners and Managers to update a room's status, available-from date, minimum stay, and lease terms.

#### Scenario: Manager transitions room to MAINTENANCE
- **WHEN** an assigned Property Manager updates a room's status to MAINTENANCE to perform plumbing repairs
- **THEN** the system updates the room status, increments the room version, records a ROOM_STATUS_CHANGE audit log, and excludes the room from active discovery search

#### Scenario: Application submission places room on hold
- **WHEN** a tenant submits an application for an AVAILABLE room with a temporary hold duration
- **THEN** the system updates the room status to RESERVED and records an audit log reflecting the reservation hold

---

### Requirement: Room Soft-Delete Archival with Historical Ledger Preservation
The system SHALL support archiving (soft-deleting) a room by transitioning its status to ARCHIVED. Archiving a room MUST NOT delete or alter historical tenancy records, active or historical leases, rent invoices, payment transactions, maintenance logs, or audit records associated with that room.

#### Scenario: Owner archives a room with historical tenancy
- **WHEN** an Owner initiates an archive request on a room that previously had completed tenancies and invoices
- **THEN** the system sets the room status to ARCHIVED, increments its version, and preserves all historical leases, tenant ties, and payment records intact in the database

#### Scenario: Attempting to archive a room with an active lease
- **WHEN** an Owner attempts to archive a room that currently has an ACTIVE lease
- **THEN** the system rejects the operation with a conflict error (409 Conflict) informing the user that an active lease must first be terminated

---

### Requirement: Concurrency Safeguard and Simultaneous Approval Prevention
The system MUST prevent two simultaneous active applications from being approved for the same room (§6.1). Application approval MUST execute inside an atomic database transaction. The system MUST inspect the room version and current occupied capacity. If the room is already fully occupied or concurrent modification changed the room state, the second approval attempt MUST be rejected with a 409 Conflict error. Furthermore, once an application approval fills the room's capacity, any remaining pending applications for that room MUST be automatically rejected.

#### Scenario: Simultaneous approval race condition prevented
- **WHEN** two managers or concurrent requests attempt to approve different applications for the same single-occupancy room simultaneously
- **THEN** the first transaction commits successfully, advancing the room status to OCCUPIED and incrementing the room version, and the second transaction fails with an optimistic locking or capacity conflict error (409 Conflict)

#### Scenario: Auto-rejection of competing applications upon approval
- **WHEN** an application is approved and fills the room's maximum occupant capacity
- **THEN** all other pending or submitted applications for that room are automatically updated to REJECTED with notes indicating the room was occupied, and affected applicants receive notifications

---

### Requirement: Room Modification and Concurrency Tracking
The system SHALL allow Owners and Managers to edit room attributes (pricing, terms, photos, furnishing, size) while enforcing optimistic concurrency control via an optional expectedVersion parameter.

#### Scenario: Concurrent room update detected
- **WHEN** a client attempts to update a room submitting an expectedVersion that does not match the current room version
- **THEN** the system rejects the update with a 409 Conflict error to prevent overwrite of concurrent changes
