import type React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-zinc-900 text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 border border-zinc-900/10 dark:border-white/10 active:bg-zinc-950 dark:active:bg-zinc-200",
  secondary:
    "bg-zinc-100/90 text-zinc-900 shadow-xs hover:bg-zinc-200/90 dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-700/90 border border-black/5 dark:border-white/10",
  danger:
    "bg-rose-600 text-white shadow-xs hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 border border-rose-700/20 active:bg-rose-800",
  outline:
    "border border-zinc-200/90 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xs text-zinc-900 dark:text-zinc-100 shadow-xs hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80",
  ghost:
    "hover:bg-zinc-100/80 hover:text-zinc-900 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100 text-zinc-700 dark:text-zinc-300",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 rounded-lg px-3 text-xs gap-1.5",
  md: "h-9 rounded-xl px-4 py-2 text-sm gap-2",
  lg: "h-11 rounded-2xl px-6 py-2.5 text-base gap-2.5",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isActionable = !disabled && !isLoading;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium select-none cursor-pointer",
        "transition-all duration-150 ease-[var(--ease-spring-snappy)]",
        isActionable
          ? "active:scale-[0.97] active:transition-transform active:duration-75"
          : "pointer-events-none opacity-50 active:scale-100",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 focus-visible:ring-offset-2",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
