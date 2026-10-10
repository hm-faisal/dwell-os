# viewing-scheduling Specification

## Purpose

Enables prospective tenants to schedule in-person and virtual property/room viewings with preferred and alternate time slots, while empowering landlords and property managers to confirm, reschedule, or manage viewings through an auditable timeline state machine.

## Requirements

### Requirement: Viewing Request Scheduling
The system SHALL allow authenticated tenants to request an in-person or virtual viewing for any available room by selecting a preferred date/time, optional alternate date/time, viewing mode (`IN_PERSON` or `VIRTUAL`), and optional notes.

#### Scenario: Tenant books an in-person viewing
- **WHEN** a tenant selects a date and time for an in-person viewing and submits the request
- **THEN** the system creates the viewing request with status `REQUESTED` and notifies the property owner

#### Scenario: Tenant books a virtual tour
- **WHEN** a tenant requests a virtual viewing
- **THEN** the system flags the viewing type as `VIRTUAL` and prompts the owner for video conference connection details upon confirmation

### Requirement: Viewing Status Lifecycle FSM
The system SHALL enforce finite state machine transitions for viewing requests: `REQUESTED` -> `CONFIRMED` / `ALTERNATE_PROPOSED` / `DECLINED` -> `COMPLETED` / `CANCELLED` / `NO_SHOW`.

#### Scenario: Owner confirms a viewing request
- **WHEN** an owner or property manager confirms a pending viewing request
- **THEN** the system transitions status to `CONFIRMED` and dispatches confirmation notifications with calendar event payload

#### Scenario: Owner proposes an alternate time slot
- **WHEN** the requested time is unavailable and the owner proposes an alternate date
- **THEN** the system transitions status to `ALTERNATE_PROPOSED` and awaits tenant acceptance or cancellation

#### Scenario: Tenant cancels viewing
- **WHEN** a tenant cancels an upcoming viewing before the scheduled start time
- **THEN** the system transitions status to `CANCELLED` and releases the calendar reservation
