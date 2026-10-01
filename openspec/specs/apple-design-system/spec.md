# apple-design-system Specification

## Purpose

Establishes Apple-grade visual design foundations across DwellOS, encompassing optical typography scaling, translucent glass materials with depth layering, tactile direct manipulation surfaces, and environmental accessibility adaptations.

## Requirements

### Requirement: Apple System Typography and Optical Sizing
The system SHALL adopt an Apple-inspired native typography scale based on platform system fonts (`system-ui`, `-apple-system`, `BlinkMacSystemFont`), applying optical sizing, size-specific letter spacing (negative tracking for large display headers, neutral tracking for body text, and positive tracking for small labels), and tight display leading.

#### Scenario: Display heading optical sizing and tracking
- **WHEN** user views a page header or hero title (text size 2xl or larger)
- **THEN** system applies negative tracking (-0.02em to -0.03em) and tight leading (1.05 to 1.15) for maximum visual density and typographic refinement

#### Scenario: Micro-label legibility enhancement
- **WHEN** user views small metadata, form field labels, or status captions (text size xs to sm)
- **THEN** system applies slightly positive tracking (+0.03em to +0.05em) and medium weight (500) to ensure legibility across all screen densities

### Requirement: Translucent Materials and Vibrancy Layering
The system SHALL style floating navigation headers, toolbars, sticky action panels, and modal backdrops using multi-layered translucent glass materials with `backdrop-filter: blur(20px) saturate(180%)`, subtle semi-transparent backgrounds, and light-catching top edge borders (`border-white/20` in dark mode, `border-black/5` in light mode) that allow scrolled content to pass underneath with depth separation.

#### Scenario: Sticky header translucency during page scroll
- **WHEN** user scrolls dashboard content beneath the sticky top navigation header
- **THEN** underlying content remains subtly visible through the saturated blur without compromising navigation contrast, text legibility, or interactive controls

#### Scenario: Scrim depth on modal display
- **WHEN** a modal or sheet is presented to the user
- **THEN** system overlays a progressive darkened backdrop scrim with high-density blur to focus attention on the foreground layer while preserving ambient context

### Requirement: Tactile Direct Manipulation and Card Interactions
The system SHALL render interactive cards, dashboard grid items, action rows, and actionable tiles with physical tactile responsiveness, initiating immediate active press scaling (`scale(0.98)`) on pointer-down and smooth elevation lift on hover using interruptible spring-like transition timing (`cubic-bezier(0.2, 0.8, 0.2, 1)`).

#### Scenario: Pointer-down feedback on dashboard property card
- **WHEN** user presses pointer-down on an interactive property card
- **THEN** card immediately applies active press scaling and shadow compression without waiting for pointer-up or click completion

#### Scenario: Reversible hover elevation on interactive surface
- **WHEN** user hovers pointer over a room list item or stat tile
- **THEN** item smoothly elevates with subtle border luminance and shadow depth, reversing along the exact same path upon pointer exit

### Requirement: Accessibility and Environmental Motion Accommodations
The system SHALL dynamically adapt animations, spring dynamics, and translucent materials according to user accessibility preferences, replacing physical spring translations with smooth opacity cross-fades when `prefers-reduced-motion: reduce` is detected and replacing translucent blurred backdrops with opaque, solid surfaces when `prefers-reduced-transparency: reduce` is enabled.

#### Scenario: Reduced motion preference active
- **WHEN** user has enabled reduced motion in operating system settings
- **THEN** system disables scale presses, modal zoom spring curves, and slide translations, falling back to instant or subtle opacity cross-fades

#### Scenario: Reduced transparency preference active
- **WHEN** user has enabled reduced transparency in operating system settings
- **THEN** navigation headers and modal overlays switch from translucent blur layers to solid, high-contrast background surfaces
