"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function AudienceToggleSection() {
  const [audience, setAudience] = useState<"renters" | "owners">("renters");

  return (
    <section
      id="audience-solutions"
      className="scroll-mt-28 py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Pill Switch */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="info" size="sm">
            Engineered For Both Sides of the Market
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Tailored Workflows. Zero Compromise.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            {
              "Whether you're looking for a peaceful room with trustworthy flatmates or leasing an entire 24-unit portfolio, DwellOS eliminates the chaos."
            }
          </p>

          {/* Audience Switch Toggle */}
          <div className="inline-flex p-1.5 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-black/5 dark:border-white/10 mt-3">
            <button
              type="button"
              onClick={() => setAudience("renters")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                audience === "renters"
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              🙋 For Renters & Roommates
            </button>
            <button
              type="button"
              onClick={() => setAudience("owners")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                audience === "owners"
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              🏢 For Property Owners & Managers
            </button>
          </div>
        </div>

        {/* Dynamic Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Features Column */}
          <div className="lg:col-span-6 space-y-5">
            {audience === "renters" ? (
              <>
                <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-black/6 dark:border-white/10 shadow-sm space-y-2.5 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50">
                      Scam-Free Discovery & True Availability
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Filter by exact move-in date. Our state engine hides rooms
                    that are already reserved or occupied. Toggle effortlessly
                    between private entire-unit listings and open bedrooms in
                    co-living apartments.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-black/6 dark:border-white/10 shadow-sm space-y-2.5 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏳</span>
                    <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50">
                      24-Hour Atomic Priority Hold
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    When you submit an application, our database places an
                    exclusive 24-hour hold on the room. No bidding wars, no
                    secret price bumps, and no landlord ghosting.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-black/6 dark:border-white/10 shadow-sm space-y-2.5 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✍️</span>
                    <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50">
                      Digital Canvas Leases & Exact Splitting
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Review and sign legally binding leases right on your phone.
                    Once moved in, split electricity, WiFi, and water down to
                    the exact penny with automatic mid-cycle move-in proration.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link href="/explore">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Explore Available Rooms →
                    </Button>
                  </Link>
                  <Link href="/roommates">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Browse Roommate Profiles
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-black/6 dark:border-white/10 shadow-sm space-y-2.5 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔒</span>
                    <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50">
                      Zero Double-Bookings Guarantee
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Our atomic row locks ensure room capacity is never breached.
                    Approving one tenant atomically rejects competing
                    applications and updates inventory everywhere in
                    milliseconds.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-black/6 dark:border-white/10 shadow-sm space-y-2.5 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💳</span>
                    <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50">
                      Automated Stripe Rent Collection
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Tenants pay rent and security deposits through single-click
                    Stripe checkout sessions. Invoices reconcile automatically
                    with minor-unit integer precision. Zero spreadsheets.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white/70 dark:bg-zinc-900/70 border border-black/6 dark:border-white/10 shadow-sm space-y-2.5 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    <h3 className="font-bold text-base text-zinc-950 dark:text-zinc-50">
                      Peer Co-Approval Voting Reduces Churn
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Protect property harmony by allowing current unit residents
                    to review and vote on prospective roommates before final
                    lease generation. Fewer disputes mean longer leases.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link href="/properties/new">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      List Your Property Free →
                    </Button>
                  </Link>
                  <Link href="/properties">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      View Owner Portfolio Demo
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Interactive Mock Window Column */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-zinc-950 text-white p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5">
              {/* Fake Browser / OS Window Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-zinc-400 font-mono ml-2">
                    {audience === "renters"
                      ? "dwellos.app/applications/hold-active"
                      : "dwellos.app/owner/kanban-decision"}
                  </span>
                </div>
                <Badge
                  variant={audience === "renters" ? "warning" : "success"}
                  size="sm"
                >
                  {audience === "renters"
                    ? "Hold Priority Active"
                    : "Atomic Lock Safe"}
                </Badge>
              </div>

              {audience === "renters" ? (
                /* Renter UI Mockup */
                <div className="space-y-4">
                  {/* Active Hold Countdown Banner */}
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-300">
                        Room 2B Priority Reservation Active
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Room locked exclusively for your review
                      </div>
                    </div>
                    <div className="font-mono text-base font-extrabold text-amber-300 tracking-wider">
                      23:48:19
                    </div>
                  </div>

                  {/* Room Card Preview */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold">
                          The Broadway Commons — Room 2B
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          SoHo, New York • Move-in Oct 15
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        $1,450/mo
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        Private Bath
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        In-Unit Laundry
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Verified Landlord ✓
                      </span>
                    </div>
                  </div>

                  {/* E-Signature Ready Notice */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>✍️</span>
                      <span className="text-zinc-300">
                        Digital Lease Ready to Sign
                      </span>
                    </div>
                    <span className="text-emerald-400 font-semibold text-[11px]">
                      Instant E-Sign
                    </span>
                  </div>
                </div>
              ) : (
                /* Owner UI Mockup */
                <div className="space-y-4">
                  {/* Portfolio KPI Quick Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                        Portfolio Occupancy
                      </span>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        96.4%
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        14 of 15 rooms rented
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                        Monthly Net Revenue
                      </span>
                      <div className="text-xl font-bold font-mono text-white mt-1">
                        $21,750
                      </div>
                      <span className="text-[10px] text-emerald-400">
                        Zero late balances
                      </span>
                    </div>
                  </div>

                  {/* Kanban Decision Simulation */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-300">
                        Pending Applicant: Sarah Miller
                      </span>
                      <Badge variant="info" size="sm">
                        Credit: 760
                      </Badge>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[11px] text-zinc-400">
                      {
                        'Roommate co-approval tally: 3 of 3 roommates voted "APPROVE" 👍'
                      }
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-center cursor-pointer transition-colors shadow-xs">
                        Approve &amp; Lock Room
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-medium cursor-pointer">
                        Reject
                      </div>
                    </div>
                    <p className="text-[9px] text-zinc-500 text-center">
                      ⚡ Action executes transaction-level lock; competing
                      applications atomically rejected.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
