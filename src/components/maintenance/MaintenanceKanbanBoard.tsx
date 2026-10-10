"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { maintenanceApi } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenanceUrgency,
} from "@/types/maintenance";

export interface MaintenanceKanbanBoardProps {
  tickets: MaintenanceRequest[];
  onRefresh?: () => void;
  isOwner?: boolean;
}

const STAGES: { id: MaintenanceStatus; label: string; badge: string }[] = [
  { id: "OPEN", label: "Open Tickets", badge: "danger" },
  { id: "ACKNOWLEDGED", label: "Acknowledged", badge: "warning" },
  { id: "IN_PROGRESS", label: "In Progress", badge: "info" },
  { id: "RESOLVED", label: "Resolved", badge: "success" },
  { id: "CLOSED", label: "Closed", badge: "neutral" },
];

export function MaintenanceKanbanBoard({
  tickets,
  onRefresh,
  isOwner = false,
}: MaintenanceKanbanBoardProps) {
  const [ratingTicket, setRatingTicket] = useState<MaintenanceRequest | null>(
    null,
  );
  const [rating, setRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const getTicketsForStage = (status: MaintenanceStatus) => {
    return tickets.filter((t) => t.status === status);
  };

  const handleAdvanceStatus = async (
    ticketId: string,
    nextStatus: MaintenanceStatus,
  ) => {
    try {
      await maintenanceApi.updateStatus(ticketId, { status: nextStatus });
      showToast.success(
        `Ticket status updated to ${nextStatus.replace(/_/g, " ")}`,
      );
      onRefresh?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update ticket";
      showToast.error(msg);
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingTicket) return;

    try {
      setIsSubmittingRating(true);
      await maintenanceApi.rate(ratingTicket.id, {
        rating,
        feedback: ratingFeedback.trim() || undefined,
      });

      showToast.success("Rating submitted! Ticket has been closed.");
      setRatingTicket(null);
      setRatingFeedback("");
      onRefresh?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit rating";
      showToast.error(msg);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getUrgencyBadge = (urgency: MaintenanceUrgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return (
          <Badge variant="danger" size="sm">
            🚨 EMERGENCY
          </Badge>
        );
      case "HIGH":
        return (
          <Badge variant="danger" size="sm">
            High
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge variant="warning" size="sm">
            Medium
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            Low
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {STAGES.map((stage) => {
          const stageTickets = getTicketsForStage(stage.id);
          return (
            <div
              key={stage.id}
              className="p-3.5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 space-y-3 flex flex-col"
            >
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                  {stage.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/5">
                  {stageTickets.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1">
                {stageTickets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400 italic">
                    No tickets
                  </div>
                ) : (
                  stageTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-black/5 dark:border-white/5 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-xs text-zinc-950 dark:text-zinc-50">
                          {t.category}
                        </span>
                        {getUrgencyBadge(t.urgency)}
                      </div>

                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>

                      <div className="text-[10px] text-zinc-400 pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <span>{t.room?.name || "Room"}</span>
                        <span>{formatDate(t.createdAt)}</span>
                      </div>

                      {/* Triage controls for landlord */}
                      {isOwner && t.status !== "CLOSED" && (
                        <div className="pt-1 flex items-center justify-end gap-1">
                          {t.status === "OPEN" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleAdvanceStatus(t.id, "ACKNOWLEDGED")
                              }
                              className="px-2 py-1 text-[10px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg cursor-pointer"
                            >
                              Acknowledge →
                            </button>
                          )}
                          {t.status === "ACKNOWLEDGED" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleAdvanceStatus(t.id, "IN_PROGRESS")
                              }
                              className="px-2 py-1 text-[10px] font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg cursor-pointer"
                            >
                              In Progress →
                            </button>
                          )}
                          {t.status === "IN_PROGRESS" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleAdvanceStatus(t.id, "RESOLVED")
                              }
                              className="px-2 py-1 text-[10px] font-semibold bg-emerald-600 text-white rounded-lg cursor-pointer"
                            >
                              Mark Resolved ✓
                            </button>
                          )}
                        </div>
                      )}

                      {/* Post-resolution rating for tenant */}
                      {!isOwner && t.status === "RESOLVED" && (
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setRatingTicket(t)}
                            className="px-2.5 py-1 text-[10px] font-semibold bg-amber-500 text-white rounded-lg cursor-pointer"
                          >
                            Rate Work ⭐
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tenant Rating Modal */}
      <Modal
        isOpen={Boolean(ratingTicket)}
        onClose={() => setRatingTicket(null)}
        title="Rate Maintenance Service"
        description="Share your feedback on the timeliness and quality of the maintenance repair."
      >
        <form onSubmit={handleRateSubmit} className="space-y-4 pt-2">
          <div className="space-y-1 text-center py-2">
            <span className="text-xs font-semibold text-zinc-500 block">
              Satisfaction Rating
            </span>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl cursor-pointer transition-transform hover:scale-125 ${
                    rating >= star
                      ? "text-amber-400"
                      : "text-zinc-300 dark:text-zinc-700"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="rating-feedback"
              className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
            >
              Comments / Notes
            </label>
            <textarea
              id="rating-feedback"
              rows={3}
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              placeholder="Was the issue completely fixed? Was the contractor professional?"
              className="w-full p-2.5 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setRatingTicket(null)}
              disabled={isSubmittingRating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmittingRating}
            >
              Submit Rating & Close Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
