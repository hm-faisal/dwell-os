"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useFinancialLedger } from "@/hooks/useFinancialLedger";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { RentInvoice } from "@/types/dashboard";
import { PaymentCheckoutModal } from "./PaymentCheckoutModal";

export interface FinancialPaymentHubProps {
  propertyId?: string;
  isOwner?: boolean;
}

export function FinancialPaymentHub({
  propertyId,
  isOwner = false,
}: FinancialPaymentHubProps) {
  const {
    invoices,
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
    refreshLedger,
  } = useFinancialLedger(propertyId);

  const getStatusBadge = (status: RentInvoice["status"] | "PENDING") => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">✓ Paid</Badge>;
      case "OVERDUE":
        return <Badge variant="danger">⚠️ Overdue</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="warning">Partially Paid</Badge>;
      case "CANCELLED":
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="info">Due</Badge>;
    }
  };

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case "ELECTRICITY":
        return "⚡";
      case "WATER":
        return "💧";
      case "GAS":
        return "🔥";
      case "INTERNET":
        return "🌐";
      case "TRASH":
        return "🗑️";
      default:
        return "📄";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Financial Management
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Stripe Verified Hub
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mt-1">
            Rent & Shared Utility Ledger
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review monthly rent obligations and deterministic shared utility
            splits with mid-cycle proration.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refreshLedger}
          isLoading={isLoading}
          className="self-start sm:self-auto text-xs"
        >
          ↻ Refresh Ledger
        </Button>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Total Balance Due
          </span>
          <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight">
            {formatCurrency(metrics.totalBalanceDueCents)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Rent: {formatCurrency(metrics.unpaidRentCents)} · Utilities:{" "}
            {formatCurrency(metrics.unpaidUtilitiesCents)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Next Payment Due
          </span>
          <div className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
            {metrics.nextDueDate
              ? formatDate(metrics.nextDueDate)
              : "No Due Obligations"}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {metrics.nextDueDate
              ? "Automatic 5-day grace window active"
              : "All current cycle bills settled"}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Settled This Period
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(metrics.totalPaidThisCycleCents)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Instant receipts logged in audit ledger
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 backdrop-blur-md w-fit border border-black/5 dark:border-white/5">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "ALL"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200",
          )}
        >
          All Obligations ({invoices.length + myBillShares.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("RENT")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "RENT"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200",
          )}
        >
          Rent Invoices ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("UTILITIES")}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "UTILITIES"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200",
          )}
        >
          Utility Bill Shares ({myBillShares.length})
        </button>
      </div>

      {/* Financial Ledger Items */}
      <div className="space-y-3">
        {/* RENT INVOICES */}
        {(activeTab === "ALL" || activeTab === "RENT") &&
          invoices.map((inv) => {
            const remainingCents = inv.amount + inv.lateFee - inv.amountPaid;
            const isUnpaid =
              inv.status === "DUE" ||
              inv.status === "OVERDUE" ||
              inv.status === "PARTIALLY_PAID";

            return (
              <div
                key={inv.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-black/15 dark:hover:border-white/20"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0">
                    🏠
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
                        Monthly Rent ({formatDate(inv.periodStart)} –{" "}
                        {formatDate(inv.periodEnd)})
                      </span>
                      {getStatusBadge(inv.status)}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Due Date:{" "}
                      <strong className="text-zinc-700 dark:text-zinc-300">
                        {formatDate(inv.dueDate)}
                      </strong>
                      {inv.lateFee > 0 && (
                        <span className="text-rose-500 ml-2 font-medium">
                          (Late Fee: {formatCurrency(inv.lateFee)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5">
                  <div className="text-right">
                    <div className="text-base font-black text-zinc-950 dark:text-zinc-50">
                      {formatCurrency(inv.amount + inv.lateFee)}
                    </div>
                    {inv.amountPaid > 0 && (
                      <span className="text-[11px] text-emerald-600 block">
                        Paid: {formatCurrency(inv.amountPaid)}
                      </span>
                    )}
                  </div>

                  {!isOwner && isUnpaid && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => openRentCheckout(inv)}
                      className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      <span>Pay Rent</span>
                      <span>·</span>
                      <span>{formatCurrency(remainingCents)}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

        {/* SHARED UTILITY BILLS */}
        {(activeTab === "ALL" || activeTab === "UTILITIES") &&
          myBillShares.map(({ share, bill }) => {
            const isUnpaid = share.status === "PENDING";
            const isProrated = share.daysOccupied < 30; // standard month reference

            return (
              <div
                key={share.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-black/15 dark:hover:border-white/20"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0">
                    {getCategoryIcon(bill.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
                        {bill.category.replace(/_/g, " ")} Shared Bill
                      </span>
                      {getStatusBadge(share.status === "PAID" ? "PAID" : "DUE")}
                      {isProrated && (
                        <Badge variant="warning" size="sm">
                          Prorated ({share.daysOccupied} of 30 days)
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Billing Period: {formatDate(bill.billingPeriodStart)} –{" "}
                      {formatDate(bill.billingPeriodEnd)} · Total Bill:{" "}
                      <strong>{formatCurrency(bill.amount)}</strong>
                    </div>

                    {/* Mid-cycle move-in proration callout */}
                    {isProrated && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                        Calculated proportionally for your {share.daysOccupied}{" "}
                        days of active residency this cycle.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
                      Your Share
                    </span>
                    <div className="text-base font-black text-zinc-950 dark:text-zinc-50">
                      {formatCurrency(share.amount)}
                    </div>
                  </div>

                  {!isOwner && isUnpaid && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => openUtilityCheckout(share, bill)}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <span>Pay Share</span>
                      <span>·</span>
                      <span>{formatCurrency(share.amount)}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

        {/* Empty state */}
        {invoices.length === 0 && myBillShares.length === 0 && (
          <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
            No active rent invoices or utility bills linked to your current
            lease.
          </div>
        )}
      </div>

      {/* Stripe Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={Boolean(checkoutTarget)}
        onClose={() => setCheckoutTarget(null)}
        target={checkoutTarget}
        onConfirmPayment={executeCheckout}
      />
    </div>
  );
}
