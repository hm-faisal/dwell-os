# DwellOS Frontend

DwellOS is a web application for modern housing, co-living, and roommate management. It provides end-to-end workflows for prospective tenants, current roommates, and property owners to discover listings, apply for rooms, vote on co-applicants, sign digital leases, and settle recurring rent and shared utility bills.

Built with Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Form, and Zod.

---

## Core Capabilities

### Search and Discovery
- Multimodal search across properties by location, price bounds, room categories, furnishing status, and move-in availability dates.
- Interactive coordinate-based map preview with search radius indicators and quick listing peek modals.
- Filter toggle between roommate co-living units and vacant apartments.
- Saved search criteria with alert status tracking.

### Property and Room Inventory Management
- Comprehensive property registration with amenities, geo-coordinates, and cloud media attachments.
- Granular room-level configuration: private rooms, shared rooms, master suites, security deposits, and minimum lease durations.
- Live room capacity indicators tracking occupied slots against maximum allowable tenants.

### Tenant Room Application Flow
- Four-step application wizard collecting personal background, stay preferences, employment income, landlord references, and document uploads.
- Reservation hold countdown ticker enforcing priority evaluation windows with automatic release handling upon expiration.
- Idempotent application submission preventing duplicate records and race conditions.

### Explainable Roommate Matching
- Structured lifestyle profiling across sleep schedule, work routine, cleanliness expectations, smoking habits, and social preferences.
- Explainable compatibility scoring displaying point breakdowns across budget overlap, schedule sync, and lifestyle synergy.
- Co-approval voting workflow enabling active roommates in shared units to review applicant profiles and record endorsement decisions.

### Financial Payment Hub and Utility Splitting
- Unified ledger displaying recurring rent invoices and itemized utility bill obligations.
- Utility bill splitting engine supporting equal division, metered usage, and mid-cycle move-in proration based on active residency days.
- Integer minor-unit (cents) accounting guaranteeing exact balance conservation with zero penny drift.
- Secure payment checkout modal simulating tokenized card processing with instant receipt confirmation.

### Lease Management and Signatures
- Structured lease detail viewer detailing terms, monthly rent, deposits, and billing cadences.
- HTML5 canvas digital countersigning interface with audit timestamps.

### Maintenance Ticketing
- Maintenance request intake with severity levels, category classification, and room associations.
- Kanban triage board enabling landlords to advance tickets from submitted to in-progress and resolved states.

---

## Tech Stack

- Framework: Next.js (App Router, Turbopack)
- Language: TypeScript (Strict mode enabled)
- Styling: Tailwind CSS, Apple design tokens, CSS variables
- State and Forms: TanStack Form, custom React hooks
- Schema Validation: Zod
- Tooling: Biome (linting and code formatting), Bun test runner

---

## Project Structure

```text
src/
├── app/
│   ├── (auth)/             Authentication routes (login, register, email verification)
│   ├── (dashboard)/
│   │   ├── applications/   Rental application submission and review routes
│   │   ├── explore/        Search and discovery explore page
│   │   ├── finance/        Financial payment hub and ledger
│   │   ├── properties/     Property catalog and room inventory management
│   │   └── roommates/      Roommate matching and co-approval voting
│   ├── globals.css         Global design tokens, Apple glass utility styles
│   └── layout.tsx          Root layout configuration
├── components/
│   ├── admin/              Platform administration console
│   ├── applications/       Application forms, Kanban boards, and decision modals
│   ├── auth/               Login, registration, and email verification cards
│   ├── dashboard/          Dashboard navigation and portfolio overview
│   ├── finance/            Financial ledger dashboard and payment modal
│   ├── landing/            Marketing landing page sections
│   ├── leases/             Lease viewer and digital signature canvas
│   ├── maintenance/        Ticket submission modal and Kanban board
│   ├── roommates/          Compatibility breakdown, match cards, and profile forms
│   ├── search/             Search filters, listing cards, and map radius views
│   └── ui/                 Atomic design primitives (Buttons, Badges, Modals, Inputs)
├── hooks/                  Custom state management hooks (useFinancialLedger, useRoomApplication)
├── lib/                    API client, formatting helpers, and utility split calculation engine
├── types/                  Domain TypeScript interfaces and models
└── lib/validations/        Strict Zod payload and entity validation schemas
```

---

## Getting Started

### Prerequisites

Ensure you have one of the following package managers installed:
- Bun (recommended)
- Node.js (18.17 or higher) and pnpm / npm

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:hm-faisal/dwell-os.git
   cd dwell-os
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

The application reads client-accessible environment variables prefixed with `NEXT_PUBLIC_`. Refer to `.env.example` for reference.

| Variable | Description | Default (Local) |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL for the backend REST API | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Base URL for the frontend application | `http://localhost:3000` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for client checkout elements | `pk_test_placeholder` |

---

## Available Scripts

- `bun run dev` - Starts the development server with Turbopack.
- `bun run build` - Creates an optimized production build.
- `bun run start` - Runs the built production application.
- `bun test` - Executes unit test suites (split engine, formatters).
- `bun x @biomejs/biome check src/` - Runs Biome linter and formatter validation.
- `bun x tsc --noEmit` - Runs TypeScript static type checking without emitting files.

---

## Code Quality Standards

- TypeScript: Full strict typing with no implicit any types.
- Linting and Formatting: Biome is enforced across all source files for consistent syntax and import sorting.
- Precision: Financial calculations must use integer minor units (cents) to eliminate floating-point arithmetic drift.
