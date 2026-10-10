"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { roommateMatchingApi } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { RoommateProfile } from "@/types/roommate";

export interface ApplicantSummary {
  id: string;
  name: string;
  email?: string;
  profile?: RoommateProfile | null;
}

export interface RoommateApprovalVoteCardProps {
  roomId: string;
  roomName?: string;
  applicant: ApplicantSummary;
  applicationId?: string;
  existingVote?: "APPROVED" | "REJECTED" | null;
  onVoteSubmitted?: (status: "APPROVED" | "REJECTED") => void;
  className?: string;
}

export function RoommateApprovalVoteCard({
  roomId,
  roomName = "Shared Room",
  applicant,
  applicationId,
  existingVote,
  onVoteSubmitted,
  className,
}: RoommateApprovalVoteCardProps) {
  const [voteStatus, setVoteStatus] = useState<"APPROVED" | "REJECTED" | null>(
    existingVote || null,
  );
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profile = applicant.profile;

  const handleVote = async (decision: "APPROVED" | "REJECTED") => {
    setIsSubmitting(true);
    try {
      await roommateMatchingApi.approveRoommate(roomId, {
        applicationId,
        applicantId: applicant.id,
        status: decision,
        comments: comments.trim() || undefined,
      });

      setVoteStatus(decision);
      showToast.success(
        `Your vote to ${decision.toLowerCase()} ${applicant.name} has been recorded.`,
      );
      onVoteSubmitted?.(decision);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to submit roommate co-approval vote";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "p-6 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-4",
        className,
      )}
    >
      {/* Header: Room Name & Applicant Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-white font-bold text-lg flex items-center justify-center shadow-xs">
            {applicant.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-50">
                {applicant.name}
              </h3>
              <Badge variant="purple" size="sm">
                Roommate Applicant
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Applying to join: <strong>{roomName}</strong>
            </p>
          </div>
        </div>

        {voteStatus && (
          <div>
            {voteStatus === "APPROVED" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                ✓ You Approved This Applicant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25">
                ✕ You Rejected This Applicant
              </span>
            )}
          </div>
        )}
      </div>

      {/* Applicant Profile Snapshot */}
      {profile ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Budget
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
              {profile.budgetMin || profile.budgetMax ? (
                <>
                  {profile.budgetMin ? formatCurrency(profile.budgetMin) : "$0"}
                  {" - "}
                  {profile.budgetMax
                    ? formatCurrency(profile.budgetMax)
                    : "Any"}
                </>
              ) : (
                "Flexible"
              )}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Cleanliness
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
              {profile.cleanliness || "Moderate"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Sleep Schedule
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
              {profile.sleepSchedule || "Flexible"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Work Schedule
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
              {profile.workSchedule || "Flexible"}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-zinc-400 italic">
          Applicant has not provided an extended lifestyle profile.
        </p>
      )}

      {/* Bio snippet */}
      {profile?.bio && (
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic border-l-2 border-zinc-300 dark:border-zinc-700 pl-3">
          &ldquo;{profile.bio}&rdquo;
        </p>
      )}

      {/* Policy Explanation Note */}
      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-black/5 dark:border-white/5 text-xs text-zinc-500 space-y-1">
        <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <span>🗳️</span>
          <span>Roommate Co-Approval Policy</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          As an active occupant of this shared unit, your vote directly impacts
          whether this applicant is accepted into your shared living space.
        </p>
      </div>

      {/* Voting Controls */}
      {!voteStatus && (
        <div className="space-y-3 pt-1">
          <div>
            <label
              htmlFor={`vote-comments-${applicant.id}`}
              className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400 mb-1"
            >
              Feedback or Notes (Optional)
            </label>
            <input
              id={`vote-comments-${applicant.id}`}
              type="text"
              placeholder="e.g. Looks like our schedules line up well..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full h-9.5 px-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-xs text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => handleVote("REJECTED")}
              isLoading={isSubmitting}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              ✕ Decline Applicant
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => handleVote("APPROVED")}
              isLoading={isSubmitting}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              ✓ Approve Roommate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
