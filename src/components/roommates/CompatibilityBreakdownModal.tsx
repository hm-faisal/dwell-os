"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { RoommateMatch, RoommateProfile } from "@/types/roommate";
import { getScoreTheme } from "./CompatibilityScoreBar";

export interface CompatibilityBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: RoommateMatch | null;
  myProfile?: RoommateProfile | null;
  onOpenExpressInterest?: () => void;
}

interface AttributeRow {
  label: string;
  maxPoints: number;
  earnedPoints: number;
  myVal: string;
  theirVal: string;
  icon: string;
}

export function CompatibilityBreakdownModal({
  isOpen,
  onClose,
  match,
  myProfile,
  onOpenExpressInterest,
}: CompatibilityBreakdownModalProps) {
  if (!match) return null;

  const score = match.score;
  const breakdown = match.breakdown || {
    budget: 0,
    cleanliness: 0,
    sleep: 0,
    work: 0,
    habits: 0,
  };
  const theme = getScoreTheme(score);
  const target = match.profile;

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Unspecified";
    if (min && max) {
      return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    }
    if (max) return `Up to ${formatCurrency(max)}`;
    if (min) return `From ${formatCurrency(min)}`;
    return "Unspecified";
  };

  const formatSchedule = (val?: string | null) => {
    if (!val) return "Flexible / Any";
    return val
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const attributeRows: AttributeRow[] = [
    {
      label: "Budget Overlap",
      maxPoints: 30,
      earnedPoints: breakdown.budget ?? 0,
      myVal: formatBudget(myProfile?.budgetMin, myProfile?.budgetMax),
      theirVal: formatBudget(target.budgetMin, target.budgetMax),
      icon: "💰",
    },
    {
      label: "Cleanliness Alignment",
      maxPoints: 25,
      earnedPoints: breakdown.cleanliness ?? 0,
      myVal: formatSchedule(myProfile?.cleanliness),
      theirVal: formatSchedule(target.cleanliness),
      icon: "🧼",
    },
    {
      label: "Sleep Schedule Synergy",
      maxPoints: 15,
      earnedPoints: breakdown.sleep ?? 0,
      myVal: formatSchedule(myProfile?.sleepSchedule),
      theirVal: formatSchedule(target.sleepSchedule),
      icon: "⏰",
    },
    {
      label: "Work Routine Compatibility",
      maxPoints: 15,
      earnedPoints: breakdown.work ?? 0,
      myVal: formatSchedule(myProfile?.workSchedule),
      theirVal: formatSchedule(target.workSchedule),
      icon: "💼",
    },
    {
      label: "Habits (Smoking & Pets)",
      maxPoints: 15,
      earnedPoints: breakdown.habits ?? 0,
      myVal: `${myProfile?.smoking ? "Smoker" : "Non-smoker"} · ${
        myProfile?.pets ? "Has pets" : "No pets"
      }`,
      theirVal: `${target.smoking ? "Smoker" : "Non-smoker"} · ${
        target.pets ? "Has pets" : "No pets"
      }`,
      icon: "🐾",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compatibility Breakdown"
      description={`Transparent score report between you and ${match.user.name}.`}
      className="max-w-2xl"
      contentClassName="overflow-hidden"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          {onOpenExpressInterest && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onOpenExpressInterest();
              }}
              className="gap-1.5"
            >
              <span>Express Interest</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </Button>
          )}
        </div>
      }
    >
      {/* Auto-scrolling Content Area with Fixed Height */}
      <div className="h-[480px] sm:h-[500px] max-h-[60vh] overflow-y-auto space-y-5 pr-2 modal-scrollbar overscroll-contain">
        {/* Overall Score Banner */}
        <div
          className={cn(
            "p-4 rounded-2xl border flex items-center justify-between gap-4",
            theme.badgeBg,
          )}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50">
                {score}%
              </span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                  theme.badgeBg,
                  theme.textColor,
                )}
              >
                {theme.label}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Score derived from 5 objective lifestyle attributes (100 points
              maximum).
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {Object.values(breakdown).reduce((a, b) => a + b, 0)} / 100 pts
            </span>
          </div>
        </div>

        {/* Explainable Factor Progress Breakdown */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Points Breakdown by Lifestyle Factor
          </h4>

          <div className="space-y-3">
            {attributeRows.map((row) => {
              const pct = Math.round((row.earnedPoints / row.maxPoints) * 100);
              return (
                <div
                  key={row.label}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <span>{row.icon}</span>
                      <span>{row.label}</span>
                    </span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                      <strong>{row.earnedPoints}</strong> / {row.maxPoints} pts
                      ({pct}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        pct >= 80
                          ? "bg-emerald-500"
                          : pct >= 50
                            ? "bg-sky-500"
                            : "bg-amber-500",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Attribute Comparison */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-500 border-t border-black/5 dark:border-white/5">
                    <div>
                      <span className="text-zinc-400">You: </span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {row.myVal}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400">{match.user.name}: </span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {row.theirVal}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explainability note */}
        <p className="text-[11px] text-zinc-400 leading-normal">
          Fair Housing & Transparency Note: Matching scores calculate lifestyle
          synergy without evaluating personal identity, race, religion, gender,
          or national origin.
        </p>
      </div>
    </Modal>
  );
}
