# roommate-matching Specification

## Purpose

Enables tenants to create roommate lifestyle and preference profiles, discover prospective roommates or shared units via explainable compatibility scores, connect through mutual interest introductions, and participate in shared-unit roommate co-approval voting.

## Requirements

### Requirement: Roommate Profile and Lifestyle Preference Authoring
The system SHALL allow authenticated tenants to author and maintain a roommate profile consisting of budget range, preferred move-in date, sleep schedule (`EARLY_BIRD`, `NIGHT_OWL`, `FLEXIBLE`), work schedule (`REMOTE`, `OFFICE`, `HYBRID`, `SHIFT`), cleanliness standard (`VERY_CLEAN`, `MODERATE`, `RELAXED`), smoking and pet habits, bio, and customizable lifestyle tags.

#### Scenario: Tenant creates a new roommate profile
- **WHEN** a tenant completes the roommate profile form with their budget, habits, schedules, and lifestyle tags and submits
- **THEN** the system validates the input, persists the profile via the backend profile API, and marks the profile active for matchmaking

#### Scenario: Tenant updates existing profile preferences
- **WHEN** a tenant edits their budget bounds or updates their sleep and work schedule
- **THEN** the system updates the stored profile and recalculates compatibility scores for prospective matches

### Requirement: Explainable Compatibility Scoring and Match Exploration
The system SHALL calculate and render a deterministic, explainable compatibility score between the searching tenant and other prospective roommates or shared-unit occupants, explicitly showing the score contribution from budget overlap, cleanliness alignment, sleep schedule, work routine, and personal habits.

#### Scenario: Tenant inspects match compatibility breakdown
- **WHEN** a tenant selects a prospective roommate card
- **THEN** the system displays the overall match score (0–100%) alongside a clear breakdown of points earned from budget overlap, cleanliness, sleep schedule, work hours, and smoking/pet compatibility

#### Scenario: Tenant browses matches without a profile
- **WHEN** an authenticated tenant navigates to the roommate matches directory without having created a profile
- **THEN** the system informs the tenant that a completed profile is required to compute compatibility scores and prompts them to set up their profile

### Requirement: Mutual Interest Expression and Introduction Threads
The system SHALL allow tenants to express interest in prospective roommates with an optional personal introduction message; when mutual interest is established between two tenants, the system SHALL confirm the match and initiate an introduction thread.

#### Scenario: Tenant expresses one-way interest
- **WHEN** a tenant clicks "Express Interest" on a prospective roommate's profile and submits an introductory message
- **THEN** the system records the interest with status `PENDING`, notifies the recipient, and updates the profile's action state to show interest was sent

#### Scenario: Mutual interest triggers introduction thread
- **WHEN** the target tenant reciprocates interest in return
- **THEN** the system transitions match status to `MUTUAL_INTEREST`, displays a mutual match celebration banner, and provides direct contact and introduction thread details

### Requirement: Roommate Co-Approval Voting for Shared Units
The system SHALL allow active roommates in a shared property or unit to view applicant profiles seeking to rent an open room in their unit and submit co-approval votes (`APPROVED` or `REJECTED`) with optional feedback comments.

#### Scenario: Existing roommate votes to approve an applicant
- **WHEN** an active roommate reviews a pending roommate applicant for an available room in their shared unit and submits an approval vote
- **THEN** the system records the roommate's vote with status `APPROVED`, logs the audit record, and updates the application's roommate approval tally

#### Scenario: Non-resident attempt to vote
- **WHEN** a user who is not an active tenant, property manager, or owner of that shared unit attempts to submit a roommate approval vote
- **THEN** the system rejects the submission with an authorization error
