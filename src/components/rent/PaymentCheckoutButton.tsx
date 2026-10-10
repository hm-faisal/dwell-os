"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { rentApi } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { showToast } from "@/lib/toast";

export interface PaymentCheckoutButtonProps {
  invoiceId: string;
  amountCents: number;
  label?: string;
  className?: string;
  onSuccess?: () => void;
}

export function PaymentCheckoutButton({
  invoiceId,
  amountCents,
  label = "Pay Rent",
  className,
  onSuccess,
}: PaymentCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    try {
      setIsLoading(true);
      const res = await rentApi.payRent(invoiceId);

      if (res.checkoutUrl) {
        // Redirect to external Stripe hosted checkout session
        window.location.href = res.checkoutUrl;
      } else {
        showToast.success(
          `Payment of ${formatCurrency(amountCents)} confirmed!`,
          {
            description: "Your rent receipt has been logged to your ledger.",
          },
        );
        onSuccess?.();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Payment checkout failed";
      showToast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      onClick={handlePay}
      isLoading={isLoading}
      className={className}
    >
      <span>{label}</span>
      <span>·</span>
      <span>{formatCurrency(amountCents)}</span>
    </Button>
  );
}
