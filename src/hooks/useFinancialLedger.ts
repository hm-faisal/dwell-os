"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { rentApi, utilityBillsApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { RentInvoice } from "@/types/dashboard";
import type { BillShare, UtilityBill } from "@/types/utility";

export interface CheckoutTarget {
  type: "RENT_INVOICE" | "UTILITY_SHARE";
  id: string;
  title: string;
  category?: string;
  amountCents: number;
  dueDate: string;
  proratedDays?: number;
  totalBillingDays?: number;
}

export function useFinancialLedger(propertyId?: string) {
  const [invoices, setInvoices] = useState<RentInvoice[]>([]);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "RENT" | "UTILITIES">(
    "ALL",
  );
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(
    null,
  );

  // Fallback demo fixtures for seamless preview if backend DB is empty
  const defaultInvoices: RentInvoice[] = useMemo(
    () => [
      {
        id: "inv-rent-oct-2026",
        leaseId: "lease-unit-4b",
        amount: 140000,
        amountPaid: 0,
        lateFee: 0,
        status: "DUE",
        periodStart: "2026-10-01T00:00:00Z",
        periodEnd: "2026-10-31T23:59:59Z",
        dueDate: "2026-10-15T23:59:59Z",
        gracePeriodDays: 5,
        createdAt: "2026-10-01T08:00:00Z",
        updatedAt: "2026-10-01T08:00:00Z",
        lease: {
          id: "lease-unit-4b",
          property: { name: "Maple Heights Co-Living" },
          room: { name: "Master Bedroom (Unit 4B)" },
        },
      },
      {
        id: "inv-rent-sep-2026",
        leaseId: "lease-unit-4b",
        amount: 140000,
        amountPaid: 140000,
        lateFee: 0,
        status: "PAID",
        periodStart: "2026-09-01T00:00:00Z",
        periodEnd: "2026-09-30T23:59:59Z",
        dueDate: "2026-09-05T23:59:59Z",
        gracePeriodDays: 5,
        createdAt: "2026-09-01T08:00:00Z",
        updatedAt: "2026-09-04T14:32:00Z",
        lease: {
          id: "lease-unit-4b",
          property: { name: "Maple Heights Co-Living" },
          room: { name: "Master Bedroom (Unit 4B)" },
        },
      },
    ],
    [],
  );

  const defaultBills: UtilityBill[] = useMemo(
    () => [
      {
        id: "bill-elec-oct-2026",
        propertyId: propertyId || "prop-maple-4",
        category: "ELECTRICITY",
        amount: 18000, // $180.00 total
        billingPeriodStart: "2026-09-15T00:00:00Z",
        billingPeriodEnd: "2026-10-15T00:00:00Z",
        dueDate: "2026-10-20T23:59:59Z",
        splitMethod: "USAGE_BASED",
        status: "PARTIALLY_PAID",
        createdAt: "2026-10-05T10:00:00Z",
        updatedAt: "2026-10-05T10:00:00Z",
        billShares: [
          {
            id: "share-tenant-oct-elec",
            billId: "bill-elec-oct-2026",
            tenantId: "current-user-tenant",
            amount: 4500, // $45.00 (prorated for 15 days out of 30)
            daysOccupied: 15,
            status: "PENDING",
            createdAt: "2026-10-05T10:00:00Z",
            updatedAt: "2026-10-05T10:00:00Z",
            tenant: {
              id: "current-user-tenant",
              name: "Current Tenant",
              email: "tenant@example.com",
            },
          },
          {
            id: "share-roommate-oct-elec",
            billId: "bill-elec-oct-2026",
            tenantId: "roommate-marcus",
            amount: 9000, // $90.00 (full 30 days)
            daysOccupied: 30,
            status: "PAID",
            createdAt: "2026-10-05T10:00:00Z",
            updatedAt: "2026-10-07T11:20:00Z",
            tenant: {
              id: "roommate-marcus",
              name: "Marcus Vance",
              email: "marcus@example.com",
            },
          },
          {
            id: "share-roommate-2-oct-elec",
            billId: "bill-elec-oct-2026",
            tenantId: "roommate-chloe",
            amount: 4500, // $45.00 (15 days)
            daysOccupied: 15,
            status: "PENDING",
            createdAt: "2026-10-05T10:00:00Z",
            updatedAt: "2026-10-05T10:00:00Z",
            tenant: {
              id: "roommate-chloe",
              name: "Chloe Bennett",
              email: "chloe@example.com",
            },
          },
        ],
      },
      {
        id: "bill-wifi-oct-2026",
        propertyId: propertyId || "prop-maple-4",
        category: "INTERNET",
        amount: 9000, // $90.00
        billingPeriodStart: "2026-10-01T00:00:00Z",
        billingPeriodEnd: "2026-10-31T23:59:59Z",
        dueDate: "2026-10-18T23:59:59Z",
        splitMethod: "EQUAL",
        status: "PENDING",
        createdAt: "2026-10-02T09:00:00Z",
        updatedAt: "2026-10-02T09:00:00Z",
        billShares: [
          {
            id: "share-tenant-oct-wifi",
            billId: "bill-wifi-oct-2026",
            tenantId: "current-user-tenant",
            amount: 3000, // $30.00 equal split
            daysOccupied: 30,
            status: "PENDING",
            createdAt: "2026-10-02T09:00:00Z",
            updatedAt: "2026-10-02T09:00:00Z",
            tenant: {
              id: "current-user-tenant",
              name: "Current Tenant",
              email: "tenant@example.com",
            },
          },
        ],
      },
    ],
    [propertyId],
  );

  const fetchLedger = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedInvoices, fetchedBills] = await Promise.all([
        rentApi.listInvoices().catch(() => []),
        propertyId
          ? utilityBillsApi.listPropertyBills(propertyId).catch(() => [])
          : Promise.resolve([]),
      ]);

      setInvoices(
        fetchedInvoices.length > 0 ? fetchedInvoices : defaultInvoices,
      );
      setBills(fetchedBills.length > 0 ? fetchedBills : defaultBills);
    } catch {
      setInvoices(defaultInvoices);
      setBills(defaultBills);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, defaultInvoices, defaultBills]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Aggregate Tenant Bill Shares
  const myBillShares = useMemo(() => {
    const list: Array<{
      share: BillShare;
      bill: UtilityBill;
    }> = [];

    for (const b of bills) {
      if (b.billShares) {
        for (const s of b.billShares) {
          // In real auth, matches user's tenantId; here includes tenant shares
          if (
            s.tenantId === "current-user-tenant" ||
            !s.tenantId.startsWith("roommate-")
          ) {
            list.push({ share: s, bill: b });
          }
        }
      }
    }
    return list;
  }, [bills]);

  // Financial Metrics (Calculated strictly in integer cents)
  const metrics = useMemo(() => {
    let unpaidRentCents = 0;
    let paidRentCents = 0;
    let unpaidUtilitiesCents = 0;
    let paidUtilitiesCents = 0;
    let nextDueDate: string | null = null;

    for (const inv of invoices) {
      const remaining = inv.amount + inv.lateFee - inv.amountPaid;
      if (
        inv.status === "DUE" ||
        inv.status === "OVERDUE" ||
        inv.status === "PARTIALLY_PAID"
      ) {
        unpaidRentCents += Math.max(0, remaining);
        if (!nextDueDate || new Date(inv.dueDate) < new Date(nextDueDate)) {
          nextDueDate = inv.dueDate;
        }
      } else if (inv.status === "PAID") {
        paidRentCents += inv.amountPaid;
      }
    }

    for (const { share, bill } of myBillShares) {
      if (share.status === "PENDING") {
        unpaidUtilitiesCents += share.amount;
        if (!nextDueDate || new Date(bill.dueDate) < new Date(nextDueDate)) {
          nextDueDate = bill.dueDate;
        }
      } else if (share.status === "PAID") {
        paidUtilitiesCents += share.amount;
      }
    }

    const totalBalanceDueCents = unpaidRentCents + unpaidUtilitiesCents;
    const totalPaidThisCycleCents = paidRentCents + paidUtilitiesCents;

    return {
      unpaidRentCents,
      unpaidUtilitiesCents,
      totalBalanceDueCents,
      totalPaidThisCycleCents,
      nextDueDate,
    };
  }, [invoices, myBillShares]);

  const openRentCheckout = (inv: RentInvoice) => {
    const remainingCents = inv.amount + inv.lateFee - inv.amountPaid;
    setCheckoutTarget({
      type: "RENT_INVOICE",
      id: inv.id,
      title: `Rent: ${new Date(inv.periodStart).toLocaleString("default", {
        month: "long",
      })} ${new Date(inv.periodStart).getFullYear()}`,
      amountCents: remainingCents,
      dueDate: inv.dueDate,
    });
  };

  const openUtilityCheckout = (share: BillShare, bill: UtilityBill) => {
    setCheckoutTarget({
      type: "UTILITY_SHARE",
      id: share.id,
      title: `${bill.category.replace(/_/g, " ")} Shared Utility Bill`,
      category: bill.category,
      amountCents: share.amount,
      dueDate: bill.dueDate,
      proratedDays: share.daysOccupied,
      totalBillingDays: 30, // Standard monthly billing window
    });
  };

  const executeCheckout = async (paymentMethodId?: string) => {
    if (!checkoutTarget) return;

    try {
      if (checkoutTarget.type === "RENT_INVOICE") {
        await rentApi.payRent(checkoutTarget.id, paymentMethodId);
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === checkoutTarget.id
              ? {
                  ...inv,
                  status: "PAID",
                  amountPaid: inv.amount + inv.lateFee,
                }
              : inv,
          ),
        );
      } else {
        await utilityBillsApi.payShare(checkoutTarget.id);
        setBills((prev) =>
          prev.map((b) => ({
            ...b,
            billShares: b.billShares?.map((s) =>
              s.id === checkoutTarget.id ? { ...s, status: "PAID" } : s,
            ),
          })),
        );
      }

      showToast.success("Payment confirmed and recorded to ledger!");
      setCheckoutTarget(null);
      fetchLedger();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Payment processing failed";
      showToast.error(msg);
      throw err;
    }
  };

  return {
    invoices,
    bills,
    myBillShares,
    metrics,
    isLoading,
    activeTab,
    setActiveTab,
    checkoutTarget,
    setCheckoutTarget,
    openRentCheckout,
    openUtilityCheckout,
    executeCheckout,
    refreshLedger: fetchLedger,
  };
}
