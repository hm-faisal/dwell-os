# Tasks

## 1. Domain Types, Schemas & API Integration

- [x] 1.1 Create `src/types/roommate.ts` with interfaces for `RoommateProfile`, `CompatibilityBreakdown`, `RoommateMatch`, `RoommateApproval`, and Zod validation schemas in `src/lib/validations/roommate.ts`, exported via `src/lib/validations/index.ts`, verifying strict TypeScript compilation.
- [x] 1.2 Implement `roommateMatchingApi` in `src/lib/api.ts` with `getMyProfile`, `getProfile`, `upsertProfile`, `getMatches`, `expressInterest`, and `approveRoommate`, verifying API request signatures against the backend endpoints.

## 2. Roommate Profile Setup & Preference Form (FR-3.1)

- [x] 2.1 Create `src/components/roommates/RoommateProfileForm.tsx` supporting budget bounds, sleep schedule, work schedule, cleanliness standards, smoking/pet habits, preferred move-in date, bio, and custom lifestyle tags with Apple design tokens (FR-3.1), verifying validation and profile persistence.

## 3. Compatibility Matching & Explainable Breakdown (FR-3.2, FR-3.3)

- [x] 3.1 Create `src/components/roommates/CompatibilityBreakdownModal.tsx` and `src/components/roommates/CompatibilityScoreBar.tsx` rendering transparent point breakdowns for budget overlap, cleanliness, sleep schedule, work routine, and personal habits (FR-3.3), verifying attribute breakdown display.
- [x] 3.2 Create `src/components/roommates/RoommateMatchCard.tsx` and `src/components/roommates/RoommateMatchGrid.tsx` rendering candidate match cards, compatibility badges, minimum score filter sliders, and unprofiled tenant prompts (FR-3.2), verifying match ranking and rendering.

## 4. Mutual Interest & Shared Room Co-Approval (FR-3.4, FR-3.5)

- [x] 4.1 Create `src/components/roommates/ExpressInterestModal.tsx` allowing tenants to express interest with custom intro notes and celebrating mutual interest matches (FR-3.4), verifying API submission and interest status badges.
- [x] 4.2 Create `src/components/roommates/RoommateApprovalVoteCard.tsx` enabling active roommates in shared units to review incoming applicant profiles and cast co-approval votes with comments (FR-3.5), verifying voting authorization and submission.

## 5. Route Integration & Verification

- [x] 5.1 Create `src/components/roommates/RoommateContainer.tsx` and Server Component `src/app/(dashboard)/roommates/page.tsx` with `<Suspense>` boundary and tabbed view, and add "Roommates" navigation tab to `DashboardNavbar.tsx`, verifying route navigation.
- [x] 5.2 Run project linter (`bun run lint`) and production build (`bun run build`), verifying zero Biome lint errors and clean Turbopack RSC static generation.
