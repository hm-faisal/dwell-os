# Design

## Context

DwellOS currently has baseline authentication and RBAC primitives (`AuthService` in `src/modules/auth/`, `rbac.ts`, and `contract.prisma`), but several production security requirements remain unaddressed:
- Passwords only validate length without complexity checks.
- Email verification does not exist despite Nodemailer SMTP being configured in the codebase.
- No federated identity (OAuth) is supported.
- The `Roommate` role is conceptual rather than tied to active tenancy in shared units.
- Sensitive user phone numbers and identity verification documents are stored unencrypted.

See `proposal.md` for background motivation.

## Goals / Non-Goals

**Goals:**
- Provide complete registration and onboarding with password complexity validation (min 8 chars, uppercase, lowercase, number, special character) and Google OAuth 2.0.
- Implement Option B Tiered Email Verification: unverified users can browse listings and public room inventories, but are blocked from submitting applications, signing leases, or managing properties until email confirmation is complete.
- Provide secure session management with short-lived JWT access tokens (15m) and Redis-backed refresh token rotation with reuse attack detection.
- Dynamically hydrate the contextual `Roommate` role in middleware for tenants with active leases on shared rooms.
- Implement AES-256-GCM envelope encryption at rest for all sensitive PII and verification files, with mandatory audit logging in `DocumentAuditLog`.
- Implement responsive frontend authentication screens, verification banners, and route guards.

**Non-Goals:**
- Multi-provider federated login beyond Google (Apple, GitHub deferred to future changes).
- Hardware Security Module (HSM) key management; encryption utilizes environment/vault-injected master keys.
- Biometric WebAuthn / Passkeys authentication.

## Decisions

### 1. Tiered Email Verification (Option B) vs. Hard Login Wall
- **Decision**: Allow unverified users to authenticate, browse listings, view rooms, and manage basic profile settings, while enforcing a `requireVerifiedEmail` guard on sensitive write endpoints (applications, leases, property creation, payment setup).
- **Rationale**: Minimizes top-of-funnel drop-off for prospective tenants browsing the platform while strictly protecting contractual and financial workflows.
- **Alternatives Considered**: Option A (Hard Wall where unverified users cannot login at all) was rejected for adding unnecessary friction to initial browsing.

### 2. Dynamic Roommate Context Hydration in Middleware
- **Decision**: Evaluate `isRoommate` dynamically inside `authenticate` middleware by executing an indexed check on active leases for shared rooms (`leaseTenant` join `lease` where `lease.status = 'ACTIVE'` and `room.type = 'SHARED'`).
- **Rationale**: Tenancy is fluid. A tenant moves in, assumes roommate responsibilities (bill splitting, application voting), and moves out. Modeling `Roommate` as a static database column in `User.role` creates stale authorization states.
- **Alternatives Considered**: Dedicated `/api/v1/roommate/activate` endpoint; rejected because authorization must be automatically enforced without manual client-side toggles.

### 3. Single-Use Refresh Token Rotation with Redis Invalidation
- **Decision**: Refresh tokens are single-use cryptographically random strings linked to a user session family in Redis (`dwellos:refresh:<userId>:<familyId>`). When `/auth/refresh` is called, the old refresh token is revoked and a new pair is issued. If an already-revoked refresh token is presented (indicating token interception/theft), the entire family is deleted immediately, requiring re-login.
- **Rationale**: Protects against refresh token replay and session hijacking.
- **Alternatives Considered**: Long-lived stateless JWT refresh tokens; rejected because stateless tokens cannot be revoked immediately upon compromise.

### 4. AES-256-GCM Envelope Encryption for PII
- **Decision**: Sensitive fields (`User.phone`, `Verification.data`, `Verification.documentUrl`) are encrypted using Node.js built-in `crypto` with `aes-256-gcm`. Formatted string stored: `enc:v1:<base64_iv>:<base64_auth_tag>:<base64_ciphertext>`. Every decryption triggers a log entry in `DocumentAuditLog`.
- **Rationale**: Provides authenticated encryption with integrity verification (preventing bit-flipping attacks) and versioning (`v1`) for future key rotation.
- **Alternatives Considered**: Database-level pgcrypto; rejected to prevent exposing plaintext data in database replication logs and backups.

### 5. Frontend Auth & Interceptor Architecture
- **Decision**: Next.js client-side API client in `src/lib/api.ts` maintains access token in memory/localStorage, automatically intercepts 401 Unauthorized responses to attempt a single token refresh, and redirects to `/login` if refresh fails. Displays a persistent `EmailVerificationBanner` when `user.isEmailVerified` is false.
- **Rationale**: Seamless user experience that handles token lifecycle automatically without interrupting valid browsing sessions.

## Risks / Trade-offs

- **[Risk: Redis Unavailability]** → If Redis is down, token rotation could fail.
  - *Mitigation*: Fall back to database-backed verification tokens for email confirmation; refresh token endpoint returns 503 Service Unavailable with retry headers rather than allowing unauthenticated access.
- **[Risk: Database Migration Locking]** → Adding columns to `User` in production Neon Postgres.
  - *Mitigation*: Columns `isEmailVerified` (boolean with default false) and `googleId` (nullable text with unique index) are non-blocking additions in Postgres.
- **[Risk: Existing Unverified Users Locked Out]** →
  - *Mitigation*: Migration script will backfill `isEmailVerified = true` for all existing users in the database so existing development/production test accounts remain fully functional.

## Migration Plan

1. **Database Schema Update**: Add `isEmailVerified`, `emailVerifiedAt`, and `googleId` to `contract.prisma` and live database; create `emailVerificationToken` table. Backfill existing users.
2. **Backend Security Layer**:
   - Implement `src/lib/crypto.ts` (AES-256-GCM encrypt/decrypt with audit logging).
   - Implement Google OAuth 2.0 routes and handlers in `src/modules/auth/`.
   - Update `auth.schemas.ts` with strict password regex.
   - Update `auth-middleware.ts` to hydrate dynamic roommate context and email verification status.
   - Implement email verification token generation and verification endpoints.
3. **Frontend Implementation**:
   - Create auth pages (`/login`, `/register`, `/verify-email`).
   - Add Google OAuth button and callback handler.
   - Add global `EmailVerificationBanner` in dashboard layout when unverified.
   - Add 401 token refresh interceptor in `src/lib/api.ts`.
4. **Verification**: End-to-end tests for registration, email gating, Google login, roommate context, PII encryption, and audit log generation.
