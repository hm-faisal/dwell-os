# Tasks

## 1. Global Design Tokens & Typography Foundation

- [x] 1.1 Configure Apple system typography stack, optical sizing tokens, display leading, and size-specific tracking rules in `src/app/globals.css`; verify heading and body rendering across light and dark modes.
- [x] 1.2 Implement Apple spring easing curves (`--ease-spring-default`, `--ease-spring-snappy`, `--ease-spring-bounce`), glass material utilities (`.apple-glass`, `.apple-glass-heavy`), and light rim highlight classes in `src/app/globals.css`; verify utility definitions.
- [x] 1.3 Add `@media (prefers-reduced-motion: reduce)` cross-fade rules and `@media (prefers-reduced-transparency: reduce)` solid fallback styles in `src/app/globals.css`; verify accessibility override behavior.

## 2. Core UI Components Elevation

- [x] 2.1 Refactor `src/components/ui/Button.tsx` with zero-latency pointer-down tactile press (`active:scale-[0.97]`), squircle curvature (`rounded-xl`), spring transition timing, and subtle top-edge sheen; verify button states and loading spinner.
- [x] 2.2 Refactor `src/components/ui/Input.tsx` and `src/components/ui/Select.tsx` with recessed background styling, refined focus ring glow, uppercase tracked labels, and squircle borders; verify keyboard focus and error message presentation.
- [x] 2.3 Refactor `src/components/ui/Badge.tsx` with vibrant translucent pill background tints (`backdrop-blur-xs`), saturated semantic text colors, and squircle pill geometry; verify domain status badges.
- [x] 2.4 Refactor `src/components/ui/Modal.tsx` with floating squircle container (`rounded-2xl`), deep backdrop blur (`backdrop-blur-xl`), spring scale entrance/exit animations, and light rim highlight; verify escape key dismissal and focus trapping.

## 3. Layouts & Navigation Polish

- [x] 3.1 Upgrade `src/app/layout.tsx` root layout with Apple system font variables, high-density antialiasing, and Sonner toast styling coordination; verify root DOM structure and dark mode classes.
- [x] 3.2 Upgrade `src/app/(dashboard)/layout.tsx` top navigation bar with `.apple-glass-heavy` translucent material, saturated backdrop blur, light-catching bottom border, and tactile nav pill items; verify sticky scroll behavior and active link indicators.
- [x] 3.3 Upgrade `src/app/(auth)/layout.tsx` and auth cards (Login, Register, Verify Email) with floating glass containers, optical typography, and polished divider lines; verify layout responsiveness.

## 4. Dashboard & Domain Card Interactions

- [x] 4.1 Update property catalog and property card components in `src/app/(dashboard)/properties/page.tsx` with tactile card physics (`active:scale-[0.99]`, hover elevation lift, squircle corners, translucent tag overlays); verify card click and hover transitions.
- [x] 4.2 Update property detail view and room list in `src/app/(dashboard)/properties/[id]/page.tsx` with Apple-style stat cards, translucent action panels, and clean typographic grouping; verify modal triggers and manager assignment layout.
- [x] 4.3 Update property and room form pages (`properties/new`, `properties/[id]/edit`, `rooms/new`, `rooms/[roomId]/edit`) with polished section groupings, subtle recessed form cards, and tactile submission buttons; verify form layout consistency.

## 5. Verification & Lint Validation

- [x] 5.1 Run Biome linter (`bun run lint`) across all modified frontend files and fix any formatting or lint warnings; verify 0 errors and 0 warnings.
- [x] 5.2 Run Next.js production build (`bun run build`) with Turbopack to verify clean compilation, zero type mismatches, and perfect static page generation.
