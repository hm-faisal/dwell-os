# Tasks

## 1. Backend Upload Endpoint

- [x] 1.1 Expose `POST /api/v1/uploads` in `backend/src/routes/index.ts` (via `backend/src/modules/uploads/uploads.routes.ts`) with `authenticate` and `uploadAndCloudinarySingle('file', { folder: 'dwellos/photos' })` returning `{ data: { url: req.fileUrl }, error: null }`
- [x] 1.2 Verify the backend upload route with an automated curl or test script confirming image upload returns a valid Cloudinary image URL and 201 status code

## 2. Frontend Upload API Client

- [x] 2.1 Add `uploadsApi` in `src/lib/api.ts` implementing `upload(file: File): Promise<{ url: string }>` using `multipart/form-data` with credentials and error handling
- [x] 2.2 Verify `uploadsApi.upload` propagates backend errors and parses JSON response into `{ url: string }`

## 3. Reusable Apple-styled PhotoUploadField Component

- [x] 3.1 Create `src/components/ui/PhotoUploadField.tsx` with drag-and-drop dropzone, file input trigger, loading/progress spinner, manual URL input fallback, and thumbnail preview grid
- [x] 3.2 Add client-side validation in `PhotoUploadField` for image MIME types (`image/jpeg`, `image/png`, `image/webp`) and 10MB file size limit with toast notifications
- [x] 3.3 Verify interactive states, hover transitions, and thumbnail removal functionality

## 4. Integrate PhotoUploadField in Property Forms

- [x] 4.1 Replace manual photo inputs in Property Create (`src/app/(dashboard)/properties/new/page.tsx`) with `PhotoUploadField` wired to TanStack Form's `photos` field
- [x] 4.2 Replace manual photo inputs in Property Edit (`src/app/(dashboard)/properties/[id]/edit/page.tsx`) with `PhotoUploadField` ensuring pre-existing property photos are preserved
- [x] 4.3 Verify property creation and edit flows with both uploaded photos and manual image URLs

## 5. Integrate PhotoUploadField in Room Forms

- [x] 5.1 Replace manual photo inputs in Room Create (`src/app/(dashboard)/properties/[id]/rooms/new/page.tsx`) with `PhotoUploadField` wired to TanStack Form's `photos` field
- [x] 5.2 Replace manual photo inputs in Room Edit (`src/app/(dashboard)/properties/[id]/rooms/[roomId]/edit/page.tsx`) with `PhotoUploadField` ensuring pre-existing room photos are preserved
- [x] 5.3 Verify room creation and edit flows with both uploaded photos and manual image URLs

## 6. Verification & Quality Assurance

- [x] 6.1 Run `bun run lint` to verify 0 Biome linter errors or warnings across all modified and newly created files
- [x] 6.2 Run `bun run build` to verify clean Next.js Turbopack compilation and strict TypeScript type checking
