"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { CheckoutTarget } from "@/hooks/useFinancialLedger";
import { formatCurrency, formatDate } from "@/lib/formatters";

export interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: CheckoutTarget | null;
  onConfirmPayment: (paymentMethodId?: string) => Promise<void>;
}

export function PaymentCheckoutModal({
  isOpen,
  onClose,
  target,
  onConfirmPayment,
}: PaymentCheckoutModalProps) {
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("•••");
  const [zip, setZip] = useState("94107");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReceiptConfirmed, setIsReceiptConfirmed] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string>("");

  if (!target) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      // Simulate Stripe PaymentIntent confirmation delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      await onConfirmPayment("pm_card_visa_4242");
      const mockReceipt = `REC-${Date.now().toString().slice(-6)}`;
      setReceiptNumber(mockReceipt);
      setIsReceiptConfirmed(true);
    } catch {
      // Error handled in hook toast
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsReceiptConfirmed(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isReceiptConfirmed ? "Payment Confirmed" : "Secure Payment Checkout"
      }
      description={
        isReceiptConfirmed
          ? "Your transaction has been processed and recorded to your permanent ledger."
          : "Powered by end-to-end encrypted Stripe payment processing."
      }
      className="max-w-md"
    >
      {isReceiptConfirmed ? (
        <div className="space-y-5 text-center py-2 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-2xl font-bold shadow-xs">
            ✓
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
              Receipt Reference: {receiptNumber}
            </span>
            <div className="text-2xl font-black text-zinc-950 dark:text-zinc-50 mt-1">
              {formatCurrency(target.amountCents)}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Applied toward: <strong>{target.title}</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 text-left text-xs space-y-1.5">
            <div className="flex justify-between text-zinc-500">
              <span>Payment Method</span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100">
                Visa ending in 4242
              </span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Timestamp</span>
              <span className="text-zinc-900 dark:text-zinc-100">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Settlement Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Instant Settled
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleClose}
            className="w-full"
          >
            Done & Return to Ledger
          </Button>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-4 pt-1">
          {/* Obligation Summary Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {target.title}
              </span>
              <Badge
                variant={target.type === "RENT_INVOICE" ? "purple" : "info"}
                size="sm"
              >
                {target.type === "RENT_INVOICE"
                  ? "Rent Invoice"
                  : "Utility Share"}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-black/5 dark:border-white/5">
              <span className="text-xs text-zinc-500">
                Due Date: {formatDate(target.dueDate)}
              </span>
              <span className="text-xl font-black text-zinc-950 dark:text-zinc-50">
                {formatCurrency(target.amountCents)}
              </span>
            </div>

            {/* Mid-cycle occupancy proration highlight */}
            {target.proratedDays &&
              target.totalBillingDays &&
              target.proratedDays < target.totalBillingDays && (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                  💡 <strong>Mid-Cycle Move-In Proration Applied:</strong>{" "}
                  Calculated for{" "}
                  <strong>
                    {target.proratedDays} of {target.totalBillingDays} days
                  </strong>{" "}
                  of active occupancy.
                </div>
              )}
          </div>

          {/* Mock Stripe Payment Element */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="chk-card-number"
                className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
              >
                Card Information (Stripe Test Mode)
              </label>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <span>🔒 256-bit SSL</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden shadow-xs">
              <div className="p-3">
                <input
                  id="chk-card-number"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card number"
                  className="w-full text-xs font-mono bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800">
                <div className="p-2.5">
                  <input
                    type="text"
                    aria-label="Card expiration MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className="w-full text-xs font-mono bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                    required
                  />
                </div>
                <div className="p-2.5">
                  <input
                    type="text"
                    aria-label="Card CVC"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="CVC"
                    className="w-full text-xs font-mono bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                    required
                  />
                </div>
                <div className="p-2.5">
                  <input
                    type="text"
                    aria-label="Billing ZIP code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="ZIP"
                    className="w-full text-xs font-mono bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5 dark:border-white/5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isProcessing}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <span>Pay {formatCurrency(target.amountCents)}</span>
              <span>🔒</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
