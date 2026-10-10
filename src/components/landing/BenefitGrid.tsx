"use client";

import { Badge } from "@/components/ui/Badge";

const benefits = [
  {
    icon: "🛡️",
    badgeText: "Transaction-Safe Inventory",
    badgeVariant: "success" as const,
    headline: "Zero Double-Bookings Guaranteed",
    subheadline:
      "When you apply, our database initiates an exclusive priority hold. Competing applications are atomically locked out, protecting you from ghosting and last-minute bait-and-switch.",
    codePill: "PostgreSQL Row-Level Locks + Optimistic Concurrency",
  },
  {
    icon: "🔍",
    badgeText: "Transparent Matchmaking",
    badgeVariant: "purple" as const,
    headline: "Explainable Roommate Chemistry",
    subheadline:
      "No opaque AI black boxes. We show you exactly why you match with a prospective flatmate—analyzing sleep schedules, cleanliness standards, work habits, and budget deltas side by side.",
    codePill: "Explainable Multi-Vector Scoring Engine",
  },
  {
    icon: "⚡",
    badgeText: "Exact-Cent Ledger",
    badgeVariant: "info" as const,
    headline: "Penny-Perfect Mid-Cycle Bill Splitting",
    subheadline:
      "If a new roommate moves in on day 12 of the month, they only pay for their 18 days of power and WiFi. Our pure math engine guarantees every cent is conserved with zero rounding drift.",
    codePill: "Pure-Function Proration Engine + 100% Penny Conservation",
  },
  {
    icon: "✍️",
    badgeText: "Instant Paperless Agreements",
    badgeVariant: "warning" as const,
    headline: "Touchscreen E-Signatures in 60 Seconds",
    subheadline:
      "Generate legally binding residential leases in one tap. Sign effortlessly on any touch device with biometric stroke smoothing, automated audit logging, and encrypted storage.",
    codePill: "HTML5 Canvas Stroke Engine + Legal Audit Trail",
  },
];

export function BenefitGrid() {
  return (
    <section
      id="features-architecture"
      className="scroll-mt-28 py-16 sm:py-24 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <Badge variant="neutral" size="sm">
            {"Product Architecture & User Outcomes"}
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Hard Engineering Under The Hood.
            <br />
            Effortless Living On The Surface.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            We solved the notoriously messy problems of shared living by
            treating housing logistics with the mathematical rigor of financial
            software.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {benefits.map((b) => (
            <div
              key={b.headline}
              className="p-7 sm:p-9 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                    {b.icon}
                  </div>
                  <Badge variant={b.badgeVariant} size="sm">
                    {b.badgeText}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                    {b.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {b.subheadline}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-mono">Architecture:</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-300 font-semibold bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg">
                  {b.codePill}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
