"use client";

import { Button } from "@/components/ui/Button";
import type { RoommateMatch } from "@/types/roommate";
import { RoommateMatchCard } from "./RoommateMatchCard";

export interface RoommateMatchGridProps {
  matches: RoommateMatch[];
  isLoading?: boolean;
  hasProfile?: boolean;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  onSetupProfile: () => void;
  onViewBreakdown: (match: RoommateMatch) => void;
  onExpressInterest: (match: RoommateMatch) => void;
}

export function MatchCardSkeleton() {
  return (
    <div className="rounded-3xl p-6 bg-white/50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/2" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-full" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      </div>
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full" />
    </div>
  );
}

export function RoommateMatchGrid({
  matches,
  isLoading = false,
  hasProfile = true,
  minScore,
  onMinScoreChange,
  onSetupProfile,
  onViewBreakdown,
  onExpressInterest,
}: RoommateMatchGridProps) {
  if (!hasProfile && !isLoading) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm max-w-2xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center text-2xl shadow-xs">
          🤝
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Set Up Your Profile to Unlock Matches
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            DwellOS uses your lifestyle preferences (budget, work/sleep
            routines, and habits) to compute transparent compatibility scores
            with prospective housemates.
          </p>
        </div>
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onSetupProfile}
            className="rounded-2xl px-8 font-semibold shadow-md"
          >
            Create My Roommate Profile →
          </Button>
        </div>
      </div>
    );
  }

  const filteredMatches = matches.filter((m) => m.score >= minScore);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Min Compatibility Threshold Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-black/6 dark:border-white/10 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50">
            {filteredMatches.length}{" "}
            {filteredMatches.length === 1
              ? "Housemate Match"
              : "Housemate Matches"}
          </span>
          <span className="text-zinc-400 text-xs">·</span>
          <span className="text-xs text-zinc-500">Sorted by Compatibility</span>
        </div>

        {/* Min Score Range Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label
            htmlFor="min-score-slider"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap"
          >
            Min Match: <strong>{minScore}%</strong>
          </label>
          <input
            id="min-score-slider"
            type="range"
            min={0}
            max={90}
            step={5}
            value={minScore}
            onChange={(e) =>
              onMinScoreChange(Number.parseInt(e.target.value, 10))
            }
            className="w-32 accent-zinc-900 dark:accent-white cursor-pointer"
          />
          {minScore > 0 && (
            <button
              type="button"
              onClick={() => onMinScoreChange(0)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center text-xl">
            🔍
          </div>
          <h4 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            No matches above {minScore}% compatibility
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try lowering your minimum compatibility slider or broadening your
            budget and schedule preferences.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onMinScoreChange(0)}
            >
              Show All Matches
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <RoommateMatchCard
              key={match.id}
              match={match}
              onViewBreakdown={onViewBreakdown}
              onExpressInterest={onExpressInterest}
            />
          ))}
        </div>
      )}
    </div>
  );
}
