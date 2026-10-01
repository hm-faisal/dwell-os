# Proposal

## Why

DwellOS requires a unified, production-grade identity, authorization, and data protection architecture to support property operations and shared housing securely. While basic credentials and initial role checks exist, the platform lacks a complete user onboarding and security lifecycle: password complexity is unenforced, email verification is missing, federated Google OAuth is not implemented, the "Roommate" role is not dynamically grounded in active shared leases, and sensitive PII (government IDs, verification data, phone numbers) is stored unencrypted at rest. Implementing this foundational security framework ensures legal compliance, protects user privacy, and establishes strict role-based access control across all operations.

## What Changes

- **Credential Security & Validation**: Enforce strict password complexity during registration (minimum 8 characters, with lowercase, uppercase, numeric, and special characters) hashed via bcrypt with secure cost factor 10-12.
- **Google OAuth 2.0 Federation**: Support one-tap/federated authentication with Google; automatically mark user email as verified upon successful OAuth sign-in.
- **Tiered Email Verification (Option B - Restricted Scope)**: Implement tokenized email verification via Nodemailer/SMTP. Unverified users can browse listings and view room details, but cannot submit housing applications, sign leases, create properties, or upload verification documents until their email is confirmed.
- **Session & Token Management**: Implement short-lived JWT access tokens (15-60 min) paired with Redis-backed refresh token rotation that revokes old tokens upon single use to mitigate replay attacks.
- **Dynamic Contextual Roles**:
  - Distinguish base platform roles (`OWNER`, `TENANT`, `ADMIN`) from contextual scopes.
  - Dynamically evaluate `Roommate` status per-request based on active tenancy in a `SHARED` room, unlocking roommate matching, application voting, and bill splitting.
  - Enforce delegated `PropertyManager` scopes per property.
- **PII Encryption at Rest & Audit Logging**: Encrypt all sensitive PII fields (`User.phone`, `Verification.data`, `Verification.documentUrl`, identity files) using AES-256-GCM envelope encryption (`enc:v1:<iv>:<tag>:<ciphertext>`), with automatic audit trails recorded in `DocumentAuditLog`.
- **Frontend Security Integration**: Add authentication forms (Register, Login, Google OAuth button, Email Verification banner), route guards for unverified/unauthorized users, and token refresh interceptors.

## Capabilities

### New Capabilities
- `authentication-security`: User registration, Google OAuth 2.0 federation, mandatory email verification with restricted scope enforcement, password strength validation, and secure JWT/refresh token rotation.
- `role-based-access-control`: Server-side and client-side RBAC for Owner, Property Manager, Tenant, dynamic Roommate, and Admin roles.
- `data-protection-compliance`: AES-256-GCM symmetric encryption at rest for sensitive PII and verification documents, with read audit logging.

### Modified Capabilities
<!-- None: No previous main specs exist yet in openspec/specs/ -->

## Impact

- **Backend**:
  - Updates to `contract.prisma` for User email verification fields, Google provider ID, and token models.
  - Updates to `src/modules/auth/` (OAuth controller, verification endpoints, password validator).
  - Updates to `src/lib/auth-middleware.ts` and `src/lib/rbac.ts` (dynamic roommate context hydration, email verification guard).
  - New `src/lib/crypto.ts` for AES-256-GCM envelope encryption and decryption with `DocumentAuditLog` tracking.
- **Frontend**:
  - New auth pages: `/login`, `/register`, `/verify-email`.
  - Auth token interceptors in `src/lib/api.ts` with auto-refresh on 401.
  - Email verification reminder banner and action restriction guards.
- **External Dependencies**: Google OAuth 2.0 API, Nodemailer SMTP transport, Redis for token rotation.
