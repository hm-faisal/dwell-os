# Design

## Context

The backend already exposes a complete roommate matching engine in `../backend/src/modules/roommate-matching/`:
- `GET /api/v1/roommate-profile`: returns current user's profile and user details.
- `POST/PUT/PATCH /api/v1/roommate-profile`: creates or updates the roommate profile with budget bounds, habits, and schedules.
- `GET /api/v1/matches`: computes and returns scored candidate profiles with explainable point breakdowns.
- `POST /api/v1/matches/:targetUserId/interest`: registers interest, triggers notifications, and promotes mutual matches.
- `POST /api/v1/rooms/:id/roommate-approval`: casts roommate co-approval votes for active occupants of shared units.

The frontend uses Next.js 16 App Router, React Server Components with isolated client leaves, and Apple-style glassmorphic design tokens.

## Goals / Non-Goals

**Goals:**
- Provide a dedicated, responsive Roommates portal at `/roommates`.
- Deliver a comprehensive, frictionless profile setup form supporting budget range, sleep/work schedules, cleanliness levels, habits, and custom lifestyle tags (FR-3.1).
- Present prospective roommate matches sorted by compatibility score (0–100%) (FR-3.2).
- Ensure the compatibility algorithm is explainable by rendering a visual attribute breakdown card showing points earned from budget overlap, cleanliness, sleep schedule, work schedule, and habits (FR-3.3).
- Provide an "Express Interest" workflow with personal message support and celebration banner upon mutual interest (FR-3.4).
- Enable existing shared-unit roommates to vote on applicant co-approvals directly from the dashboard (FR-3.5).
- Follow Server Component architecture with `<Suspense>` boundaries.

**Non-Goals:**
- Real-time WebSocket peer-to-peer messaging (handled via existing in-app notification events and email/chat links).
- Backend algorithmic redesign (the backend deterministic scoring algorithm in `roommate-matching.services.ts` is already robust and explainable).

## Decisions

### 1. Server Component Shell with Tabbed Leaf Container
- **Decision:** Implement `src/app/(dashboard)/roommates/page.tsx` as an RSC exporting `metadata` and wrapping `<RoommateContainer />` in `<Suspense>`. The client container manages URL search tab state (`?tab=matches`, `?tab=profile`, `?tab=approvals`).
- **Rationale:** Aligns with Next.js 16 RSC standards and preserves bookmarkable and shareable tab views.
- **Alternatives Considered:** Separate route folders (`/roommates/matches`, `/roommates/profile`). Rejected to minimize navigation latency and provide a cohesive single-page dashboard experience.

### 2. Explainable Breakdown Visualization Component
- **Decision:** Build `<CompatibilityBreakdownModal />` and `<CompatibilityScoreBar />` rendering five distinct progress bars:
  - Budget Overlap (up to 30 pts)
  - Cleanliness Standards (up to 25 pts)
  - Sleep Schedule Synergy (up to 15 pts)
  - Work Schedule Compatibility (up to 15 pts)
  - Habits & Pet Living (up to 15 pts)
- **Rationale:** Directly fulfills FR-3.3 by ensuring tenants clearly understand why a match scored 85% vs. 45%, highlighting shared and conflicting attributes.
- **Alternatives Considered:** Displaying a single aggregated percentage number. Rejected as it violates FR-3.3's explainability mandate.

### 3. Currency and Budget Handling
- **Decision:** Accept dollar amounts in the UI and automatically convert to integer cents using `dollarsToCents` for API requests, and `centsToDollars` / `formatCurrency` for display cards.
- **Rationale:** Guarantees zero floating-point discrepancies across the backend minor unit storage.

### 4. Co-Approval Voting Authorization & Error Feedback
- **Decision:** Provide `<RoommateApprovalVoteCard />` with active lease verification. If a user is not an active tenant of that shared room, surface clear informative feedback rather than generic failure.
- **Rationale:** Ensures clean UX when tenants view shared rooms or co-living voting requirements.

## Risks / Trade-offs

- **[Risk]** Unprofiled tenants browsing matches receive HTTP 400 from backend ("Please complete your roommate profile before viewing matches").
  - *Mitigation:* Gracefully handle the 400 response in the UI by displaying a friendly Apple-style profile setup invitation prompt with a direct button to the Profile tab.
- **[Risk]** High cognitive load filling long lifestyle preference forms.
  - *Mitigation:* Segment profile creation into clean visual cards: 1. Budget & Move-in, 2. Sleep & Work Routine, 3. Cleanliness & Habits, 4. Lifestyle Tags & Bio.

## Migration Plan

1. Create domain types `src/types/roommate.ts` and Zod validation schemas in `src/lib/validations/roommate.ts`.
2. Add `roommateMatchingApi` methods to `src/lib/api.ts`.
3. Build components in `src/components/roommates/`:
   - `RoommateProfileForm.tsx` (FR-3.1)
   - `RoommateMatchCard.tsx` and `CompatibilityBreakdownModal.tsx` (FR-3.2, FR-3.3)
   - `RoommateMatchGrid.tsx` with filter threshold slider
   - `ExpressInterestModal.tsx` (FR-3.4)
   - `RoommateApprovalVoteCard.tsx` (FR-3.5)
   - `RoommateContainer.tsx`
4. Create Server Component route at `src/app/(dashboard)/roommates/page.tsx` and add "Roommates" to `DashboardNavbar.tsx`.
5. Verify via `bun run lint` and `bun run build`.
