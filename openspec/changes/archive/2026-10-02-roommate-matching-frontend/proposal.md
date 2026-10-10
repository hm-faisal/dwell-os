# Proposal: Roommate Profiles & Preference Matching Frontend

## Why

Modern rental discovery extends beyond physical walls to the people sharing the home. To prevent living friction, interpersonal conflict, and unexpected roommate turnover, prospective tenants need to create detailed lifestyle and preference profiles, view explainable compatibility scores before committing, express mutual interest to connect, and participate in democratic co-approval voting when new roommates apply to join an existing shared unit.

## What Changes

- **Domain Types & API Client:** Create `src/types/roommate.ts` and `src/lib/validations/roommate.ts` capturing roommate profiles, compatibility breakdowns, matches, and approval votes. Integrate `roommateMatchingApi` into `src/lib/api.ts` connecting to `/api/v1/roommate-profile`, `/api/v1/matches`, `/api/v1/matches/:targetUserId/interest`, and `/api/v1/rooms/:id/roommate-approval`.
- **Roommate Profile Setup & Management:** Build an intuitive Apple-style profile editor (`RoommateProfileForm.tsx`) allowing tenants to configure lifestyle tags (smoking, pets, sleep schedule, cleanliness, work schedule), budget ranges in dollars (converted to cents), preferred move-in date, and bio (FR-3.1).
- **Explainable Compatibility Matching:** Build matchmaker components (`RoommateMatchCard.tsx`, `RoommateMatchGrid.tsx`) computing and rendering transparent compatibility scores across budget overlap, cleanliness, sleep schedule, work schedule, and habits (FR-3.2, FR-3.3).
- **Mutual Interest & Introductions:** Build `ExpressInterestModal.tsx` allowing tenants to express interest with custom intro notes; when mutual interest occurs, display celebration banner and prompt intro thread (FR-3.4).
- **Roommate Co-Approval Voting:** Build `RoommateApprovalVoteCard.tsx` and integrate co-approval voting interface allowing active roommates in a shared room to review applicant profiles and cast their co-approval decision (FR-3.5).
- **Route & Navigation Integration:** Implement Server Component route page at `src/app/(dashboard)/roommates/page.tsx` with `<Suspense>` boundary and tabbed view (Browse Matches vs. My Profile vs. Co-Approval Votes), and wire the "Roommates" link into `DashboardNavbar.tsx`.

## Capabilities

### New Capabilities
- `roommate-matching`: Comprehensive roommate profile authoring, transparent compatibility evaluation, mutual interest connections, and shared unit roommate co-approval voting.

### Modified Capabilities
<!-- No existing capability requirements are being modified -->

## Impact

- **Frontend Routes & Views:** Creates `src/app/(dashboard)/roommates/page.tsx` and sub-views within the dashboard shell.
- **Component Architecture:** Adds new modular leaf components in `src/components/roommates/` using the Apple design system tokens and glassmorphic cards.
- **Backend API Integration:** Fully utilizes existing backend endpoints in `../backend/src/modules/roommate-matching/` with proper authentication token handling.
