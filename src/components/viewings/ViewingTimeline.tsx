"use client";

import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters";
import type { ViewingRequest, ViewingStatus } from "@/types/viewing";

export interface ViewingTimelineProps {
  viewings: ViewingRequest[];
  onAction?: (
    viewingId: string,
    action: "CONFIRM" | "CANCEL" | "RESCHEDULE",
  ) => void;
  isOwner?: boolean;
}

export function ViewingTimeline({
  viewings,
  onAction,
  isOwner,
}: ViewingTimelineProps) {
  const getBadge = (status: ViewingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">✓ Confirmed</Badge>;
      case "ALTERNATE_PROPOSED":
        return <Badge variant="warning">⏳ Alternate Proposed</Badge>;
      case "COMPLETED":
        return <Badge variant="neutral">Completed</Badge>;
      case "DECLINED":
      case "CANCELLED":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="info">Pending Review</Badge>;
    }
  };

  if (viewings.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
        No scheduled viewings recorded.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {viewings.map((v) => (
        <div
          key={v.id}
          className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-black/8 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-base">
              {v.type === "VIRTUAL" ? "🎥" : "📍"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50">
                  {v.room?.name || "Room Viewing"}
                </span>
                <span className="text-[10px] text-zinc-400">
                  ({v.type === "VIRTUAL" ? "Virtual Tour" : "In-Person"})
                </span>
                {getBadge(v.status)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Scheduled: <strong>{formatDate(v.preferredDate)}</strong>
                {v.alternateDate && (
                  <span className="text-zinc-400 ml-2">
                    (Alt: {formatDate(v.alternateDate)})
                  </span>
                )}
              </div>
              {v.notes && (
                <p className="text-[11px] text-zinc-400 italic mt-1">
                  &ldquo;{v.notes}&rdquo;
                </p>
              )}
            </div>
          </div>

          {onAction && v.status === "REQUESTED" && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => onAction(v.id, "CONFIRM")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  Confirm
                </button>
              )}
              <button
                type="button"
                onClick={() => onAction(v.id, "CANCEL")}
                className="px-3 py-1 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
