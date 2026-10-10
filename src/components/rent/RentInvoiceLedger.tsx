"use client";

import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { RentInvoice } from "@/types/dashboard";
import { PaymentCheckoutButton } from "./PaymentCheckoutButton";

export interface RentInvoiceLedgerProps {
  invoices: RentInvoice[];
  onRefresh?: () => void;
  isOwner?: boolean;
}

export function RentInvoiceLedger({
  invoices,
  onRefresh,
  isOwner = false,
}: RentInvoiceLedgerProps) {
  const getInvoiceBadge = (status: RentInvoice["status"]) => {
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

  if (invoices.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
        No rent invoices on record.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((inv) => {
        const remainingCents = inv.amount + inv.lateFee - inv.amountPaid;
        const isUnpaid = inv.status === "DUE" || inv.status === "OVERDUE";

        return (
          <div
            key={inv.id}
            className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-black/8 dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50">
                  Rent Invoice: {formatDate(inv.periodStart)} -{" "}
                  {formatDate(inv.periodEnd)}
                </span>
                {getInvoiceBadge(inv.status)}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Due Date: {formatDate(inv.dueDate)}
                {inv.lateFee > 0 && (
                  <span className="text-rose-500 ml-2 font-medium">
                    (Late Fee: {formatCurrency(inv.lateFee)})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(inv.amount + inv.lateFee)}
                </div>
                {inv.amountPaid > 0 && (
                  <div className="text-[10px] text-emerald-600">
                    Paid: {formatCurrency(inv.amountPaid)}
                  </div>
                )}
              </div>

              {!isOwner && isUnpaid && (
                <PaymentCheckoutButton
                  invoiceId={inv.id}
                  amountCents={remainingCents}
                  onSuccess={onRefresh}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
