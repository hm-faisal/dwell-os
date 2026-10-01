# Spec Delta

## Purpose

Standardizes type-safe, reactive form state management, field validation rules, asynchronous submission lifecycle, dirty/touched tracking, and accessible error message association across all platform forms.

## ADDED Requirements

### Requirement: Field-Level Validation and Real-Time Feedback
The system SHALL validate individual form inputs against defined schema constraints upon value change and blur events, associating specific validation errors directly with the target field and preventing form submission whenever any field is in an invalid state.

#### Scenario: Invalid email format entered in field
- **WHEN** user enters "invalid-email" into the email input field and unfocuses or edits the field
- **THEN** system immediately attaches an error message "Invalid email address" to the field without submitting the form

#### Scenario: Real-time clearing of validation error
- **WHEN** user corrects an invalid field value to satisfy validation rules
- **THEN** system clears the associated field error and re-enables form submission eligibility

### Requirement: Authentication Credential Validation and Submission
The system SHALL enforce client-side schema validation on login and registration forms, ensuring presence of required email and password fields, strict password complexity (minimum 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character), password confirmation matching, and mandatory terms acceptance.

#### Scenario: Mismatched password confirmation rejected
- **WHEN** user submits registration form with "Secret123!" for password and "Different123!" for password confirmation
- **THEN** system blocks submission and displays "Passwords do not match" on the confirmation field

#### Scenario: Password missing special character rejected
- **WHEN** user enters "Password123" without a special character in the registration password field
- **THEN** system displays an error indicating password must contain at least one special character

#### Scenario: Valid authentication submission dispatches API call
- **WHEN** user provides compliant credentials and clicks submit
- **THEN** system transitions form to submitting state, invokes the authentication endpoint, and presents toast feedback upon completion

### Requirement: Complex Multi-Section Property Form State Handling
The system SHALL manage state across multi-section property creation and update workflows, including property classification, physical address, numeric decimal coordinates within valid bounds (-90 to 90 for latitude, -180 to 180 for longitude), amenity arrays, photo URLs, and house rule lists.

#### Scenario: Out-of-bounds geographic coordinate rejected
- **WHEN** user enters 95.5 for property latitude
- **THEN** system marks the latitude field with an error stating the value must be between -90 and 90

#### Scenario: Dynamic photo and rule collections preserved in form state
- **WHEN** user adds custom amenities, image URLs, or house rules to the form
- **THEN** system appends the item to the form array state and validates total form state readiness

### Requirement: Room Inventory Financial and Numeric Coercion Validation
The system SHALL validate numeric room attributes including monthly rent in dollars, security deposit in dollars, maximum occupants, and minimum stay months, coercing valid dollar entries into integer cents before payload dispatch and rejecting non-numeric, negative, or zero rent amounts.

#### Scenario: Zero or non-numeric rent rejected
- **WHEN** user attempts to submit a room form with rent amount 0 or negative
- **THEN** system blocks submission and highlights the monthly rent field with an error requiring a positive amount

#### Scenario: Dollar input successfully converted to cents payload
- **WHEN** user enters 1450.50 in monthly rent and submits valid room form
- **THEN** system converts the dollar value to 145050 integer cents in the API mutation payload

### Requirement: Asynchronous Submitting State and Submission Prevention
The system SHALL maintain reactive submission state during asynchronous mutations, disabling submit triggers, displaying loading indicators, and preventing duplicate submissions while an API operation is in flight. If the mutation fails, the form SHALL retain entered values and display contextual error messaging.

#### Scenario: Submit button disabled during pending request
- **WHEN** user submits a valid form
- **THEN** submit action is immediately disabled with a loading indicator until the network request resolves or rejects

#### Scenario: Form values preserved following failed submission
- **WHEN** network request fails or server returns an error code
- **THEN** form preserves all entered input values and displays error toast feedback without resetting state
