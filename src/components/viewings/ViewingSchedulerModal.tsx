"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { viewingsApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { ViewingType } from "@/types/viewing";

export interface ViewingSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  propertyName?: string;
  onSuccess?: () => void;
}

export function ViewingSchedulerModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  propertyName,
  onSuccess,
}: ViewingSchedulerModalProps) {
  const [type, setType] = useState<ViewingType>("IN_PERSON");
  const [preferredDate, setPreferredDate] = useState("");
  const [alternateDate, setAlternateDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate) {
      showToast.error("Please pick a preferred date and time");
      return;
    }

    try {
      setIsSubmitting(true);
      await viewingsApi.create({
        roomId,
        type,
        preferredDate: new Date(preferredDate).toISOString(),
        alternateDate: alternateDate
          ? new Date(alternateDate).toISOString()
          : undefined,
        notes: notes.trim() || undefined,
      });

      showToast.success(`Viewing request submitted for ${roomName}!`, {
        description:
          "The property manager will review and confirm your scheduled slot.",
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to book viewing";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Viewing: ${roomName}`}
      description={
        propertyName
          ? `Request an in-person or live video walkthrough for ${roomName} at ${propertyName}.`
          : `Request an in-person or live video walkthrough for ${roomName}.`
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Viewing Type Toggle */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Tour Format
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("IN_PERSON")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                type === "IN_PERSON"
                  ? "border-zinc-900 dark:border-white bg-zinc-100/80 dark:bg-zinc-800/80"
                  : "border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15"
              }`}
            >
              <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>📍</span>
                <span>In-Person Tour</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Visit property on-site
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType("VIRTUAL")}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                type === "VIRTUAL"
                  ? "border-zinc-900 dark:border-white bg-zinc-100/80 dark:bg-zinc-800/80"
                  : "border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15"
              }`}
            >
              <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>🎥</span>
                <span>Virtual Video Call</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Live interactive walkthrough
              </div>
            </button>
          </div>
        </div>

        {/* Preferred Date & Time */}
        <div className="space-y-1.5">
          <label
            htmlFor="preferred-date"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Preferred Date & Time *
          </label>
          <input
            id="preferred-date"
            type="datetime-local"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Alternate Date & Time */}
        <div className="space-y-1.5">
          <label
            htmlFor="alternate-date"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Alternate Backup Date & Time (Optional)
          </label>
          <input
            id="alternate-date"
            type="datetime-local"
            value={alternateDate}
            onChange={(e) => setAlternateDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Special Inquiries / Notes */}
        <div className="space-y-1.5">
          <label
            htmlFor="viewing-notes"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Notes or Questions for Manager
          </label>
          <textarea
            id="viewing-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Inquiring about move-in timeframe and parking availability..."
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
            Submit Viewing Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
