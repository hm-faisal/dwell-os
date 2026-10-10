"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { applicationsApi } from "@/lib/api";
import { showToast } from "@/lib/toast";

export interface TenantApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  rentCents: number;
  initialHoldExpiresAt?: string | null;
  onSuccess?: () => void;
}

export function TenantApplicationModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  rentCents,
  initialHoldExpiresAt,
  onSuccess,
}: TenantApplicationModalProps) {
  const [moveInDate, setMoveInDate] = useState("");
  const [employment, setEmployment] = useState("");
  const [personalInfo, setPersonalInfo] = useState("");
  const [references, setReferences] = useState("");
  const [notes, setNotes] = useState("");
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Hold Countdown Timer
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!initialHoldExpiresAt) return;

    const targetTime = new Date(initialHoldExpiresAt).getTime();

    const interval = setInterval(() => {
      const diff = Math.floor((targetTime - Date.now()) / 1000);
      if (diff <= 0) {
        setRemainingSeconds(0);
        clearInterval(interval);
      } else {
        setRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [initialHoldExpiresAt]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveInDate) {
      showToast.error("Please pick an intended move-in date");
      return;
    }

    try {
      setIsSubmitting(true);
      await applicationsApi.create({
        roomId,
        moveInDate: new Date(moveInDate).toISOString(),
        employment: employment.trim() || undefined,
        personalInfo: personalInfo.trim() || undefined,
        references: references.trim() || undefined,
        notes: notes.trim() || undefined,
        documents: documentUrls.map((url, i) => ({
          name: `Application Document ${i + 1}`,
          type: "APPLICATION_PROOF",
          fileUrl: url,
        })),
      });

      showToast.success(`Application submitted for ${roomName}!`, {
        description:
          "Your priority reservation hold is active. The landlord has been alerted for review.",
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit application";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for ${roomName}`}
      description="Submit your rental application with supporting details. Your reservation priority hold guarantees room lock pending evaluation."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Active Reservation Hold Timer Alert */}
        {remainingSeconds !== null && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              remainingSeconds > 0
                ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⏳</span>
              <div>
                <div className="font-bold text-xs">
                  {remainingSeconds > 0
                    ? "Active Priority Reservation Hold"
                    : "Reservation Hold Expired"}
                </div>
                <div className="text-[10px] opacity-80">
                  {remainingSeconds > 0
                    ? "Lock active. Competing applicants cannot claim this slot."
                    : "Priority release occurred. Submit promptly to secure evaluation."}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono font-bold text-sm">
                {formatTimer(remainingSeconds)}
              </div>
              <span className="text-[9px] uppercase tracking-wider opacity-75">
                Time Remaining
              </span>
            </div>
          </div>
        )}

        {/* Room & Rent Summary */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {roomName}
            </div>
            <div className="text-[11px] text-zinc-400">
              Monthly Rent: ${(rentCents / 100).toFixed(2)}
            </div>
          </div>
          <Badge variant="purple" size="sm">
            Priority Lock
          </Badge>
        </div>

        {/* Move-in Date */}
        <div className="space-y-1.5">
          <label
            htmlFor="app-move-in"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Requested Move-In Date *
          </label>
          <input
            id="app-move-in"
            type="date"
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
            required
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Employment and Financials */}
        <div className="space-y-1.5">
          <label
            htmlFor="app-employment"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Employment & Income Summary
          </label>
          <input
            id="app-employment"
            type="text"
            value={employment}
            onChange={(e) => setEmployment(e.target.value)}
            placeholder="e.g. Software Engineer at Stripe, $120k/yr salary"
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Rental References */}
        <div className="space-y-1.5">
          <label
            htmlFor="app-references"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Previous Landlord Reference / Contacts
          </label>
          <input
            id="app-references"
            type="text"
            value={references}
            onChange={(e) => setReferences(e.target.value)}
            placeholder="e.g. Jane Doe (555-0192) - 2 years at 104 Oak St"
            className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Supporting Document Uploads */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Attach Supporting Documents (Paystub / Credit Report / ID)
          </span>
          <PhotoUploadField
            value={documentUrls}
            onChange={setDocumentUrls}
            maxPhotos={3}
            label="Upload Proof Documents"
          />
        </div>

        {/* Personal Statement */}
        <div className="space-y-1.5">
          <label
            htmlFor="app-personal-info"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Personal Statement & Habits
          </label>
          <textarea
            id="app-personal-info"
            rows={2}
            value={personalInfo}
            onChange={(e) => setPersonalInfo(e.target.value)}
            placeholder="Briefly describe your lifestyle and why you're a great fit for this home..."
            className="w-full p-3 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Additional Notes */}
        <div className="space-y-1.5">
          <label
            htmlFor="app-notes"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Special Requests or Additional Notes
          </label>
          <textarea
            id="app-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special move-in terms, parking requests, or questions..."
            className="w-full p-3 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
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
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
}
