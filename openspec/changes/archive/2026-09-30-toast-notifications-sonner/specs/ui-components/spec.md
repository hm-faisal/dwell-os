# Spec Delta

## Purpose

Establishes a cohesive, accessible shadcn/ui design pattern for core global components (Button, Input, Badge, Modal, and Select) with unified Tailwind styling, focus-visible states, and backward-compatible props.

## ADDED Requirements

### Requirement: Standardized Button Component
The system SHALL provide a reusable Button component implementing shadcn/ui visual styling, supporting variants (primary/default, secondary, danger/destructive, outline, ghost), size tokens (sm, md, lg), focus-visible ring outlines, disabled states, and an animated loading spinner.

#### Scenario: Button rendered with variant and size
- **WHEN** consumer renders `<Button variant="outline" size="sm">Action</Button>`
- **THEN** component applies outline border, subtle hover background, and compact padding

#### Scenario: Button in loading state disables user interactions
- **WHEN** consumer passes `isLoading={true}`
- **THEN** button disables interaction, shows an animated SVG spinner, and suppresses default click behavior

### Requirement: Standardized Input Component
The system SHALL provide an Input component following shadcn/ui design standards with subtle borders (`border-input`), dark mode background contrast, `focus-visible` focus ring styles, label integration, and contextual helper and error messages.

#### Scenario: Input in error state
- **WHEN** consumer passes an `error="Email is required"` prop to Input
- **THEN** input displays a prominent rose border, focus ring in rose, and renders the error message beneath the input field

#### Scenario: Input focused with keyboard navigation
- **WHEN** user tabs onto the input field
- **THEN** input shows a 2px focus ring with high contrast matching theme tokens without causing layout shift

### Requirement: Standardized Badge Component
The system SHALL provide a Badge component styled according to shadcn/ui conventions with subtle pill background tints and semantic variants (success, warning, danger, info, neutral, purple, indigo). The system SHALL also export a StatusBadge helper mapping room and property domain statuses to appropriate badge variants.

#### Scenario: StatusBadge renders domain status
- **WHEN** consumer renders `<StatusBadge status="AVAILABLE" />`
- **THEN** component displays a pill badge with emerald text and subtle emerald background tint

### Requirement: Standardized Modal/Dialog Component
The system SHALL provide an accessible Modal component following shadcn/ui Dialog design patterns, featuring a darkened backdrop overlay (`backdrop-blur-sm`), centered card container with subtle border, accessible title and description slots, keyboard escape dismissal, and an accessible close button.

#### Scenario: Modal opened and dismissed
- **WHEN** `isOpen={true}` is set on Modal
- **THEN** modal animates into view over the dimmed backdrop, traps focus, and closes when the close icon button is clicked

### Requirement: Standardized Select Component
The system SHALL provide a Select component following shadcn/ui input styling with a custom chevron dropdown indicator, supporting label, error state, and option list while preserving native HTML select accessibility and mobile friendliness.

#### Scenario: Select rendered with options and label
- **WHEN** consumer renders `<Select label="Property Type" options={types} />`
- **THEN** component displays an uppercase small label, styled select container, and custom down chevron icon
