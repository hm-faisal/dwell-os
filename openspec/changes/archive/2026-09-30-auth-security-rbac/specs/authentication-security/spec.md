# Spec Delta

## Purpose

Provides secure identity registration, federated OAuth authentication, password complexity enforcement, tokenized email verification with tiered access gating, and single-use refresh token rotation.

## ADDED Requirements

### Requirement: Password Complexity Enforcement
The system SHALL validate that all user passwords contain a minimum of 8 characters and include at least one uppercase letter, one lowercase letter, one numeric digit, and one special character. Plaintext passwords SHALL NOT be persisted or logged, and SHALL be hashed using bcrypt with a work factor of at least 10.

#### Scenario: Registration with weak password rejected
- **WHEN** user submits registration with password "password123"
- **THEN** system rejects registration with HTTP 400 and an error indicating missing uppercase and special character requirements

#### Scenario: Registration with compliant password accepted
- **WHEN** user submits registration with password "Passw0rd!Secure"
- **THEN** system accepts password, hashes it using bcrypt, and creates the account

### Requirement: Federated Identity via Google OAuth 2.0
The system SHALL allow users to register and sign in via Google OAuth 2.0. Users authenticating via Google SHALL be automatically provisioned with verified email status.

#### Scenario: New user signs in via Google
- **WHEN** user completes Google OAuth flow with email "user@example.com" and no local account exists
- **THEN** system provisions a new User record with role TENANT, sets emailVerified to true, and issues authentication tokens

#### Scenario: Existing user links Google identity
- **WHEN** user with existing local email account authenticates via Google OAuth with matching email
- **THEN** system links the Google provider ID to the account, marks emailVerified as true, and logs user in

### Requirement: Email Verification with Restricted Scope
The system SHALL require email verification before granting access to high-privilege operations. Unverified users SHALL be permitted to browse properties and view public rooms, but SHALL be restricted from submitting housing applications, signing leases, or creating properties.

#### Scenario: Unverified user attempts room application
- **WHEN** authenticated user with isEmailVerified false submits a room application
- **THEN** system blocks request with HTTP 403 and error code EMAIL_VERIFICATION_REQUIRED

#### Scenario: User verifies email with valid token
- **WHEN** user clicks verification link containing valid, unexpired token
- **THEN** system marks user's isEmailVerified as true, records verification timestamp, and grants full platform access

#### Scenario: User attempts verification with expired token
- **WHEN** user submits expired verification token
- **THEN** system rejects request with HTTP 400 and offers to resend a new verification email

### Requirement: Secure Session and Refresh Token Rotation
The system SHALL issue short-lived JWT access tokens with a lifespan of 15 to 60 minutes, paired with cryptographically random refresh tokens stored in Redis. Upon refresh token exchange, the submitted refresh token SHALL be invalidated and a new pair issued. If a revoked refresh token is presented, all refresh tokens associated with that user session SHALL be immediately invalidated.

#### Scenario: Token refresh with valid token
- **WHEN** client presents a valid, active refresh token to /auth/refresh
- **THEN** system revokes the presented refresh token, generates a new access token and refresh token, and returns them to the client

#### Scenario: Replay detection on already-used refresh token
- **WHEN** client presents an already-rotated or revoked refresh token
- **THEN** system detects token reuse, invalidates all active sessions in Redis for that user, and responds with HTTP 401 Unauthorized
