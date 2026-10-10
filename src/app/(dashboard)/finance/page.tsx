import type { Metadata } from "next";
import { FinancialPaymentHub } from "@/components/finance/FinancialPaymentHub";

export const metadata: Metadata = {
  title: "Financial Ledger & Payments | DwellOS",
  description:
    "Review active recurring rent invoices and shared utility obligations with deterministic proration.",
};

export default function FinanceDashboardPage() {
  return (
    <div className="space-y-6">
      <FinancialPaymentHub />
    </div>
  );
}
