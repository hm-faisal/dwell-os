"use client";

import { Badge } from "@/components/ui/Badge";

const trustPillars = [
  {
    icon: "🪪",
    title: "Government ID Verification",
    description:
      "Every roommate and property owner can submit government-issued credentials. Verified badges ensure you only co-live with authenticated individuals.",
    stats: "100% ID Verified Community",
  },
  {
    icon: "💳",
    title: "Bank-Grade Stripe Rails",
    description:
      "All rent payments and security deposits route through PCI-DSS Level 1 Stripe checkout sessions. All ledger entries stored as integer minor units (cents).",
    stats: "Zero Floating-Point Drift",
  },
  {
    icon: "📜",
    title: "ESIGN & UETA Compliance",
    description:
      "Our native digital signature canvas captures touch strokes, timestamps, and IP addresses to generate legally binding residential agreements.",
    stats: "Instant PDF Generation",
  },
  {
    icon: "🔍",
    title: "Immutable State Audit Trail",
    description:
      "Every room status change, viewing request, and lease approval is recorded in an append-only audit log accessible to administrators and dispute arbiters.",
    stats: "Cryptographic Event History",
  },
];

export function TrustSecuritySection() {
  return (
    <section
      id="trust-security"
      className="scroll-mt-28 py-16 sm:py-24 relative bg-zinc-100/50 dark:bg-zinc-950/50 border-y border-black/5 dark:border-white/5"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <Badge variant="success" size="sm">
            {"Institutional Trust & Compliance"}
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Security Built Directly Into the Core.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Renting and co-living require mutual trust. We back every
            interaction with identity verification, cryptographic audit trails,
            and regulated payment rails.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPillars.map((p) => (
            <div
              key={p.title}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl">
                  {p.icon}
                </div>
                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  {p.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ {p.stats}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
