# identity-verification Specification

## Purpose

Provides a secure verification portal for tenants and landlords to upload identity, income, and employment documentation, supporting automated document hashing, visual status badge rendering, and superadmin audit reviews.

## Requirements

### Requirement: Verification Submission
The system SHALL allow authenticated users to submit identity and income verifications under categories (`IDENTITY`, `INCOME`, `EMPLOYMENT`, `REFERENCE_CHECK`) with secure file uploads and supplementary notes.

#### Scenario: Tenant uploads government ID
- **WHEN** a tenant uploads an ID document and submits the verification request
- **THEN** the system creates a verification record with status `PENDING` and triggers an audit log entry

### Requirement: Verification Lifecycle and Status Badges
The system SHALL manage verification status FSM (`PENDING` -> `IN_REVIEW` -> `VERIFIED` / `REJECTED`) and display prominent visual status badges across user profiles and rental applications.

#### Scenario: Admin verifies user document
- **WHEN** an admin reviews and approves the submitted verification
- **THEN** the system updates verification status to `VERIFIED` and marks the user's profile with a verified checkmark badge

#### Scenario: Admin rejects unreadable document
- **WHEN** an admin rejects a submission with reviewer feedback notes
- **THEN** the system sets status to `REJECTED` and notifies the user with instructions to re-upload
