"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { roommateMatchingApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { RoommateMatch } from "@/types/roommate";

export interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMatch: RoommateMatch | null;
  onSuccess: (updatedMatch: RoommateMatch) => void;
}

export function ExpressInterestModal({
  isOpen,
  onClose,
  targetMatch,
  onSuccess,
}: ExpressInterestModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (targetMatch && isOpen) {
      setMessage(
        `Hi ${targetMatch.user.name}, I reviewed your roommate profile and our habits, schedules, and budget look like a fantastic match! Would love to connect about co-living together.`,
      );
    }
  }, [targetMatch, isOpen]);

  if (!targetMatch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updated = await roommateMatchingApi.expressInterest(
        targetMatch.user.id,
        {
          interested: true,
          message: message.trim() || undefined,
        },
      );

      const isMutual =
        updated.status === "MUTUAL_INTEREST" || updated.mutualInterest;

      if (isMutual) {
        showToast.success(
          `It's a Mutual Match! 🎉 You and ${targetMatch.user.name} are now connected.`,
        );
      } else {
        showToast.success(
          `Interest sent to ${targetMatch.user.name}! We'll alert you as soon as they respond.`,
        );
      }

      onSuccess({
        ...targetMatch,
        matchStatus:
          (updated.status as "PENDING" | "MUTUAL_INTEREST" | "DECLINED") ||
          "PENDING",
        mutualInterest: Boolean(isMutual),
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to express interest";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Connect with ${targetMatch.user.name}`}
      description="Send an introductory note to start the conversation. When mutual interest is confirmed, contact details and an introduction thread are unlocked."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Match preview summary */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold flex items-center justify-center text-sm shadow-xs">
              {targetMatch.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                {targetMatch.user.name}
              </div>
              <div className="text-[11px] text-zinc-400">
                {targetMatch.score}% Compatibility Score
              </div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
            {targetMatch.score}% Match
          </span>
        </div>

        {/* Message textarea */}
        <div className="space-y-1.5">
          <label
            htmlFor="intro-message"
            className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
          >
            Personal Introduction Note
          </label>
          <textarea
            id="intro-message"
            rows={4}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 leading-relaxed"
            placeholder="Introduce yourself and mention what you're looking for in a roommate..."
            required
          />
          <span className="text-[10px] text-zinc-400 block text-right">
            {message.length} / 1000 chars
          </span>
        </div>

        {/* Action buttons */}
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
            className="gap-1.5"
          >
            <span>Send Interest</span>
            <span>♥</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
