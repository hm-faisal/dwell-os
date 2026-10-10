"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { leasesApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import type { Lease, RentalDocument } from "@/types/lease";
import { DigitalSignatureCanvas } from "./DigitalSignatureCanvas";

export interface LeaseDetailViewerProps {
  lease: Lease;
  onRefresh?: () => void;
}

export function LeaseDetailViewer({
  lease,
  onRefresh,
}: LeaseDetailViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<RentalDocument | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSign = async (signatureBase64: string) => {
    if (!selectedDoc) return;
    try {
      setIsSubmitting(true);
      await leasesApi.signDocument(selectedDoc.id, {
        signatureBase64,
        consentTimestamp: new Date().toISOString(),
      });

      showToast.success("Lease agreement signed successfully!", {
        description:
          "Your digital signature has been recorded in the audit trail.",
      });

      setIsSignModalOpen(false);
      onRefresh?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to sign document";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-6">
      {/* Lease Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
              Lease Agreement: {lease.room?.name || "Unit"}
            </h2>
            <Badge
              variant={
                lease.status === "ACTIVE"
                  ? "success"
                  : lease.status === "DRAFT"
                    ? "warning"
                    : "neutral"
              }
            >
              {lease.status}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {lease.property?.name} · {lease.property?.address}
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(lease.rent)} / {lease.billingCycle.toLowerCase()}
          </div>
          <div className="text-[11px] text-zinc-400">
            Security Deposit: {formatCurrency(lease.deposit)}
          </div>
        </div>
      </div>

      {/* Tenancy Schedule */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
            Start Date
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
            {formatDate(lease.startDate)}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
            End Date
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
            {formatDate(lease.endDate)}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
            Billing Day
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
            Day {lease.billingDayOfMonth} of month
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 block">
            Active Tenants
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
            {lease.leaseTenants?.length || 1} Occupants
          </span>
        </div>
      </div>

      {/* Documents & Signatures Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Rental Documents & Signature Status
        </h3>

        {lease.rentalDocuments && lease.rentalDocuments.length > 0 ? (
          lease.rentalDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    {doc.title}
                  </span>
                  <Badge
                    variant={
                      doc.status === "EXECUTED"
                        ? "success"
                        : doc.status === "PENDING_SIGNATURE"
                          ? "warning"
                          : "neutral"
                    }
                    size="sm"
                  >
                    {doc.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Type: {doc.type.replace(/_/g, " ")}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs font-medium border border-black/8 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    View PDF
                  </a>
                )}
                {doc.status !== "EXECUTED" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setIsSignModalOpen(true);
                    }}
                  >
                    Sign Document ✍️
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 text-xs text-zinc-400 italic">
            Draft lease agreement awaiting landlord generation.
          </div>
        )}
      </div>

      {/* Signature Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Execute Digital Signature"
        description="By applying your digital signature, you legally certify and agree to the terms of this lease agreement."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-500">
            Document: <strong>{selectedDoc?.title}</strong>
          </div>
          <DigitalSignatureCanvas
            onSave={handleSign}
            onCancel={() => setIsSignModalOpen(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  );
}
