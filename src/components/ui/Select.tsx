import type React from "react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export function Select({
  label,
  error,
  options,
  id,
  className,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400 select-none"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "flex h-9.5 w-full appearance-none rounded-xl border px-3.5 py-1.5 pr-8 text-sm transition-all duration-150 ease-[var(--ease-spring-snappy)] cursor-pointer",
            "bg-zinc-100/70 dark:bg-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900",
            "text-zinc-900 dark:text-zinc-100",
            "focus-visible:outline-hidden focus-visible:ring-3",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-rose-500/80 bg-rose-50/30 dark:bg-rose-950/20 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
              : "border-zinc-200/90 dark:border-zinc-700/70 hover:border-zinc-300 dark:hover:border-zinc-600 focus-visible:border-zinc-900 dark:focus-visible:border-white focus-visible:ring-zinc-900/15 dark:focus-visible:ring-white/15",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 dark:text-zinc-500">
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              d="M7 8.5l3 3 3-3"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium tracking-tight">
          {error}
        </p>
      )}
    </div>
  );
}
