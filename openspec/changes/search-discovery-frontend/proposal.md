# Proposal

## Why

While DwellOS provides landlords and property managers with tools to manage listings and rooms, prospective tenants currently lack a public discovery interface to find and filter suitable housing. To drive tenant adoption and lease conversions, DwellOS requires a high-performance, Apple-designed Search & Discovery experience that allows tenants to search listings across locations, price bounds, move-in dates, room types, amenities, and roommate occupancy contexts, as well as save custom searches with automated notifications.

## What Changes

- **Search & Discovery Interface (`/explore`)**:
  - Implement a tenant-facing search page with map/radius view, interactive filtering drawer/bar, and listing cards.
  - Location filtering with radius and map coordinate bounding.
  - Multi-criteria filter controls: monthly price range slider/inputs (in dollars, mapped to cents), room type (`PRIVATE`, `SHARED`), move-in date picker, and amenity chips.
- **Listing Type Filtering (FR-2.2)**:
  - Add quick-filter toggles distinguishing "Roommate Listings" (open rooms in occupied units with existing tenants/roommate voting) from "Owner-Vacant Listings" (wholly vacant properties/units).
- **Date-Based Availability Filtering (FR-2.3)**:
  - Ensure search results strictly filter and display rooms with `status: "AVAILABLE"` whose `availableFrom` date is on or before the requested move-in date.
- **Saved Searches & Alerts (FR-2.4)**:
  - Add "Save This Search" modal allowing authenticated tenants to name and save custom criteria.
  - Implement a "Saved Searches" drawer/management panel allowing tenants to inspect, re-apply, delete, and manage alert notifications for their saved criteria.
- **Navigation Integration**:
  - Add "Explore" link to [`DashboardNavbar`](file:///home/hm/Workshops/programming_hero/DwellOS/frontend/src/components/dashboard/DashboardNavbar.tsx) and landing page hero CTA.

## Capabilities

### New Capabilities
- `search-discovery`: Multimodal search queries (location, radius/map, price, date, amenities), roommate vs. owner-vacant filtering, move-in date availability enforcement, and saved search management with alerts.

### Modified Capabilities
<!-- None: existing property/room management and auth capabilities remain unmodified -->

## Impact

- **Frontend Routes**: Adds `src/app/(dashboard)/explore/page.tsx` and supporting modular components in `src/components/search/`.
- **API Integration**: Adds search and saved-search endpoints in `src/lib/api.ts` (`searchApi.searchProperties`, `searchApi.createSavedSearch`, `searchApi.getSavedSearches`, `searchApi.deleteSavedSearch`).
- **Types & Schemas**: Adds `src/types/search.ts` and `src/lib/validations/search.ts` for search query parameters and saved search inputs.
