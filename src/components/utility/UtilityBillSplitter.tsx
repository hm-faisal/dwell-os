"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { utilityBillsApi } from "@/lib/api";
import { dollarsToCents, formatCurrency } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import {
  calculateUtilityBillSplit,
  type SplitCalculationParams,
  type UtilitySplitMethod,
} from "@/lib/utilitySplitEngine";
import type { UtilityCategory } from "@/types/utility";

export interface UtilityBillSplitterProps {
  propertyId: string;
  tenants: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function UtilityBillSplitter({
  propertyId,
  tenants,
  onSuccess,
}: UtilityBillSplitterProps) {
  const [category, setCategory] = useState<UtilityCategory>("ELECTRICITY");
  const [amountDollars, setAmountDollars] = useState("");
  const [splitMethod, setSplitMethod] = useState<UtilitySplitMethod>("EQUAL");
  const [periodStart, setPeriodStart] = useState("2026-10-01");
  const [periodEnd, setPeriodEnd] = useState("2026-10-31");
  const [dueDate, setDueDate] = useState("2026-11-05");

  // Per-tenant customization (days occupied & usage units)
  const [tenantOverrides, setTenantOverrides] = useState<
    Record<
      string,
      { daysOccupied: number; usageUnits: number; percentage: number }
    >
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pure Calculation Engine evaluation
  const calculationResult = useMemo(() => {
    const totalCents = dollarsToCents(amountDollars || "0");
    if (totalCents <= 0 || tenants.length === 0) return null;

    const params: SplitCalculationParams = {
      totalAmountCents: totalCents,
      splitMethod,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
      tenants: tenants.map((t) => {
        const overrides = tenantOverrides[t.id];
        return {
          tenantId: t.id,
          tenantName: t.name,
          daysOccupied: overrides?.daysOccupied ?? 30,
          usageUnits: overrides?.usageUnits ?? 100,
          percentage: overrides?.percentage ?? 100 / tenants.length,
        };
      }),
    };

    return calculateUtilityBillSplit(params);
  }, [
    amountDollars,
    splitMethod,
    periodStart,
    periodEnd,
    tenants,
    tenantOverrides,
  ]);

  const updateTenantOverride = (
    tenantId: string,
    field: "daysOccupied" | "usageUnits" | "percentage",
    val: number,
  ) => {
    setTenantOverrides((prev) => ({
      ...prev,
      [tenantId]: {
        daysOccupied:
          field === "daysOccupied" ? val : (prev[tenantId]?.daysOccupied ?? 30),
        usageUnits:
          field === "usageUnits" ? val : (prev[tenantId]?.usageUnits ?? 100),
        percentage:
          field === "percentage"
            ? val
            : (prev[tenantId]?.percentage ?? 100 / tenants.length),
      },
    }));
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculationResult) {
      showToast.error("Please enter a valid bill amount");
      return;
    }

    try {
      setIsSubmitting(true);
      await utilityBillsApi.createBill(propertyId, {
        category,
        amount: calculationResult.totalAmountCents,
        billingPeriodStart: new Date(periodStart).toISOString(),
        billingPeriodEnd: new Date(periodEnd).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        splitMethod,
        customShares: calculationResult.shares.map((s) => ({
          tenantId: s.tenantId,
          amount: s.amountCents,
          daysOccupied: s.daysOccupied,
        })),
      });

      showToast.success(
        `Utility bill for ${category} split among ${calculationResult.shares.length} tenants!`,
        {
          description: "Shares have been posted to occupant rent portals.",
        },
      );
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to post utility bill";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="purple" size="sm">
            Deterministic Engine
          </Badge>
          <span className="text-xs text-zinc-500">
            Integer Minor Units (Cents) & Zero Float Drift
          </span>
        </div>
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
          Utility Bill Splitting & Mid-Cycle Proration
        </h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
          Split shared bills (electricity, water, internet) fairly based on
          occupancy days or individual usage with exact integer cents
          conservation.
        </p>
      </div>

      <form onSubmit={handleCreateBill} className="space-y-5">
        {/* Basic Bill Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label
              htmlFor="util-category"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Utility Category
            </label>
            <select
              id="util-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as UtilityCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50"
            >
              <option value="ELECTRICITY">⚡ Electricity</option>
              <option value="WATER">💧 Water</option>
              <option value="GAS">🔥 Gas</option>
              <option value="INTERNET">🌐 Internet</option>
              <option value="TRASH">🗑️ Trash</option>
              <option value="OTHER">📦 Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="util-amount"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Total Bill ($ Dollars)
            </label>
            <input
              id="util-amount"
              type="number"
              step="0.01"
              min="1"
              value={amountDollars}
              onChange={(e) => setAmountDollars(e.target.value)}
              placeholder="e.g. 150.00"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="util-split-method"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Split Formula
            </label>
            <select
              id="util-split-method"
              value={splitMethod}
              onChange={(e) =>
                setSplitMethod(e.target.value as UtilitySplitMethod)
              }
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50"
            >
              <option value="EQUAL">Equal Split (Prorated Days)</option>
              <option value="USAGE_BASED">Usage Weighted</option>
              <option value="PERCENTAGE">Custom Percentage</option>
            </select>
          </div>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label
              htmlFor="util-period-start"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Billing Period Start
            </label>
            <input
              id="util-period-start"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="util-period-end"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Billing Period End
            </label>
            <input
              id="util-period-end"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="util-due-date"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Payment Due Date
            </label>
            <input
              id="util-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10"
            />
          </div>
        </div>

        {/* Mid-cycle Proration Tenant Sliders */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Tenant Occupancy & Proration Parameters
          </h3>

          <div className="space-y-2">
            {tenants.map((t) => {
              const currentDays = tenantOverrides[t.id]?.daysOccupied ?? 30;
              const currentUsage = tenantOverrides[t.id]?.usageUnits ?? 100;
              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    {t.name}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">
                        Days Occupied:
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={currentDays}
                        onChange={(e) =>
                          updateTenantOverride(
                            t.id,
                            "daysOccupied",
                            Number.parseInt(e.target.value, 10) || 1,
                          )
                        }
                        className="w-16 px-2 py-1 rounded-lg text-xs bg-white dark:bg-zinc-700 border border-black/10 dark:border-white/10 text-center font-mono"
                      />
                    </div>

                    {splitMethod === "USAGE_BASED" && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-400">
                          Units:
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={currentUsage}
                          onChange={(e) =>
                            updateTenantOverride(
                              t.id,
                              "usageUnits",
                              Number.parseInt(e.target.value, 10) || 0,
                            )
                          }
                          className="w-16 px-2 py-1 rounded-lg text-xs bg-white dark:bg-zinc-700 border border-black/10 dark:border-white/10 text-center font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Calculation Result Preview */}
        {calculationResult && (
          <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Calculated Tenant Shares
              </span>
              {calculationResult.conservationCheck && (
                <Badge variant="success" size="sm">
                  ✓ 100% Exact Cents Conserved
                </Badge>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              {calculationResult.shares.map((s) => (
                <div
                  key={s.tenantId}
                  className="flex items-center justify-between text-zinc-600 dark:text-zinc-300 py-1 border-b border-black/5 dark:border-white/5 last:border-0"
                >
                  <span>
                    {s.tenantName} ({s.daysOccupied} days)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">
                      {s.sharePercentage}%
                    </span>
                    <strong className="font-mono text-zinc-950 dark:text-zinc-50">
                      {formatCurrency(s.amountCents)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!calculationResult}
            isLoading={isSubmitting}
          >
            Post & Request Split Payment
          </Button>
        </div>
      </form>
    </div>
  );
}
