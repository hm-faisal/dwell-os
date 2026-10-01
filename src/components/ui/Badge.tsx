import type React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"
    | "purple"
    | "indigo";
  size?: "sm" | "md";
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  success:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/15 dark:text-amber-300",
  danger:
    "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/15 dark:text-rose-300",
  info: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/15 dark:text-sky-300",
  purple:
    "border-purple-500/25 bg-purple-500/10 text-purple-700 dark:border-purple-400/20 dark:bg-purple-500/15 dark:text-purple-300",
  indigo:
    "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-500/15 dark:text-indigo-300",
  neutral:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:border-zinc-400/15 dark:bg-zinc-500/15 dark:text-zinc-300",
};

const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em]",
  md: "px-2.5 py-0.5 text-xs font-semibold tracking-[0.03em]",
};

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border backdrop-blur-xs select-none shadow-2xs transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "AVAILABLE":
      return <Badge variant="success">{status}</Badge>;
    case "RESERVED":
      return <Badge variant="warning">{status}</Badge>;
    case "OCCUPIED":
      return <Badge variant="indigo">{status}</Badge>;
    case "MAINTENANCE":
      return <Badge variant="purple">{status}</Badge>;
    case "ARCHIVED":
      return <Badge variant="neutral">{status}</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
