# Proposal

## Why

Property and room creation/editing currently requires users to manually provide external image URLs (e.g., Unsplash or hosted image links). This creates significant friction and limits usability for real-world hosts and landlords who take photos directly on their devices. Adding direct photo upload capabilities alongside existing URL inputs allows users to upload local images seamlessly with instant preview, progress feedback, and storage on the cloud backend.

## What Changes

- Add backend upload endpoint support: confirm/expose `POST /api/v1/uploads` accepting multipart `file` and uploading to Cloudinary, returning the secure image URL.
- Implement an API upload client helper in the frontend (`uploadsApi.uploadImage(file)`).
- Create a reusable Apple-inspired `PhotoUploadField` component in the frontend supporting:
  - Drag-and-drop file upload zone with file type filtering (`image/jpeg`, `image/png`, `image/webp`).
  - File size validation and instant progress/loading spinner state.
  - Manual URL fallback toggle or concurrent URL addition input.
  - Thumbnail gallery with remove button, image preview, and order management.
- Integrate `PhotoUploadField` across all 4 form routes in place of manual URL inputs:
  - Property Create (`/properties/new`)
  - Property Edit (`/properties/[id]/edit`)
  - Room Create (`/properties/[id]/rooms/new`)
  - Room Edit (`/properties/[id]/rooms/[roomId]/edit`)
- Preserve full backward compatibility with existing array of photo URL strings in TanStack Form and Zod schemas.

## Capabilities

### New Capabilities
- `photo-upload`: Direct image file uploading via backend multipart API, drag-and-drop Apple-styled upload zone, upload progress feedback, and unified photo gallery management integrated with form states.

### Modified Capabilities
<!-- None: existing form-management and ui-components specifications remain valid without behavioral breaking changes. -->

## Impact

- **Backend**: Exposes `POST /api/v1/uploads` leveraging existing `multer` and `cloudinary` modules.
- **Frontend Core**: Adds `src/components/ui/PhotoUploadField.tsx` and `src/lib/api.ts` upload helper.
- **Frontend Pages**: Replaces plain text photo URL inputs in Property and Room Create/Edit forms with the new unified photo management field.
- **Dependencies**: Uses native `fetch` / `FormData`; no heavy third-party upload libraries required.
