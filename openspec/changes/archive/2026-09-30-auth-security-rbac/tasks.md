# Tasks

## 1. Database Schema & Migration (`../backend`)

- [x] 1.1 Update `src/prisma/contract.prisma` to add `isEmailVerified` (Boolean, default false), `emailVerifiedAt` (Timestamptz?), `googleId` (String?, unique) to the `User` model, and add the `EmailVerificationToken` model; verify with `pnpm --dir ../backend exec prisma validate`.
- [x] 1.2 Run Prisma contract emit (`pnpm --dir ../backend run contract:emit`) and execute SQL migration DDL to add the columns to PostgreSQL, backfilling existing users with `isEmailVerified = true`; verify with `pnpm --dir ../backend run db:verify`.

## 2. Backend Security & Cryptography Engine (`../backend`)

- [x] 2.1 Implement `src/lib/crypto.ts` providing AES-256-GCM symmetric encryption/decryption with envelope format `enc:v1:<iv>:<tag>:<ciphertext>` and automated audit logging in `DocumentAuditLog`; verify with unit tests covering encryption, decryption, and tampering detection.
- [x] 2.2 Update `src/modules/auth/auth.schemas.ts` to enforce password complexity (min 8 chars, uppercase, lowercase, numeric, special character) on registration and password update schemas; verify with schema unit tests.
- [x] 2.3 Implement single-use refresh token rotation in `src/modules/auth/auth.services.ts` with Redis token family invalidation on detected reuse; verify via integration test simulating token reuse.

## 3. Email Verification & OAuth Backend (`../backend`)

- [x] 3.1 Implement Email Verification service in `src/modules/auth/auth.services.ts` (token generation, expiration check, Nodemailer HTML dispatch, and `/auth/verify-email` endpoint); verify by generating a token, confirming email, and asserting `isEmailVerified` transitions to true.
- [x] 3.2 Implement Google OAuth 2.0 routes (`/auth/oauth/google`, `/auth/oauth/google/callback`) exchanging auth codes for Google profile data, upserting user with `isEmailVerified: true`, and issuing JWT tokens; verify route handling and token response.
- [x] 3.3 Implement `requireVerifiedEmail` middleware in `src/lib/rbac.ts` and apply to high-privilege endpoints (property creation, room applications, lease signing, verification document upload); verify unverified users receive 403 `EMAIL_VERIFICATION_REQUIRED`.

## 4. Contextual Roles & Dynamic Roommate Engine (`../backend`)

- [x] 4.1 Update `src/lib/auth-middleware.ts` to query active shared leases (`leaseTenant` join `lease` where `status = 'ACTIVE'` and `room.type = 'SHARED'`) and hydrate `req.user.isRoommate` and `req.user.activeSharedLeaseId`; verify with unit tests covering shared room tenants vs private room tenants.
- [x] 4.2 Enforce delegated `PropertyManager` and dynamic `Roommate` permissions across roommate application approvals (`src/modules/applications/`), bill splitting, and maintenance requests; verify access control with test requests.

## 5. Frontend Authentication & Route Protection (`./`)

- [x] 5.1 Implement Auth state management and API client interceptor in `src/lib/api.ts` supporting login, registration, token refresh on 401 Unauthorized, and Google OAuth redirect; verify token retention and auto-refresh.
- [x] 5.2 Build User Login page at `src/app/(auth)/login/page.tsx` and Registration page at `src/app/(auth)/register/page.tsx` with password strength indicator and "Continue with Google" button; verify client validation and submission.
- [x] 5.3 Build Email Verification page at `src/app/(auth)/verify-email/page.tsx` and persistent `EmailVerificationBanner` in dashboard layout displaying a warning and resend CTA when `user.isEmailVerified` is false; verify banner displays for unverified users and hides for verified users.

## 6. End-to-End Verification & Compliance Checks

- [x] 6.1 Run full auth & security verification script covering: registration with password complexity, unverified user restricted access, email verification transition, Google OAuth mock flow, dynamic roommate role activation upon lease start, and AES-256-GCM encrypted PII storage in PostgreSQL; verify DB records.
- [x] 6.2 Run frontend build (`bun run build`) and linting (`bun run lint`) to verify zero errors across Next.js 16 and Biome.
