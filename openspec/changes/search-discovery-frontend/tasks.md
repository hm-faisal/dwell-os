# Tasks

## 1. Domain Types, Schemas & API Integration

- [x] 1.1 Create `src/types/search.ts` with interfaces for `SearchFilters`, `SearchResultProperty`, `SavedSearch`, and Zod schemas in `src/lib/validations/search.ts`, verifying strict TypeScript compilation.
- [x] 1.2 Implement `searchApi` in `src/lib/api.ts` with `searchProperties`, `createSavedSearch`, `getSavedSearches`, and `deleteSavedSearch`, verifying API request signatures against the backend endpoints.

## 2. Search & Discovery Core Components

- [x] 2.1 Create `src/components/search/SearchFilterBar.tsx` supporting location search, price range sliders/inputs, room type (`PRIVATE` / `SHARED`), move-in date picker, and amenity pills with live URL sync, verifying state changes reflect in query params.
- [x] 2.2 Create `src/components/search/ListingTypeToggle.tsx` providing quick toggles between "All", "Roommate Listings", and "Owner-Vacant Listings" (FR-2.2), verifying client classification logic.
- [x] 2.3 Create `src/components/search/ListingCard.tsx` and `src/components/search/ListingGrid.tsx` rendering property and available room cards with Apple design badges, photos, pricing, and move-in availability dates (FR-2.3), verifying rendering with mock/live data.
- [x] 2.4 Create `src/components/search/MapRadiusView.tsx` providing an interactive coordinate-based map preview with property geo-pins, radius circle indicators, and listing quick-peek modals (FR-2.1), verifying pin coordinates and toggle interactions.

## 3. Saved Searches & Alerts Management

- [x] 3.1 Create `src/components/search/SaveSearchModal.tsx` allowing authenticated tenants to save current search criteria under a custom name, verifying API submission and toast notification (FR-2.4).
- [x] 3.2 Create `src/components/search/SavedSearchesDrawer.tsx` allowing tenants to view, re-apply, and delete saved searches, with alert status badges (FR-2.4), verifying list retrieval and re-execution.

## 4. Route Integration & Verification

- [x] 4.1 Create `src/app/(dashboard)/explore/page.tsx` as a Server Component exporting `metadata` and wrapping `<ExploreContainer />` in `<Suspense>`, and add "Explore" link to `DashboardNavbar.tsx` and landing page, verifying route accessibility.
- [x] 4.2 Run project linter (`bun run lint`) and production build (`bun run build`), verifying zero Biome lint errors and clean Turbopack RSC static generation.
