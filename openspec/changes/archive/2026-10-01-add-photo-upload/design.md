# Design

## Context

Frontend property and room forms currently manage photos as an array of string URLs (`photos: string[]`) managed via TanStack Form. Users can only input photos by manually typing or pasting external URLs.
The backend (Express at `http://localhost:5000/api/v1`) already possesses Cloudinary integration and Multer middlewares (`uploadAndCloudinarySingle` in `backend/src/middlewares/multer.middleware.ts`), but lacks an exposed generic upload route in its API router.

See `proposal.md` for motivation and `specs/photo-upload/spec.md` for behavioral requirements.

## Goals / Non-Goals

**Goals:**
- Expose an authenticated `POST /api/v1/uploads` endpoint in the backend utilizing existing `uploadAndCloudinarySingle` middleware to upload image files to Cloudinary and return `{ data: { url: string } }`.
- Provide an API client method `uploadsApi.upload(file: File)` in `frontend/src/lib/api.ts`.
- Build an Apple-styled, accessible `PhotoUploadField` component in `frontend/src/components/ui/PhotoUploadField.tsx` featuring drag-and-drop, file dialog selection, upload progress indicator, manual URL input, and thumbnail preview grid with deletion.
- Replace manual photo inputs across all 4 form routes: Property Create (`/properties/new`), Property Edit (`/properties/[id]/edit`), Room Create (`/properties/[id]/rooms/new`), and Room Edit (`/properties/[id]/rooms/[roomId]/edit`).

**Non-Goals:**
- Heavy client-side image editing, cropping, or canvas transformation.
- Modifying database schemas or database entities (all tables already store `photos: string[]`).
- Non-image uploads (documents/PDFs belong to the separate document signing module).

## Decisions

### 1. Immediate File Upload vs. Deferred Multipart Submission
- **Decision:** Upload files to the backend immediately upon drop/selection, then store the returned secure URL in TanStack Form's `photos` array.
- **Rationale:**
  - Decouples file transport from entity creation/update logic.
  - Keeps form submission payloads lightweight JSON (`UpdatePropertyDTO`, `UpdateRoomDTO`, `CreatePropertyDTO`, `CreateRoomDTO`).
  - Allows instant upload feedback, progress animations, and thumbnail previews before the user submits the parent form.
  - Prevents race conditions with optimistic concurrency versioning (`expectedVersion`).
- **Alternatives Considered:**
  - Bundling File objects into the entity form submit: Rejected because it requires transforming all JSON API endpoints to multipart/form-data, breaking existing typing and validation pipelines.

### 2. Backend Upload Route Architecture
- **Decision:** Expose `POST /api/v1/uploads` in `backend/src/routes/index.ts` (or `backend/src/modules/uploads/uploads.routes.ts`) secured with `authenticate`.
- **Implementation:**
  - Route uses `uploadAndCloudinarySingle('file', { folder: 'dwellos/photos' })`.
  - Controller responds with `res.status(201).json({ data: { url: req.fileUrl }, error: null })`.
- **Alternatives Considered:**
  - Direct client-to-Cloudinary upload via unsigned upload presets: Rejected because exposing Cloudinary cloud names and upload presets in client bundles can lead to abuse, whereas routing through the backend guarantees session authentication.

### 3. Component Architecture: `PhotoUploadField`
- **Decision:** Build a controlled component accepting:
  ```typescript
  interface PhotoUploadFieldProps {
    value: string[];
    onChange: (photos: string[]) => void;
    maxPhotos?: number;
    disabled?: boolean;
    label?: string;
    helperText?: string;
  }
  ```
- **Rationale:** Keeps the component cleanly decoupled from TanStack Form internals so it can be passed into `form.Field` seamlessly or used standalone.
- **Apple Design Integration:**
  - Subtle dotted dropzone with `apple-card` glassmorphism background (`bg-zinc-50/70 dark:bg-zinc-900/50`).
  - Active drag-over state with spring scale highlight.
  - Squircle thumbnail cards with smooth hover overlay and tactile remove button.
  - Inline progress bar or spinner during active upload.

### 4. Hybrid Upload & URL Fallback
- **Decision:** Co-locate a collapsible or secondary "Add via URL" input beside the upload dropzone.
- **Rationale:** Ensures hosts who maintain assets on Unsplash or external CDNs can continue pasting links without regression.

## Risks / Trade-offs

- **[Risk]** Upload failure due to unconfigured Cloudinary credentials in local dev environments.
  - **Mitigation:** Backend validates Cloudinary status and returns a descriptive error; frontend toasts the error clearly while keeping the manual URL input available as a reliable fallback.
- **[Risk]** Large image files causing long upload latency or mobile timeouts.
  - **Mitigation:** Enforce client-side size cap (10MB) before triggering fetch; show an interactive upload indicator to keep users informed.
- **[Risk]** Abandoned uploads (uploaded files when user cancels form).
  - **Mitigation:** Acceptable standard tradeoff for Cloudinary asset storage; unreferenced images can be cleaned up via background retention jobs if needed.
