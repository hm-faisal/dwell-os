# Spec Delta

## Purpose

Enables property owners and authorized managers to create, view, modify, and safely archive properties with complete location, classification, media, and amenity metadata.

## ADDED Requirements

### Requirement: Property Creation with Rich Attributes
The system SHALL allow authenticated Owners and authorized Managers to create a property with a title/name, physical address (street, city, state, zip code, country), property type, photo URLs, amenity tags, description text, and optional geolocation coordinates (latitude and longitude). The property type MUST support APARTMENT, HOUSE, PG, HOSTEL, STUDIO, CONDO, TOWNHOUSE, and OTHER.

#### Scenario: Successful property creation by owner
- **WHEN** an authenticated Owner submits valid property data including address, type "PG", photos, amenities, description, and coordinates
- **THEN** the system creates the property in ACTIVE status, persists the geolocation coordinates, records an audit log entry, and returns the created property

#### Scenario: Validation fails on invalid property type or missing address
- **WHEN** a user submits property creation with an unsupported property type or without a street address
- **THEN** the system rejects the request with a validation error (400 Bad Request) detailing the invalid fields

---

### Requirement: Property Modification and Manager Assignment
The system SHALL allow the property Owner or assigned Property Managers to update property details. The system SHALL allow the Property Owner to assign one or more Property Managers with scoped permissions and revoke manager assignments.

#### Scenario: Owner updates property description and amenities
- **WHEN** the property Owner submits updated description and amenities for an existing property
- **THEN** the system updates the property record, increments its timestamp, writes an audit log, and returns the updated property

#### Scenario: Unauthorized user attempts to edit property
- **WHEN** an authenticated user who is neither the owner nor an assigned manager attempts to update a property
- **THEN** the system denies the request with an authorization error (403 Forbidden)

#### Scenario: Owner assigns a property manager
- **WHEN** the property Owner assigns a valid user as a property manager with delegated permissions
- **THEN** the system creates a PropertyManager relation and grants the user management access to that property

---

### Requirement: Property Soft-Delete Archival with Record Preservation
The system SHALL provide an archive operation for properties that marks the property status as ARCHIVED (soft-delete). Archiving a property MUST NOT delete any associated historical tenancy records, active or past leases, rent invoices, payments, or audit logs. The system SHALL disallow the creation of new rooms, new applications, or new leases under an archived property.

#### Scenario: Owner archives property with existing leases and invoices
- **WHEN** an Owner archives a property that has past leases and financial invoices
- **THEN** the property status transitions to ARCHIVED, the property is excluded from active public listings, and all historical leases, tenant records, invoices, and payment histories remain intact and queryable

#### Scenario: Rejection of new room creation under archived property
- **WHEN** a user attempts to add a new room to an archived property
- **THEN** the system rejects the operation with a business rule violation error (400 Bad Request or 409 Conflict)

---

### Requirement: Property Query and Detail Retrieval
The system SHALL provide endpoints and views to list properties with pagination and filtering by city and owner/manager status. The system SHALL return property details including linked active rooms, photos, amenities, and assigned managers.

#### Scenario: Owner views property dashboard
- **WHEN** an authenticated Owner requests their properties list
- **THEN** the system returns all properties owned by that user including active and archived units, with pagination metadata

#### Scenario: Public listing excludes archived properties
- **WHEN** an unauthenticated or tenant user searches for available properties
- **THEN** the system returns only properties with status ACTIVE, filtering out all ARCHIVED properties
