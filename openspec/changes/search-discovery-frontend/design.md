# Design

## Context

The backend already exposes a robust search module at `/api/v1/search`:
- `GET /api/v1/search/properties`: accepts `location`, `priceMin`, `priceMax`, `roomType`, `isFurnished`, `moveInDate`, `amenities`, and pagination cursors.
- `POST /api/v1/search/saved`: creates saved search criteria for authenticated tenants.
- `GET /api/v1/search/saved` & `DELETE /api/v1/search/saved/:id`: manages saved searches.
- Fair housing filters are enforced by the backend on location, queries, and amenities.

The frontend uses Next.js 16 App Router with React Server Component layouts and Apple design system styling. The discovery page will live at `src/app/(dashboard)/explore/page.tsx` within the existing dashboard shell.

## Goals / Non-Goals

**Goals:**
- Provide a clean, high-performance Search & Discovery page at `/explore`.
- Support multimodal filtering: location, radius/map coordinates, price range slider/inputs (dollars to cents), room type (`PRIVATE` / `SHARED`), move-in date picker, and amenity pills.
- Implement listing segregation: "All", "Roommate-based" (open room in occupied unit / roommate approval required), and "Owner-vacant" (entirely empty or owner-managed units).
- Enforce move-in date availability: query rooms with `status: "AVAILABLE"` as of the requested date.
- Provide a "Save Search" workflow and "Saved Searches" management drawer with alert status.
- Ensure URL query parameter synchronization so searches are bookmarkable and shareable.

**Non-Goals:**
- Third-party paid map tile APIs (e.g. Google Maps API billing); use OpenStreetMap/Leaflet or clean responsive interactive coordinate radar map with geo-pins.
- Backend schema alterations or webhook push daemon changes.

## Decisions

### 1. Route & Server Component Architecture
- **Decision:** Define `src/app/(dashboard)/explore/page.tsx` as a Server Component that exports Next.js `metadata` and wraps the client search experience in a `<Suspense fallback={<ExploreLoadingSkeleton />}>` boundary.
- **Rationale:** Next.js 16 requires client components using `useSearchParams()` to be enclosed within `<Suspense>` to enable streaming and static generation without de-optimization.
- **Alternatives Considered:** Making the entire page `"use client";`. Rejected to follow the established `maximize-server-components` architecture standard.

### 2. URL State Synchronization for Filter Criteria
- **Decision:** Synchronize search filters with browser search parameters (`?location=&priceMin=&priceMax=&roomType=&moveInDate=&listingType=&amenities=`).
- **Rationale:** Enables tenants to copy links, share searches with prospective roommates, and refresh the browser without losing their query state.
- **Alternatives Considered:** Storing filter state purely in React memory or LocalStorage. Rejected because shareable URLs are essential for rental discovery.

### 3. Roommate-Based vs. Owner-Vacant Listing Segregation
- **Decision:** Compute listing classification on property and room entities:
  - **Roommate-Based:** Listings where `property.requiresRoommateApproval === true`, or where existing rooms in the unit have active tenants (`occupiedSlots > 0`).
  - **Owner-Vacant:** Listings where all rooms have `occupiedSlots === 0` and `requiresRoommateApproval === false`.
- **Rationale:** Perfectly fulfills FR-2.2 without requiring backend schema migrations, giving tenants instantaneous switching between solo vacant apartments and communal roommate living.
- **Alternatives Considered:** Requiring backend query updates. Rejected because the existing API returns all necessary property and room fields (`requiresRoommateApproval`, `occupiedSlots`, `maxOccupants`).

### 4. Interactive Map & Radius Visualizer
- **Decision:** Implement an interactive split-view (List vs. Map & Radius) with property pins plotted via their `latitude` and `longitude`, radius circle selector, and interactive listing preview cards.
- **Rationale:** Gives tenants intuitive visual feedback on property proximity to transit or workplaces.
- **Alternatives Considered:** External paid Google Maps iframe. Rejected due to API key dependency and styling inconsistency with Apple-style glassmorphism.

### 5. Saved Search Modal & Drawer
- **Decision:** Create `<SaveSearchModal />` and `<SavedSearchesDrawer />` components. Authenticated tenants can save the current query parameters with a descriptive name, view active saved searches, trigger searches in one tap, and manage alerts. If unauthenticated, redirect/prompt to sign in.
- **Rationale:** Delivers FR-2.4 cleanly with direct backend persistence to `/api/v1/search/saved`.

## Risks / Trade-offs

- **[Risk]** Backend Fair Housing check errors (400 Bad Request if prohibited terms are typed).
  - *Mitigation:* Add client-side validation hint against prohibited demographic keywords prior to submission.
- **[Risk]** Price conversion bugs between dollars and cents.
  - *Mitigation:* Consistently use `dollarsToCents` for API requests and `centsToDollars` for display badges.
- **[Risk]** Mobile layout clutter with many filters.
  - *Mitigation:* Implement responsive collapsible filter drawer with quick-filter pills on mobile.

## Migration Plan

1. **Step 1:** Add domain types in `src/types/search.ts` and API client methods in `src/lib/api.ts`.
2. **Step 2:** Build search filter bar, map visualizer, listing cards, and saved search modal/drawer in `src/components/search/`.
3. **Step 3:** Implement `/explore` route page in `src/app/(dashboard)/explore/page.tsx` with `<Suspense>` and metadata.
4. **Step 4:** Integrate navigation link in `DashboardNavbar.tsx` and landing page.
5. **Step 5:** Run `bun run lint` and `bun run build` to verify compliance.
