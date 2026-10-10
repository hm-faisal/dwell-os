# utility-bill-splitting and Financial Ledger Specification

## Purpose

Provides a deterministic, integer-precision financial payment hub and shared utility bill splitting engine supporting equal division, usage weighting, and custom splits with mid-cycle occupancy day proration and exact cents conservation.

## OpenSpec Definition

```yaml
spec: financial-ledger-and-utility-splitting
type: feature
models:
  RentInvoice:
    fields:
      id: UUID
      leaseId: UUID
      amount: Integer (minor units / cents > 0)
      amountPaid: Integer (minor units / cents >= 0)
      lateFee: Integer (minor units / cents >= 0)
      status: Enum [DUE, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED]
      periodStart: ISO8601DateString
      periodEnd: ISO8601DateString
      dueDate: ISO8601DateString
      gracePeriodDays: Integer (default: 5)
      createdAt: ISO8601Timestamp
      updatedAt: ISO8601Timestamp

  BillShare:
    fields:
      id: UUID
      billId: UUID
      tenantId: UUID
      amount: Integer (minor units / cents > 0)
      daysOccupied: Integer (min: 1)
      totalBillingDays: Integer (default: 30)
      status: Enum [PENDING, PAID]
      paymentId: UUID (nullable)
      createdAt: ISO8601Timestamp
      updatedAt: ISO8601Timestamp

  UtilityBill:
    fields:
      id: UUID
      propertyId: UUID
      category: Enum [ELECTRICITY, WATER, GAS, INTERNET, TRASH, OTHER]
      amount: Integer (minor units / cents > 0)
      billingPeriodStart: ISO8601DateString
      billingPeriodEnd: ISO8601DateString
      dueDate: ISO8601DateString
      splitMethod: Enum [EQUAL, PERCENTAGE, USAGE_BASED]
      status: Enum [PENDING, PARTIALLY_PAID, SETTLED]
      proofUrl: URLString (optional)
      billShares: Array of BillShare
      createdAt: ISO8601Timestamp
      updatedAt: ISO8601Timestamp

  PaymentCheckout:
    fields:
      targetType: Enum [RENT_INVOICE, UTILITY_SHARE]
      targetId: UUID
      amountCents: Integer (cents > 0)
      paymentMethod: Enum [CREDIT_CARD, ACH, MOCK_STRIPE]
      idempotencyKey: UUID

rbac:
  rules:
    - role: TENANT
      actions: [VIEW_OWN_INVOICES, VIEW_OWN_BILL_SHARES, PAY_INVOICE, PAY_BILL_SHARE]
      constraints:
        - invoice.lease.tenantId == auth.user.id OR auth.user.id in invoice.lease.tenants
        - billShare.tenantId == auth.user.id
    - role: OWNER
      actions: [VIEW_PROPERTY_LEDGER, CREATE_UTILITY_BILL, RECORD_OFFLINE_PAYMENT, CANCEL_INVOICE]
      constraints:
        - targetProperty.ownerId == auth.user.id
    - role: PROPERTY_MANAGER
      actions: [VIEW_PROPERTY_LEDGER, CREATE_UTILITY_BILL, RECORD_OFFLINE_PAYMENT]
      constraints:
        - auth.user.hasPermission("MANAGE_FINANCES", targetProperty.id)

proration_algorithm:
  method: MidCycleOccupancyWeighting
  rules:
    - Each tenant's weight = daysOccupied / totalBillingDays
    - Raw share = Math.floor((totalAmountCents * weight) / sum(weights))
    - Remainder cents (totalAmountCents - sum(rawShares)) are distributed one cent at a time sorted by highest fractional remainder
    - Invariant: sum(billShares.amount) === totalAmountCents (Zero cents drift guarantee)
```

## Requirements

### Requirement: Deterministic Utility Bill Calculation
The system SHALL calculate tenant utility bill shares using pure functions with integer minor units (cents). The sum of all allocated tenant shares MUST equal the total bill amount (`sum(shares) === totalAmountCents`), with any integer division remainders distributed sequentially by weight one cent at a time.

#### Scenario: Equal bill split with indivisible cents
- **WHEN** a bill of $100.00 (10,000 cents) is split equally among 3 occupants
- **THEN** the system allocates shares of 3,334¢, 3,333¢, and 3,333¢, guaranteeing exact 10,000¢ conservation with zero floating point drift

#### Scenario: Mid-cycle tenant move-in proration
- **WHEN** a bill covering a 30-day period is calculated for a full-term occupant (30 days) and a mid-cycle arrival (15 days)
- **THEN** the system weights shares proportionally (2:1 ratio) so the mid-cycle tenant pays only for their active occupancy days

### Requirement: Combined Financial Ledger and Payment Checkout
The system SHALL provide a combined financial ledger displaying rent invoices and utility obligations, supporting instant payment checkout via secure payment element with idempotency protection.

#### Scenario: Tenant completes checkout for utility bill share
- **WHEN** a tenant completes checkout for their allocated bill share via payment checkout modal
- **THEN** the system marks the `BillShare` as `PAID`, recalculates overall bill status, updates to `SETTLED` if all shares are resolved, and generates an instant receipt reference
