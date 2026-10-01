# photo-upload Specification

## Purpose

Provides direct photo file uploading and integrated gallery management across property and room forms, allowing landlords and managers to upload image files to cloud storage or input manual URLs.

## Requirements

### Requirement: Direct Image File Upload
The system SHALL provide a photo upload service that uploads local image files to the backend upload endpoint (`POST /api/v1/uploads`) using `multipart/form-data` and returns a secure Cloudinary image URL. The system SHALL enforce client-side validation for accepted image MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and enforce a maximum file size limit of 10MB per file.

#### Scenario: Successful photo upload
- **WHEN** the user selects or drops a valid image file (JPEG, PNG, or WebP) under 10MB
- **THEN** the system uploads the file, displays an inline upload spinner with tactile feedback, and appends the returned secure image URL to the form photos array upon completion

#### Scenario: File exceeds maximum allowed size
- **WHEN** the user attempts to upload an image exceeding 10MB
- **THEN** the system rejects the file before sending network requests and presents an informative validation toast message indicating the size limit

#### Scenario: Unsupported file type rejected
- **WHEN** the user selects or drops a non-image file (such as a PDF or text document)
- **THEN** the system rejects the file and displays an error message stating that only image files are supported

### Requirement: Unified Photo Management Component
The system SHALL provide an Apple-styled `PhotoUploadField` component that provides a drag-and-drop dropzone, a file browser trigger button, an expandable manual URL input fallback, and a visual thumbnail grid with individual removal actions.

#### Scenario: Adding photo via manual URL input
- **WHEN** the user inputs an external image URL and triggers the add button
- **THEN** the system validates that the URL is non-empty and appends it directly to the active photos array

#### Scenario: Removing an existing photo
- **WHEN** the user clicks the remove button on any photo thumbnail
- **THEN** the system removes that image URL from the photos array and updates the thumbnail grid immediately

#### Scenario: Network upload failure recovery
- **WHEN** the backend returns an error or the upload network request fails
- **THEN** the system halts the upload spinner, preserves previously uploaded photos intact, and presents an error notification explaining the failure

### Requirement: Form Integration Across Property and Room Routes
The system SHALL integrate `PhotoUploadField` across all property and room creation and editing pages, seamlessly synchronizing state with TanStack Form's `photos` array field.

#### Scenario: Property creation with mixed uploaded and manual photos
- **WHEN** a landlord uploads image files and adds manual image URLs in `/properties/new` and submits the form
- **THEN** TanStack Form submits all photo URLs in the `photos` array within the `CreatePropertyDTO` payload

#### Scenario: Room editing preserving existing photos and appending uploads
- **WHEN** a manager edits a room at `/properties/[id]/rooms/[roomId]/edit`, uploads a new photo, and clicks Save Room Changes
- **THEN** the updated room payload retains all previous photos along with the newly uploaded photo URL and persists them to the backend
