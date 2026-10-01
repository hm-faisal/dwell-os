# Design

## Context

DwellOS is a property and room management frontend built with Next.js 16 (App Router, Turbopack), React 19, and Tailwind CSS. The existing UI uses standard rectangular cards, standard borders, generic system fonts (`Arial, Helvetica`), and flat transitions.

Applying Apple's design philosophy—distilled from WWDC sessions including *Designing Fluid Interfaces*, *Principles of Great Design*, and *The Details of UI Typography*—requires translating physical spring motion, translucent materials (vibrancy/depth), optical typography, and direct manipulation into web-native constructs without introducing heavy runtime dependencies or breaking existing component contracts.

## Goals / Non-Goals

**Goals:**
- **Zero-Latency Tactile Response**: Implement instantaneous pointer-down feedback (`active:scale-[0.97]` on buttons, `active:scale-[0.98]` on interactive cards) with natural rebound.
- **Translucent Depth & Vibrancy**: Establish a multi-layer material system using `backdrop-filter: blur(20px) saturate(180%)`, subtle rim lighting borders, and progressive dimming scrims.
- **Apple Typography Foundations**: Provide a native system typography stack with optical sizing, size-tuned letter tracking (negative tracking on headers, positive on micro-labels), and proportional line heights.
- **Cohesive Squircle Geometry**: Upgrade boxy corners across cards, modals, buttons, and inputs to organic squircle curvature (`rounded-xl`, `rounded-2xl`, `rounded-3xl`).
- **Environmental Accessibility**: Support `prefers-reduced-motion: reduce` (cross-fades without physical movement) and `prefers-reduced-transparency: reduce` (solid, high-contrast structural layers).

**Non-Goals:**
- Adding large external JavaScript animation bundles (e.g. heavy Framer Motion or physics engines). All interactions, spring approximations, and materials are achieved with CSS variables, Tailwind classes, and native pointer handlers for optimal 120fps display refresh rates.
- Altering backend API contracts, TanStack Form schemas, or data mutation pipelines.
- Skeuomorphic textures or heavy non-Apple ornaments.

## Decisions

### Decision 1: Pure CSS Spring Timing Curves & Design Tokens
- **Choice**: Implement Apple-standard critically damped spring responses via CSS cubic-bezier curves in `globals.css`:
  - `--ease-spring-default`: `cubic-bezier(0.2, 0.8, 0.2, 1)` (Apple's canonical response for drawers, menus, and views)
  - `--ease-spring-snappy`: `cubic-bezier(0.16, 1, 0.3, 1)` (instant snap for hover/active states)
  - `--ease-spring-bounce`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (slight bounce for momentum/flick interactions)
- **Rationale**: CSS hardware-accelerated transforms run completely on the compositor thread, preventing frame drops during concurrent React renders or API requests.
- **Alternatives Considered**: JS-based physics engines (`framer-motion`, `motion/react`). Rejected to avoid bundle size increases and ensure compatibility with React 19 server/client boundaries.

### Decision 2: Glass Material & Depth System
- **Choice**: Create modular Tailwind utility classes for translucent chrome:
  - `.apple-glass`: `bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl saturate-180 border border-white/20 dark:border-white/10 shadow-sm`
  - `.apple-glass-heavy`: `bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl saturate-180 border-b border-zinc-200/50 dark:border-zinc-800/50`
  - `.apple-rim-highlight`: `border-t border-white/30 dark:border-white/10` (simulates ambient light catching the upper bevel of glass)
- **Rationale**: Matches Apple's material hierarchy where structural chrome (navbars, sidebars) is heavier and floating sheets/dialogs have deeper blur and light rims.
- **Alternatives Considered**: Fully opaque bars or pure CSS gradients without backdrop-blur. Rejected as they eliminate depth layering.

### Decision 3: Typography & Optical Sizing
- **Choice**: Configure system font stack priority:
  - `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif`
  - Display headers (2xl+): `tracking-[-0.025em] leading-[1.1] font-semibold`
  - Section titles (lg-xl): `tracking-[-0.015em] leading-[1.25] font-semibold`
  - Body text (base): `tracking-[0] leading-[1.5] font-normal`
  - Metadata / labels (xs-sm): `tracking-[0.035em] font-medium uppercase`
- **Rationale**: Replicates Apple's San Francisco optical typography rules where glyph spacing tightens as size scales up, preventing sprawling headers.

### Decision 4: Interactive Card & Button Tactility
- **Choice**:
  - `Button`: `active:scale-[0.97] transition-all duration-150 ease-[var(--ease-spring-snappy)]`, subtle inner border highlight, squircle radius (`rounded-xl` for standard buttons).
  - Cards: `hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] transition-all duration-200 ease-[var(--ease-spring-default)]`, `rounded-2xl` borders with subtle hover glow.
- **Rationale**: Immediate response on pointer-down satisfies Apple's first principle: "Respond on pointer-down, not on release."

### Decision 5: Accessible Fallbacks
- **Choice**:
  - In `globals.css`:
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    @media (prefers-reduced-transparency: reduce) {
      .apple-glass, .apple-glass-heavy {
        backdrop-filter: none !important;
        background-color: var(--color-background) !important;
      }
    }
    ```
- **Rationale**: Guarantees compliance with accessibility guidelines for vestibular disorders and visual clarity.

## Risks / Trade-offs

- **[Performance on low-power devices with heavy backdrop blur]** → Use `backdrop-blur-xl` on top-level fixed chrome only; avoid nesting multiple blurred elements inside each other.
- **[Font rendering across non-Apple operating systems (Linux/Windows)]** → Fall back cleanly to `system-ui` and `sans-serif` while retaining calibrated tracking, leading, and font-weight ratios.
- **[Prop compatibility on UI components]** → Maintain 100% backward-compatible props on `ButtonProps`, `InputProps`, `ModalProps`, `SelectProps`, and `BadgeProps`.
