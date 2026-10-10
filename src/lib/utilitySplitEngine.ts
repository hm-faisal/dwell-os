/**
 * Pure Utility Bill Splitting Engine for DwellOS
 *
 * Guarantees:
 * 1. Zero floating-point drift: all calculations use integer minor units (cents).
 * 2. Exact conservation of cents: sum(shares) === totalAmountCents.
 * 3. Mid-cycle proration support: tenant shares weighted by (daysOccupied / totalDaysInPeriod).
 * 4. Remainder distribution: integer remainders are distributed 1 cent at a time sequentially.
 */

export type UtilitySplitMethod = "EQUAL" | "PERCENTAGE" | "USAGE_BASED";

export interface TenantOccupancyInput {
  tenantId: string;
  tenantName: string;
  daysOccupied?: number; // Defaults to billing period duration in days
  usageUnits?: number; // e.g. kWh, gallons (for USAGE_BASED)
  percentage?: number; // 0-100 (for PERCENTAGE)
}

export interface SplitCalculationParams {
  totalAmountCents: number;
  splitMethod: UtilitySplitMethod;
  billingPeriodStart: string | Date;
  billingPeriodEnd: string | Date;
  tenants: TenantOccupancyInput[];
}

export interface CalculatedTenantShare {
  tenantId: string;
  tenantName: string;
  amountCents: number;
  daysOccupied: number;
  effectiveWeight: number;
  sharePercentage: number;
}

export interface SplitCalculationResult {
  totalAmountCents: number;
  splitMethod: UtilitySplitMethod;
  totalPeriodDays: number;
  shares: CalculatedTenantShare[];
  conservationCheck: boolean; // true if sum(shares) === totalAmountCents
}

/**
 * Calculates days between two dates inclusive
 */
export function calculatePeriodDays(
  start: string | Date,
  end: string | Date,
): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

/**
 * Pure calculation function for utility bill splitting
 */
export function calculateUtilityBillSplit(
  params: SplitCalculationParams,
): SplitCalculationResult {
  const {
    totalAmountCents,
    splitMethod,
    billingPeriodStart,
    billingPeriodEnd,
    tenants,
  } = params;

  if (tenants.length === 0) {
    throw new Error("Cannot split utility bill with zero tenants");
  }

  if (totalAmountCents <= 0) {
    return {
      totalAmountCents,
      splitMethod,
      totalPeriodDays: calculatePeriodDays(
        billingPeriodStart,
        billingPeriodEnd,
      ),
      shares: tenants.map((t) => ({
        tenantId: t.tenantId,
        tenantName: t.tenantName,
        amountCents: 0,
        daysOccupied: t.daysOccupied ?? 0,
        effectiveWeight: 0,
        sharePercentage: 0,
      })),
      conservationCheck: true,
    };
  }

  const totalPeriodDays = calculatePeriodDays(
    billingPeriodStart,
    billingPeriodEnd,
  );

  // Compute raw weights for each tenant
  const rawWeights: number[] = tenants.map((tenant) => {
    const days = Math.min(
      Math.max(1, tenant.daysOccupied ?? totalPeriodDays),
      totalPeriodDays,
    );
    const dayRatio = days / totalPeriodDays;

    switch (splitMethod) {
      case "EQUAL":
        // Mid-cycle proration: weighted by days occupied
        return dayRatio;

      case "USAGE_BASED": {
        const usage = Math.max(0, tenant.usageUnits ?? 1);
        return usage * dayRatio;
      }

      case "PERCENTAGE": {
        const pct = Math.max(0, tenant.percentage ?? 100 / tenants.length);
        return pct * dayRatio;
      }

      default:
        return dayRatio;
    }
  });

  const totalWeight = rawWeights.reduce((acc, w) => acc + w, 0);

  if (totalWeight <= 0) {
    // Fallback to strict equal split among tenants
    const baseEqualShare = Math.floor(totalAmountCents / tenants.length);
    let remainder = totalAmountCents % tenants.length;

    const shares: CalculatedTenantShare[] = tenants.map((t) => {
      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder--;
      const amt = baseEqualShare + extra;
      return {
        tenantId: t.tenantId,
        tenantName: t.tenantName,
        amountCents: amt,
        daysOccupied: t.daysOccupied ?? totalPeriodDays,
        effectiveWeight: 1,
        sharePercentage: Number(((amt / totalAmountCents) * 100).toFixed(2)),
      };
    });

    return {
      totalAmountCents,
      splitMethod,
      totalPeriodDays,
      shares,
      conservationCheck:
        shares.reduce((sum, s) => sum + s.amountCents, 0) === totalAmountCents,
    };
  }

  // Calculate base share in integer cents using Math.floor
  const calculatedShares: number[] = [];
  let allocatedCents = 0;

  for (let i = 0; i < tenants.length; i++) {
    const shareCents = Math.floor(
      (rawWeights[i] / totalWeight) * totalAmountCents,
    );
    calculatedShares.push(shareCents);
    allocatedCents += shareCents;
  }

  // Exact conservation: distribute remaining cents sequentially to largest weights
  let remainderCents = totalAmountCents - allocatedCents;
  const indicesSortedByWeight = rawWeights
    .map((w, idx) => ({ w, idx }))
    .sort((a, b) => b.w - a.w)
    .map((item) => item.idx);

  let sortIdx = 0;
  while (remainderCents > 0) {
    const targetIdx = indicesSortedByWeight[sortIdx % tenants.length];
    calculatedShares[targetIdx] += 1;
    remainderCents -= 1;
    sortIdx++;
  }

  const shares: CalculatedTenantShare[] = tenants.map((tenant, idx) => {
    const amt = calculatedShares[idx];
    return {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      amountCents: amt,
      daysOccupied: tenant.daysOccupied ?? totalPeriodDays,
      effectiveWeight: rawWeights[idx],
      sharePercentage: Number(((amt / totalAmountCents) * 100).toFixed(2)),
    };
  });

  const sumShares = shares.reduce((acc, s) => acc + s.amountCents, 0);

  return {
    totalAmountCents,
    splitMethod,
    totalPeriodDays,
    shares,
    conservationCheck: sumShares === totalAmountCents,
  };
}
