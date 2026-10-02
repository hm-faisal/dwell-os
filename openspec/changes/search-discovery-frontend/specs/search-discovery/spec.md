# Spec Delta

## Purpose

Enables prospective tenants to discover, filter, and inspect available housing listings across locations, price bounds, move-in dates, amenities, and roommate occupancy contexts, as well as configure saved searches and automated alerts.

## ADDED Requirements

### Requirement: Multimodal Search by Location, Price, Room Type, Date, and Amenities
The system SHALL provide a search interface allowing tenants to query properties and rooms by location name or geographic radius/coordinates, price bounds, room type (`PRIVATE` or `SHARED`), requested move-in date, and amenity requirements.

#### Scenario: Searching by location and price range
- **WHEN** a tenant specifies a target location, a minimum price, and a maximum price
- **THEN** the system queries the backend search API and renders matching properties and rooms within the specified price constraints

#### Scenario: Filtering by amenities and room type
- **WHEN** a tenant selects one or more amenities (e.g., "High-Speed WiFi", "Air Conditioning") and chooses "Private Room"
- **THEN** the system updates the results to include only properties and rooms that satisfy all selected amenities and match the room type

### Requirement: Roommate-Based vs. Owner-Vacant Listing Segregation
The system SHALL provide explicit filtering allowing tenants to distinguish between roommate-based listings (open rooms in an already occupied unit where existing tenants or roommate voting apply) and owner-vacant listings (wholly vacant properties or owner-managed empty units).

#### Scenario: Tenant filters for roommate-based listings
- **WHEN** a tenant toggles the "Roommate Listings" filter
- **THEN** the system displays only listings where existing occupants or roommate voting requirements are active

#### Scenario: Tenant filters for owner-vacant listings
- **WHEN** a tenant toggles the "Owner-Vacant Listings" filter
- **THEN** the system displays only wholly unoccupied or owner-managed units with zero active occupant roommates

### Requirement: Strict Move-In Date Availability Enforcement
The system SHALL only display rooms whose availability status is `AVAILABLE` and whose `availableFrom` date is on or before the tenant's requested move-in date.

#### Scenario: Filter with future move-in date
- **WHEN** a tenant specifies a requested move-in date (e.g., next month)
- **THEN** search results exclude any rooms that are under maintenance, occupied past that date, or available only after that date

#### Scenario: Default view without move-in date
- **WHEN** no move-in date is specified
- **THEN** the system returns all currently available rooms with status `AVAILABLE`

### Requirement: Saved Searches and Automated Notification Alerts
The system SHALL allow authenticated tenants to save active search criteria under a personalized name, view and re-execute saved searches, delete saved searches, and enable automated alert notifications when new matching rooms become available.

#### Scenario: Saving current search criteria
- **WHEN** an authenticated tenant clicks "Save Search" on an active query
- **THEN** the system prompts for a custom search name, persists the filter criteria via the saved search API, and confirms with a success notification

#### Scenario: Managing and re-executing saved searches
- **WHEN** a tenant opens the saved searches panel
- **THEN** the system displays all saved searches with their active criteria, allowing the tenant to re-apply the filters in one click or delete the search

#### Scenario: Unauthenticated prompt for saved search
- **WHEN** an unauthenticated guest tenant attempts to save a search
- **THEN** the system prompts the tenant to sign in or create an account to activate saved search alerts
