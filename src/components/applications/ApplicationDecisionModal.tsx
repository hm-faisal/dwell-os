"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { applicationsApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { Application } from "@/types/application";

export interface ApplicationDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onSuccess?: () => void;
}

export function ApplicationDecisionModal({
  isOpen,
  onClose,
  application,
  onSuccess,
}: ApplicationDecisionModalProps) {
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application) return null;

  const handleExecute = async () => {
    try {
      setIsSubmitting(true);

      if (decision === "APPROVE") {
        // Atomic approval: passes expectedRoomVersion for optimistic concurrency control
        await applicationsApi.approve(application.id, {
          expectedRoomVersion: application.room?.version,
          notes: notes.trim() || undefined,
        });

        showToast.success(
          `Application approved for ${application.tenant?.name || "applicant"}!`,
          {
            description:
              "Draft lease provisioned. All competing applications for this room have been automatically closed.",
          },
        );
      } else {
        await applicationsApi.updateStatus(application.id, {
          status: "REJECTED",
          notes: notes.trim() || undefined,
        });

        showToast.success(
          `Application rejected for ${application.tenant?.name || "applicant"}.`,
        );
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to record decision";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        decision === "APPROVE"
          ? `Approve Application: ${application.tenant?.name}`
          : `Decline Application: ${application.tenant?.name}`
      }
      description={`Triage application for ${application.room?.name || "Room"}.`}
    >
      <div className="space-y-4 pt-2">
        {/* Decision Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDecision("APPROVE")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              decision === "APPROVE"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                : "border-black/5 dark:border-white/5 opacity-70"
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>✓</span>
              <span>Approve & Lock Room</span>
            </div>
            <div className="text-[10px] opacity-80 mt-0.5">
              Closes competing applications
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDecision("REJECT")}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              decision === "REJECT"
                ? "border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-100"
                : "border-black/5 dark:border-white/5 opacity-70"
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>✕</span>
              <span>Decline Applicant</span>
            </div>
            <div className="text-[10px] opacity-80 mt-0.5">
              Frees queue for alternatives
            </div>
          </button>
        </div>

        {/* Atomic Transaction Notice */}
        {decision === "APPROVE" && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>🔒</span>
              <span>Atomic Locking & Concurrency Protection</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Approving this applicant executes an exclusive row lock on Room #
              {application.roomId}. If capacity is reached, room status will
              transition to <strong>OCCUPIED</strong> and all competing pending
              applications will be automatically closed to prevent
              double-booking.
            </p>
          </div>
        )}

        {/* Applicant Snapshot */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 text-xs space-y-1">
          <div className="text-zinc-500">
            Applicant: <strong>{application.tenant?.name}</strong> (
            {application.tenant?.email})
          </div>
          {application.employment && (
            <div className="text-zinc-500">
              Employment: <strong>{application.employment}</strong>
            </div>
          )}
        </div>

        {/* Optional Notes */}
        <div className="space-y-1.5">
          <label
            htmlFor="decision-notes"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Decision Feedback / Internal Notes
          </label>
          <textarea
            id="decision-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for the lease agreement or applicant record..."
            className="w-full p-2.5 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={decision === "APPROVE" ? "primary" : "outline"}
            size="md"
            onClick={handleExecute}
            isLoading={isSubmitting}
            className={
              decision === "APPROVE"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "text-rose-600 hover:bg-rose-50"
            }
          >
            {decision === "APPROVE"
              ? "Confirm Atomic Approval"
              : "Confirm Rejection"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
