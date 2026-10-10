# maintenance-ticketing Specification

## Purpose

Enables tenants to submit categorized maintenance requests with photographic evidence and urgency ratings, while facilitating landlord triage across a 5-stage Kanban lifecycle with contractor assignment and post-resolution satisfaction scoring.

## Requirements

### Requirement: Maintenance Request Creation and Urgency Categorization
The system SHALL allow occupants of a room or property to submit maintenance tickets specifying category (`PLUMBING`, `ELECTRICAL`, `HVAC`, `APPLIANCE`, `STRUCTURAL`, `OTHER`), urgency (`LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`), written description, and photographic attachments.

#### Scenario: Tenant reports emergency maintenance issue
- **WHEN** a tenant submits a ticket with urgency `EMERGENCY`
- **THEN** the system immediately marks status as `OPEN`, flags the ticket with high visual priority, and dispatches urgent notifications to the landlord

### Requirement: Maintenance Ticketing Kanban Lifecycle
The system SHALL enforce finite state machine transitions across 5 stages: `OPEN` -> `ACKNOWLEDGED` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`. Landlords and managers SHALL have authority to assign tickets to contractors and update statuses.

#### Scenario: Landlord assigns and acknowledges ticket
- **WHEN** a landlord assigns a ticket to a maintenance technician and marks it acknowledged
- **THEN** the system updates status to `ACKNOWLEDGED` and logs the assignment details

#### Scenario: Tenant provides post-resolution rating
- **WHEN** a ticket is marked `RESOLVED` and the tenant rates the work from 1 to 5 stars with feedback
- **THEN** the system records the rating and transitions status to `CLOSED`
