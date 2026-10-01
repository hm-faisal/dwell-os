# toast-notifications Specification

## Purpose

Provides centralized, transient, and accessible toast notifications for success, error, warning, informational, and asynchronous promise states using shadcn sonner across all user workflows.

## Requirements

### Requirement: Global Toast Notification Container
The system SHALL provide a globally mounted, accessible notification viewport positioned consistently across all application views. The notification container SHALL support dark mode themes, automatic dismiss timers, manual dismissal via close button, and stacking of concurrent messages without layout displacement.

#### Scenario: Toast container mounted in root layout
- **WHEN** any application page or route is loaded
- **THEN** the notification container is mounted and ready to receive and display notification events

#### Scenario: Automatic and manual toast dismissal
- **WHEN** a toast notification is displayed to the user
- **THEN** the toast automatically dismisses after a predetermined duration (default 4000ms), or immediately when the user clicks the dismiss button or swipes the notification

### Requirement: Success Feedback Notifications
The system SHALL present a visually distinctive success toast notification whenever a user completes an asynchronous write, creation, update, or authentication event.

#### Scenario: Successful property creation triggers toast
- **WHEN** user successfully submits the property creation form
- **THEN** system displays a success toast with title "Property Created" and redirects to the property detail view

#### Scenario: Successful email verification dispatch triggers toast
- **WHEN** user requests a new verification email
- **THEN** system displays a success toast confirming the dispatch to their registered email address

### Requirement: Error Feedback Notifications
The system SHALL present an error toast notification containing descriptive error messages whenever an asynchronous action, form submission, or network request fails.

#### Scenario: API request returns 4xx or 5xx error
- **WHEN** an API mutation fails due to server error or validation failure
- **THEN** system emits an error toast displaying the error description and persists until dismissed or timed out

#### Scenario: Network disconnect or unexpected client error
- **WHEN** a network connectivity failure occurs during an action
- **THEN** system displays an error toast informing the user of the network failure and suggesting a retry

### Requirement: Actionable Feedback for Access Gating
The system SHALL display an actionable warning toast whenever an operation is rejected due to unverified email status (`EMAIL_VERIFICATION_REQUIRED`). The toast SHALL provide a direct call-to-action button enabling the user to navigate to the verification page or immediately trigger a verification resend.

#### Scenario: Restricted action blocked by unverified email
- **WHEN** unverified user attempts a high-privilege action and receives HTTP 403 `EMAIL_VERIFICATION_REQUIRED`
- **THEN** system displays an actionable warning toast titled "Email Verification Required" with a button to "Verify Email"

### Requirement: Asynchronous Promise Lifecycle Feedback
The system SHALL support promise-bound toast feedback that displays a loading state during execution and dynamically transitions to a success or error message upon resolution or rejection.

#### Scenario: Long-running action with promise toast
- **WHEN** user initiates a multi-step operation such as media uploading or property deletion
- **THEN** system displays an ongoing loading indicator toast that updates automatically to a success toast upon completion
