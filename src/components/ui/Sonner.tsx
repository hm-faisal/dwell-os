"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-zinc-900 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-800 dark:group-[.toaster]:shadow-2xl font-sans rounded-xl p-4 text-sm border",
          description:
            "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400 text-xs mt-1",
          actionButton:
            "group-[.toast]:bg-zinc-900 group-[.toast]:text-zinc-50 dark:group-[.toast]:bg-zinc-50 dark:group-[.toast]:text-zinc-900 font-medium text-xs rounded-lg px-3 py-1.5 transition-opacity hover:opacity-90 cursor-pointer",
          cancelButton:
            "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 dark:group-[.toast]:bg-zinc-800 dark:group-[.toast]:text-zinc-400 font-medium text-xs rounded-lg px-3 py-1.5 cursor-pointer",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:text-emerald-700 dark:group-[.toaster]:text-emerald-300",
          error:
            "group-[.toaster]:border-rose-500/30 group-[.toaster]:text-rose-700 dark:group-[.toaster]:text-rose-300",
          warning:
            "group-[.toaster]:border-amber-500/30 group-[.toaster]:text-amber-700 dark:group-[.toaster]:text-amber-300",
          info: "group-[.toaster]:border-sky-500/30 group-[.toaster]:text-sky-700 dark:group-[.toaster]:text-sky-300",
        },
      }}
      {...props}
    />
  );
}
