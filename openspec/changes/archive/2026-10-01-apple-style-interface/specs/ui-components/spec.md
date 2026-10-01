# Spec Delta

## MODIFIED Requirements

### Requirement: Standardized Button Component
The system SHALL provide a reusable Button component implementing Apple-inspired tactile design and shadcn/ui visual styling, supporting variants (primary/default, secondary, danger/destructive, outline, ghost), size tokens (sm, md, lg), focus-visible ring outlines, disabled states, an animated loading spinner, and instant pointer-down scale feedback (`active:scale-[0.97]`) with smooth spring-like recovery.

#### Scenario: Button rendered with variant and size
- **WHEN** consumer renders `<Button variant="outline" size="sm">Action</Button>`
- **THEN** component applies outline border, subtle hover background, compact padding, and squircle corner radius

#### Scenario: Button in loading state disables user interactions
- **WHEN** consumer passes `isLoading={true}`
- **THEN** button disables interaction, shows an animated SVG spinner, suppresses active press scaling, and suppresses default click behavior

#### Scenario: Instant tactile response on button press
- **WHEN** user presses pointer-down on any active button
- **THEN** button immediately scales down smoothly (`scale(0.97)`) and rebounds naturally upon release

### Requirement: Standardized Input Component
The system SHALL provide an Input component following Apple/shadcn design standards with recessed background contrast, subtle borders, `focus-visible` focus ring styles with soft glow, label integration with positive tracking, and contextual helper and error messages.

#### Scenario: Input in error state
- **WHEN** consumer passes an `error="Email is required"` prop to Input
- **THEN** input displays a prominent rose border, focus ring in rose, and renders the error message beneath the input field

#### Scenario: Input focused with keyboard navigation
- **WHEN** user tabs onto the input field
- **THEN** input shows a 2px focus ring with high contrast and subtle ambient glow matching theme tokens without causing layout shift

### Requirement: Standardized Badge Component
The system SHALL provide a Badge component styled according to Apple/shadcn conventions with vibrant translucent pill background tints (`backdrop-blur-xs`), saturated text, and semantic variants (success, warning, danger, info, neutral, purple, indigo). The system SHALL also export a StatusBadge helper mapping room and property domain statuses to appropriate badge variants.

#### Scenario: StatusBadge renders domain status
- **WHEN** consumer renders `<StatusBadge status="AVAILABLE" />`
- **THEN** component displays a pill badge with emerald text and subtle vibrant emerald background tint

### Requirement: Standardized Modal/Dialog Component
The system SHALL provide an accessible Modal component following Apple/shadcn Dialog design patterns, featuring a floating squircle container (`rounded-2xl`), a high-blur darkened backdrop overlay (`backdrop-blur-xl`), accessible title and description slots, keyboard escape dismissal, and an accessible close button.

#### Scenario: Modal opened and dismissed
- **WHEN** `isOpen={true}` is set on Modal
- **THEN** modal animates into view with spring-like scale and fade over the high-blur dimmed backdrop, traps focus, and closes when the close icon button or backdrop is clicked

### Requirement: Standardized Select Component
The system SHALL provide a Select component following Apple/shadcn input styling with a custom chevron dropdown indicator, recessed background surface, supporting label with positive tracking, error state, and option list while preserving native HTML select accessibility and mobile friendliness.

#### Scenario: Select rendered with options and label
- **WHEN** consumer renders `<Select label="Property Type" options={types} />`
- **THEN** component displays an uppercase small label with positive letter spacing, styled select container, and custom down chevron icon
