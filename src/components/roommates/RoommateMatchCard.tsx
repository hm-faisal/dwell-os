"use client";

import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { RoommateMatch } from "@/types/roommate";
import { CompatibilityScoreBar, getScoreTheme } from "./CompatibilityScoreBar";

export interface RoommateMatchCardProps {
  match: RoommateMatch;
  onViewBreakdown: (match: RoommateMatch) => void;
  onExpressInterest: (match: RoommateMatch) => void;
  className?: string;
}

export function RoommateMatchCard({
  match,
  onViewBreakdown,
  onExpressInterest,
  className,
}: RoommateMatchCardProps) {
  const profile = match.profile;
  const user = match.user;
  const theme = getScoreTheme(match.score);

  const formatSchedule = (val?: string | null) => {
    if (!val) return "Flexible";
    return val
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300",
        "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-black/8 dark:border-white/10",
        "shadow-xs hover:shadow-xl hover:border-black/20 dark:hover:border-white/20 hover:-translate-y-1",
        className,
      )}
    >
      <div className="space-y-4">
        {/* Header: User Avatar & Match Score Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-950 font-bold text-lg flex items-center justify-center shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-950 dark:text-zinc-50 tracking-tight line-clamp-1">
                {user.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                {profile.moveInDate
                  ? `Target Move-in: ${formatDate(profile.moveInDate)}`
                  : "Move-in date flexible"}
              </p>
            </div>
          </div>

          {/* Compatibility score pill */}
          <button
            type="button"
            onClick={() => onViewBreakdown(match)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold transition-transform cursor-pointer hover:scale-105 shadow-2xs border",
              theme.badgeBg,
              theme.textColor,
            )}
            title="Click to view explainable compatibility point breakdown"
          >
            {match.score}% Match ℹ️
          </button>
        </div>

        {/* Compatibility progress bar */}
        <div className="pt-1">
          <CompatibilityScoreBar
            score={match.score}
            size="md"
            showLabel={false}
          />
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
            <span>{theme.label}</span>
            <button
              type="button"
              onClick={() => onViewBreakdown(match)}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 font-medium underline underline-offset-2 cursor-pointer"
            >
              Why this score?
            </button>
          </div>
        </div>

        {/* Key Living Preferences & Budget */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Budget Range
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

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Cleanliness
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
              {formatSchedule(profile.cleanliness)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Sleep Schedule
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
              {formatSchedule(profile.sleepSchedule)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Work Routine
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
              {formatSchedule(profile.workSchedule)}
            </span>
          </div>
        </div>

        {/* Bio preview */}
        {profile.bio && (
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}

        {/* Lifestyle Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {profile.smoking ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              🚬 Smoker
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              🚭 Non-Smoker
            </span>
          )}

          {profile.pets ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              🐾 Has Pets / Pet Friendly
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              No Pets
            </span>
          )}

          {profile.lifestyleTags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}

          {(profile.lifestyleTags?.length || 0) > 3 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400">
              +{profile.lifestyleTags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-black/5 dark:border-white/5 mt-4">
        {match.mutualInterest ? (
          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                🎉 Mutual Interest Confirmed!
              </span>
            </div>
            <a
              href={`mailto:${user.email}?subject=DwellOS Roommate Match Introduction`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold tracking-wide transition-colors"
            >
              <span>Connect via Email / Intro Thread</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 2 11 13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </a>
          </div>
        ) : match.matchStatus === "PENDING" ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled
            className="w-full text-xs font-semibold"
          >
            ✓ Interest Sent
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onViewBreakdown(match)}
              className="flex-1 text-xs"
            >
              Breakdown
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onExpressInterest(match)}
              className="flex-1 text-xs gap-1"
            >
              <span>Express Interest</span>
              <span>♥</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
