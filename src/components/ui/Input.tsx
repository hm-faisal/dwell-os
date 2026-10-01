import type React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400 select-none"
        >
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "flex h-9.5 w-full rounded-xl border px-3.5 py-1.5 text-sm transition-all duration-150 ease-[var(--ease-spring-snappy)]",
          "bg-zinc-100/70 dark:bg-zinc-800/60 focus:bg-white dark:focus:bg-zinc-900",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100",
          "focus-visible:outline-hidden focus-visible:ring-3",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-rose-500/80 bg-rose-50/30 dark:bg-rose-950/20 focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
            : "border-zinc-200/90 dark:border-zinc-700/70 hover:border-zinc-300 dark:hover:border-zinc-600 focus-visible:border-zinc-900 dark:focus-visible:border-white focus-visible:ring-zinc-900/15 dark:focus-visible:ring-white/15",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium tracking-tight">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>
      )}
    </div>
  );
}
