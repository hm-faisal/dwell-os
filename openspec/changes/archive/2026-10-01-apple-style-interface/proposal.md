# Proposal

## Why

The current DwellOS interface relies on standard boxy web styling with flat borders, generic Arial/system fonts, and basic CSS transitions that lack tactile responsiveness and visual refinement. Translating Apple's design philosophy—chiefly from WWDC *Designing Fluid Interfaces* and *Principles of Great Design*—into the web application will transform DwellOS into an intuitive, responsive, and delightful tool where interactions feel like natural extensions of the user through instant pointer-down tactile feedback, translucent glass materials, optical typography, and fluid physics-informed motion.

## What Changes

- **Apple Typography & Optical Sizing**: Introduce an Apple-standard system typography hierarchy featuring dynamic optical sizing, size-specific tracking (negative tracking on display headers, positive tracking on micro-labels), and proportional line heights.
- **Translucent Materials & Depth Hierarchy**: Implement iOS/macOS-style floating headers, navigation bars, and overlays using multi-layered `backdrop-filter: blur(20px) saturate(180%)`, light-catching edge borders (`border-white/20`), and subtle depth hierarchy that lets underlying content gently shine through.
- **Tactile Response & Immediate Feedback**: Eliminate interaction latency by implementing instant active press responses (`scale(0.97)` on buttons, `scale(0.98)` on cards) triggered on pointer-down rather than release.
- **Core UI Component Refinements**:
  - `Button`: Apple-style spring press effect, rounded squircle corners, subtle inner sheen, and refined variant colorways.
  - `Input` & `Select`: Recessed background materials with soft contrast, crisp focus rings, and refined typography.
  - `Modal`: Floating dialog with squircle curvature (`rounded-2xl` / `rounded-3xl`), spring entrance/exit curves, darkened backdrop with high-blur scrim, and natural escape/outside dismissal.
  - `Badge`: Vibrant translucent pill backgrounds (`bg-opacity` with backdrop tinting) and refined status indicators.
- **Interactive Surfaces & Cards**: Apply smooth hover elevation, active press-down feel, and continuous feedback across dashboard property cards, room rows, stats modules, and action triggers.
- **Accessibility & Environmental Adaptations**: Full native support for `prefers-reduced-motion: reduce` (cross-fade fallbacks) and `prefers-reduced-transparency: reduce` (opaque, high-contrast structural surfaces).

## Capabilities

### New Capabilities
- `apple-design-system`: Establishes application-wide Apple design foundations including translucent glass materials, vibrancy, optical typography scales, tactile card motion tokens, and accessibility media queries.

### Modified Capabilities
- `ui-components`: Updates core components (`Button`, `Input`, `Badge`, `Modal`, `Select`) with tactile pointer-down response, squircle curvature, translucent surfaces, and spring-like transition dynamics.

## Impact

- **Global Styling**: Update `src/app/globals.css` with Apple design tokens, font hierarchy, glass material utility classes, and reduced-motion/reduced-transparency rules.
- **Root & Dashboard Layouts**: Update `src/app/layout.tsx` and `src/app/(dashboard)/layout.tsx` with floating translucent navigation, optical typography, and polished user menus.
- **Core Components**: Enhance `src/components/ui/` (`Button.tsx`, `Input.tsx`, `Modal.tsx`, `Select.tsx`, `Badge.tsx`) with Apple-style tactile feedback, squircles, and refined states while preserving 100% backward prop compatibility.
- **Pages & Cards**: Upgrade property catalog, property details, room cards, and authentication screens to incorporate fluid interactive card physics, vibrant status pills, and cohesive hierarchy.
- **Dependencies**: No external runtime animation dependencies required; all fluid motion, spring approximations, and materials are implemented via modern CSS, Tailwind CSS, and standard DOM pointer interactions.
