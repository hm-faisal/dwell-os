import { describe, expect, it } from "vitest";
import { calculateUtilityBillSplit } from "../utilitySplitEngine";

describe("Utility Bill Splitting Engine", () => {
  it("calculates exact integer cents and conserves sum without drift", () => {
    // $100.00 split among 3 tenants (10000 cents) -> 3334, 3333, 3333
    const result = calculateUtilityBillSplit({
      totalAmountCents: 10000,
      splitMethod: "EQUAL",
      billingPeriodStart: "2026-10-01",
      billingPeriodEnd: "2026-10-31",
      tenants: [
        { tenantId: "t1", tenantName: "Alice" },
        { tenantId: "t2", tenantName: "Bob" },
        { tenantId: "t3", tenantName: "Charlie" },
      ],
    });

    expect(result.conservationCheck).toBe(true);
    const totalAllocated = result.shares.reduce(
      (sum, s) => sum + s.amountCents,
      0,
    );
    expect(totalAllocated).toBe(10000);
    expect(result.shares[0].amountCents).toBe(3334);
    expect(result.shares[1].amountCents).toBe(3333);
    expect(result.shares[2].amountCents).toBe(3333);
  });

  it("handles mid-cycle proration based on occupancy days", () => {
    // Period is 30 days.
    // Tenant 1 stayed 30 days, Tenant 2 moved in mid-cycle and stayed 15 days.
    const result = calculateUtilityBillSplit({
      totalAmountCents: 15000, // $150.00
      splitMethod: "EQUAL",
      billingPeriodStart: "2026-10-01",
      billingPeriodEnd: "2026-10-30",
      tenants: [
        { tenantId: "t1", tenantName: "Full Stay", daysOccupied: 30 },
        { tenantId: "t2", tenantName: "Half Stay", daysOccupied: 15 },
      ],
    });

    expect(result.conservationCheck).toBe(true);
    // Weight: 30/30 (1.0) vs 15/30 (0.5). Ratio: 2:1 -> $100 vs $50 -> 10000 cents vs 5000 cents
    expect(result.shares[0].amountCents).toBe(10000);
    expect(result.shares[1].amountCents).toBe(5000);
  });

  it("handles usage-based splitting with proration", () => {
    const result = calculateUtilityBillSplit({
      totalAmountCents: 10000,
      splitMethod: "USAGE_BASED",
      billingPeriodStart: "2026-10-01",
      billingPeriodEnd: "2026-10-31",
      tenants: [
        {
          tenantId: "t1",
          tenantName: "Heavy User",
          usageUnits: 300,
          daysOccupied: 30,
        },
        {
          tenantId: "t2",
          tenantName: "Light User",
          usageUnits: 100,
          daysOccupied: 30,
        },
      ],
    });

    expect(result.conservationCheck).toBe(true);
    expect(result.shares[0].amountCents).toBe(7500);
    expect(result.shares[1].amountCents).toBe(2500);
  });
});
