import { cn } from "@/lib/utils";

export interface CompatibilityScoreBarProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function getScoreTheme(score: number): {
  color: string;
  bgColor: string;
  ringColor: string;
  badgeBg: string;
  textColor: string;
  label: string;
} {
  if (score >= 80) {
    return {
      color: "bg-emerald-500",
      bgColor: "bg-emerald-500/15",
      ringColor: "ring-emerald-500/30",
      badgeBg: "bg-emerald-500/10 border-emerald-500/25",
      textColor: "text-emerald-700 dark:text-emerald-300",
      label: "Excellent Match",
    };
  }
  if (score >= 60) {
    return {
      color: "bg-sky-500",
      bgColor: "bg-sky-500/15",
      ringColor: "ring-sky-500/30",
      badgeBg: "bg-sky-500/10 border-sky-500/25",
      textColor: "text-sky-700 dark:text-sky-300",
      label: "Good Synergy",
    };
  }
  if (score >= 40) {
    return {
      color: "bg-amber-500",
      bgColor: "bg-amber-500/15",
      ringColor: "ring-amber-500/30",
      badgeBg: "bg-amber-500/10 border-amber-500/25",
      textColor: "text-amber-700 dark:text-amber-300",
      label: "Moderate Fit",
    };
  }
  return {
    color: "bg-zinc-500",
    bgColor: "bg-zinc-500/15",
    ringColor: "ring-zinc-500/30",
    badgeBg: "bg-zinc-500/10 border-zinc-500/25",
    textColor: "text-zinc-700 dark:text-zinc-300",
    label: "Low Fit",
  };
}

export function CompatibilityScoreBar({
  score,
  size = "md",
  showLabel = true,
  className,
}: CompatibilityScoreBarProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const theme = getScoreTheme(clampedScore);

  const barHeight = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
            <span
              className={cn("w-2 h-2 rounded-full", theme.color)}
              aria-hidden="true"
            />
            <span>{clampedScore}% Compatibility</span>
          </span>
          <span className={cn("text-[11px] font-medium", theme.textColor)}>
            {theme.label}
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={cn(
          "w-full rounded-full overflow-hidden transition-all duration-300",
          theme.bgColor,
          barHeight,
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            theme.color,
          )}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
}
