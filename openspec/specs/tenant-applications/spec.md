# tenant-applications Specification

## Purpose

Governs the tenant rental application submission workflow, active priority reservation hold timers, document verification attachments, and owner application evaluation with atomic, idempotent approval transitions that prevent double-booking.

## OpenSpec Definition

```yaml
spec: tenant-applications
type: feature
models:
  RoomApplication:
    fields:
      id: UUID
      roomId: UUID
      tenantId: UUID
      requestedMoveInDate: ISO8601String
      intendedStayMonths: Integer (min: 1, max: 36)
      status: Enum [SUBMITTED, UNDER_REVIEW, INFO_REQUESTED, APPROVED, REJECTED, WITHDRAWN, EXPIRED]
      holdExpiresAt: ISO8601String (nullable)
      idempotencyKey: UUID
      personalInfo:
        fullName: String (min: 2, max: 100)
        email: EmailString
        phone: E164PhoneString
        currentAddress: String (min: 5, max: 200)
        dateOfBirth: ISO8601DateString
      employment:
        employerName: String
        jobTitle: String
        employmentStatus: Enum [FULL_TIME, PART_TIME, SELF_EMPLOYED, STUDENT, RETIRED, OTHER]
        monthlyIncomeCents: Integer (cents > 0)
        supervisorContact: String (optional)
      references:
        type: Array of Reference
        items:
          name: String
          relationship: String
          email: EmailString
          phone: E164PhoneString
      documents:
        type: Array of ApplicationDocument
        items:
          name: String
          type: Enum [GOVERNMENT_ID, PAYSTUB, BANK_STATEMENT, TAX_RETURN, OFFER_LETTER, OTHER]
          fileUrl: URLString
      createdAt: ISO8601Timestamp
      updatedAt: ISO8601Timestamp

rbac:
  rules:
    - role: TENANT
      actions: [CREATE_APPLICATION, VIEW_OWN_APPLICATION, WITHDRAW_APPLICATION]
      constraints:
        - targetRoom.status == "AVAILABLE"
        - targetRoom.occupiedSlots < targetRoom.maxOccupants
        - application.tenantId == auth.user.id
    - role: OWNER
      actions: [VIEW_APPLICATIONS, TRIAGE_APPLICATION, APPROVE_APPLICATION, REJECT_APPLICATION]
      constraints:
        - targetRoom.property.ownerId == auth.user.id
    - role: PROPERTY_MANAGER
      actions: [VIEW_APPLICATIONS, TRIAGE_APPLICATION, APPROVE_APPLICATION, REJECT_APPLICATION]
      constraints:
        - auth.user.hasPermission("MANAGE_APPLICATIONS", targetRoom.propertyId)

finite_state_machines:
  room_status:
    initial: AVAILABLE
    transitions:
      - from: AVAILABLE
        to: RESERVED
        trigger: APPLICATION_SUBMITTED_WITH_HOLD
        conditions: [hold_timer_started]
      - from: RESERVED
        to: AVAILABLE
        trigger: HOLD_EXPIRED_OR_REJECTED
        conditions: [no_remaining_active_holds]
      - from: RESERVED
        to: OCCUPIED
        trigger: APPLICATION_APPROVED
        conditions: [occupied_slots == max_occupants]

  application_status:
    initial: SUBMITTED
    transitions:
      - from: SUBMITTED
        to: UNDER_REVIEW
        trigger: OWNER_INSPECTION
      - from: UNDER_REVIEW
        to: APPROVED
        trigger: OWNER_APPROVAL_TRANSACTION
        side_effects: [create_draft_lease, increment_room_version, reject_competing_applications]
      - from: [SUBMITTED, UNDER_REVIEW]
        to: REJECTED
        trigger: OWNER_REJECTION_OR_COMPETING_APPROVAL
      - from: [SUBMITTED, UNDER_REVIEW]
        to: EXPIRED
        trigger: HOLD_COUNTDOWN_REACHED_ZERO
      - from: [SUBMITTED, UNDER_REVIEW]
        to: WITHDRAWN
        trigger: TENANT_CANCELLATION
```

## Requirements

### Requirement: Application Submission and Reservation Hold Timer
The system SHALL allow verified tenants to submit a rental application for a specific room including move-in date, employment history, personal background, references, and supporting documents. The system SHALL initiate a reservation hold (`holdExpiresAt`) displaying an active countdown timer on the frontend during which the applicant retains priority evaluation.

#### Scenario: Tenant submits application with reservation hold
- **WHEN** a tenant completes the application form and submits required documents with a unique idempotency key
- **THEN** the system sets status to `SUBMITTED`, initiates a 48-hour reservation hold (`holdExpiresAt`), idempotently transitions the room to `RESERVED`, and displays a live countdown timer

#### Scenario: Reservation hold expires without landlord action
- **WHEN** the hold countdown timer reaches zero without owner decision
- **THEN** the system marks the reservation hold expired, transitions status to `EXPIRED`, and releases the room lock back to `AVAILABLE`

### Requirement: Owner Application Kanban and Atomic Idempotent Approval
The system SHALL provide landlords and property managers with a triage board (`SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`) for application management. Approval of an application SHALL atomically acquire a row lock on the room, verify optimistic concurrency versioning (`expectedRoomVersion`), increment occupied slots, transition room status to `OCCUPIED` (or `RESERVED`), and automatically reject all competing active applications.

#### Scenario: Owner approves application atomically
- **WHEN** an owner approves an application with the current `expectedRoomVersion`
- **THEN** the system updates application status to `APPROVED`, provisions the draft lease, transitions the room to `OCCUPIED` if capacity is reached, and automatically marks all competing applications for that room as `REJECTED`

#### Scenario: Concurrency conflict during approval
- **WHEN** two managers attempt to approve different applications for the same room simultaneously
- **THEN** the database transaction serializes both requests, allowing the first to succeed and rejecting the second with a conflict error stating the room is already occupied
