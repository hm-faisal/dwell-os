import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 active:scale-95 transition-transform duration-100"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 dark:from-white dark:to-zinc-200 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xl shadow-sm border border-white/20 dark:border-white/40">
            D
          </div>
          <span className="font-semibold text-2xl tracking-[-0.03em] text-zinc-950 dark:text-white">
            DwellOS
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="apple-card py-8 px-6 sm:px-10 apple-rim-highlight rounded-3xl border border-black/8 dark:border-white/10 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
