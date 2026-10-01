# Spec Delta

## Purpose

Enforces role-based authorization for Owners, Property Managers, Tenants, dynamic Roommates, and Admins across API endpoints and UI resources.

## ADDED Requirements

### Requirement: Multi-Tiered User Roles Enforcement
The system SHALL enforce base platform roles of OWNER, TENANT, and ADMIN on all protected API endpoints. Owners SHALL have administrative control over properties and rooms they own. Tenants SHALL be authorized to browse, apply, sign leases, and manage their tenancies. Admins SHALL possess platform-wide superuser permissions for moderation and dispute resolution.

#### Scenario: Tenant attempts property creation
- **WHEN** user with role TENANT attempts to call POST /api/v1/properties
- **THEN** system rejects request with HTTP 403 Forbidden

#### Scenario: Owner manages owned property
- **WHEN** user with role OWNER updates a property where property.ownerId equals user.id
- **THEN** system authorizes the request and updates the property

#### Scenario: Admin bypasses resource ownership check
- **WHEN** user with role ADMIN performs an administrative moderation action on any property or room
- **THEN** system permits the action and logs administrative execution

### Requirement: Delegated Property Manager Authorization
The system SHALL permit Owners to delegate operational permissions to designated Property Managers for specific properties. Delegated Property Managers SHALL be authorized to perform actions scoped strictly to their assigned permissions (MANAGE_ROOMS, MANAGE_APPLICATIONS, MANAGE_MAINTENANCE) on that specific property.

#### Scenario: Property Manager adds room with MANAGE_ROOMS permission
- **WHEN** a manager with MANAGE_ROOMS permission on property P creates a room in property P
- **THEN** system grants access and creates the room

#### Scenario: Property Manager attempts action without required permission
- **WHEN** a manager with only MANAGE_MAINTENANCE permission attempts to approve a tenant application
- **THEN** system blocks the action with HTTP 403 Forbidden

### Requirement: Dynamic Roommate Context Resolution
The system SHALL dynamically evaluate a user's Roommate contextual role on every authenticated request by querying active leases for shared units. When a Tenant occupies an active lease in a shared room, the system SHALL hydrate their identity with Roommate status, unlocking roommate matching, application voting, and bill splitting workflows.

#### Scenario: Tenant with active shared room lease accesses roommate voting
- **WHEN** tenant occupying an active lease in a SHARED room votes on an incoming roommate application
- **THEN** system recognizes dynamic Roommate context and registers the vote

#### Scenario: Tenant without active shared lease attempts roommate voting
- **WHEN** tenant with no active lease or a lease in a PRIVATE studio attempts roommate voting
- **THEN** system rejects request with HTTP 403 indicating roommate context is required
