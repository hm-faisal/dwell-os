"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";

export function InteractivePlayground() {
  const [activeTab, setActiveTab] = useState<"matcher" | "splitter">("matcher");

  // --- MATCHER STATE ---
  const [userBudget, setUserBudget] = useState(1650);
  const [userSleep, setUserSleep] = useState<"EARLY" | "NIGHT">("NIGHT");
  const [userCleanliness, setUserCleanliness] = useState<
    "CASUAL" | "STANDARD" | "PRISTINE"
  >("PRISTINE");
  const [userPets, setUserPets] = useState<"NO_PETS" | "FRIENDLY">("FRIENDLY");

  // Candidate: Alex (Budget: $1,600, Sleep: NIGHT, Cleanliness: PRISTINE, Pets: FRIENDLY)
  const candidate = {
    name: "Alex Chen",
    role: "Product Designer @ Figma",
    budget: 1600,
    sleep: "NIGHT" as const,
    cleanliness: "PRISTINE" as const,
    pets: "FRIENDLY" as const,
  };

  // Compute live explainable compatibility score
  const budgetDiff = Math.abs(userBudget - candidate.budget);
  let budgetScore = 35;
  if (budgetDiff > 100 && budgetDiff <= 300) budgetScore = 25;
  else if (budgetDiff > 300 && budgetDiff <= 600) budgetScore = 15;
  else if (budgetDiff > 600) budgetScore = 5;

  const sleepScore = userSleep === candidate.sleep ? 25 : 5;
  const cleanScore =
    userCleanliness === candidate.cleanliness
      ? 25
      : userCleanliness === "STANDARD"
        ? 15
        : 5;
  const petScore = userPets === candidate.pets ? 15 : 0;

  const totalScore = Math.min(
    100,
    budgetScore + sleepScore + cleanScore + petScore,
  );

  // --- BILL SPLITTER STATE ---
  const [totalBillDollars, setTotalBillDollars] = useState(285);
  const [splitMode, setSplitMode] = useState<"EQUAL" | "PRORATED">("PRORATED");
  const [samDays, setSamDays] = useState(12); // Sam moved in mid-cycle
  const totalCycleDays = 30;

  // Exact penny calculation
  const totalCents = totalBillDollars * 100;
  let alexCents = 0;
  let taylorCents = 0;
  let samCents = 0;

  if (splitMode === "EQUAL") {
    const baseShare = Math.floor(totalCents / 3);
    const remainder = totalCents - baseShare * 3;
    alexCents = baseShare + remainder;
    taylorCents = baseShare;
    samCents = baseShare;
  } else {
    // Prorated based on days: Alex 30, Taylor 30, Sam samDays
    const totalOccupancyDays = 30 + 30 + samDays;
    alexCents = Math.floor((30 / totalOccupancyDays) * totalCents);
    taylorCents = Math.floor((30 / totalOccupancyDays) * totalCents);
    samCents = Math.floor((samDays / totalOccupancyDays) * totalCents);

    const allocated = alexCents + taylorCents + samCents;
    const remainder = totalCents - allocated;
    alexCents += remainder; // Exact penny conservation
  }

  return (
    <div id="interactive-lab" className="scroll-mt-28 py-16 sm:py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <Badge variant="purple" size="sm">
            {"Show, Don't Tell Interactive Lab"}
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Test Our Core Logic Live
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Experience the precision of DwellOS. No black-box algorithms, no
            rounding disputes—just transparent math built for peaceful living.
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-black/5 dark:border-white/10 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("matcher")}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "matcher"
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              1. Explainable Roommate Matcher
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("splitter")}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "splitter"
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              2. Penny-Perfect Bill Splitter
            </button>
          </div>
        </div>

        {/* Playground Frame */}
        <div className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-black/8 dark:border-white/10 shadow-xl p-6 sm:p-10 transition-all">
          {activeTab === "matcher" ? (
            /* TAB 1: ROOMMATE MATCHER */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Simulator Controls
                  </span>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                    Adjust Your Living Preferences
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Compare your profile in real time against prospective
                    roommate{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                      Alex Chen
                    </span>
                    .
                  </p>
                </div>

                {/* Budget Slider */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Your Monthly Rent Target:
                    </span>
                    <span className="font-mono font-bold text-zinc-950 dark:text-white text-sm">
                      ${userBudget}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="2800"
                    step="50"
                    value={userBudget}
                    onChange={(e) => setUserBudget(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>$1,000</span>
                    <span>{"Alex's budget: $1,600"}</span>
                    <span>$2,800</span>
                  </div>
                </div>

                {/* Sleep Schedule Toggle */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Sleep Rhythm
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserSleep("EARLY")}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                        userSleep === "EARLY"
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      🌅 Early Bird (6 AM - 10 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserSleep("NIGHT")}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                        userSleep === "NIGHT"
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      🌙 Night Owl (Alex matches)
                    </button>
                  </div>
                </div>

                {/* Cleanliness Level */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Household Cleanliness
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "CASUAL", label: "Casual" },
                        { id: "STANDARD", label: "Standard" },
                        { id: "PRISTINE", label: "Pristine ✨" },
                      ] as const
                    ).map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setUserCleanliness(lvl.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                          userCleanliness === lvl.id
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs"
                            : "bg-zinc-50 dark:bg-zinc-800/60 border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pets */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Pet Preferences
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserPets("NO_PETS")}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                        userPets === "NO_PETS"
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      🚫 Pet-Free Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserPets("FRIENDLY")}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                        userPets === "FRIENDLY"
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      🐾 Pet-Friendly (Alex is too)
                    </button>
                  </div>
                </div>
              </div>

              {/* Reactive Scorecard Column */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-950 dark:bg-black text-white border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-base">
                      AC
                    </div>
                    <div>
                      <div className="font-bold text-sm">{candidate.name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {candidate.role}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      totalScore >= 80
                        ? "success"
                        : totalScore >= 60
                          ? "warning"
                          : "neutral"
                    }
                    size="sm"
                  >
                    Verified ID ✓
                  </Badge>
                </div>

                {/* Score Dial */}
                <div className="text-center py-2 space-y-1">
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                      {totalScore}%
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-300">
                    {totalScore >= 80
                      ? "Exceptional Harmony Potential"
                      : totalScore >= 60
                        ? "Moderate Compatibility Match"
                        : "Low Alignment — Lifestyle Variance"}
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                    Algorithm drivers calculated across 4 weighted vector
                    pillars.
                  </p>
                </div>

                {/* Explainable Factor Breakdown */}
                <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Budget Range Delta</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{budgetScore} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">
                      Sleep Schedule Synergy
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        sleepScore >= 20 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      +{sleepScore} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Cleanliness Standard</span>
                    <span
                      className={`font-mono font-bold ${
                        cleanScore >= 20 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      +{cleanScore} pts
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Pet Co-living Fit</span>
                    <span
                      className={`font-mono font-bold ${
                        petScore >= 10 ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      +{petScore} pts
                    </span>
                  </div>
                </div>

                <Link href="/roommates" className="block pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full bg-white text-zinc-950 hover:bg-zinc-100"
                  >
                    Search Verified Roommate Matches →
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* TAB 2: EXACT-CENT BILL SPLITTER */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Splitter Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Financial Integrity Engine
                  </span>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                    Prorate Mid-Cycle Bills in Seconds
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Zero floating-point inaccuracies. Remainder cents are
                    conserved perfectly so no flatmate overpays.
                  </p>
                </div>

                {/* Total Bill Input */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Monthly Shared Utility Total:
                    </span>
                    <span className="font-mono font-bold text-zinc-950 dark:text-white text-base">
                      {formatCurrency(totalCents)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="600"
                    step="5"
                    value={totalBillDollars}
                    onChange={(e) =>
                      setTotalBillDollars(Number(e.target.value))
                    }
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>$60</span>
                    <span>High-usage month</span>
                    <span>$600</span>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Calculation Algorithm
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSplitMode("EQUAL")}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                        splitMode === "EQUAL"
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      Flat Equal Split (33.33%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitMode("PRORATED")}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                        splitMode === "PRORATED"
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-800/60 border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      ⚡ Mid-Cycle Occupancy Proration
                    </button>
                  </div>
                </div>

                {/* Mid-cycle slider for Sam */}
                {splitMode === "PRORATED" && (
                  <div className="space-y-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-zinc-900 dark:text-zinc-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-amber-800 dark:text-amber-300">
                        {"Sam's Occupancy Days this Month:"}
                      </span>
                      <span className="font-mono font-bold text-sm">
                        {samDays} of {totalCycleDays} days
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={samDays}
                      onChange={(e) => setSamDays(Number(e.target.value))}
                      className="w-full h-2 bg-amber-200 dark:bg-amber-900/60 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                      {`Sam moved in on Day ${30 - samDays + 1}. Alex & Taylor resided the full 30 days.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Exact Penny Breakdown Result */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-zinc-950 dark:bg-black text-white border border-white/10 shadow-2xl space-y-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Live Ledger Allocation
                  </span>
                  <h4 className="text-base font-bold mt-1">
                    Conserved Cents Breakdown
                  </h4>
                </div>

                {/* Tenant Cards */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Alex (Primary)</div>
                      <div className="text-[10px] text-zinc-400">
                        30 days occupied (Full cycle)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-emerald-400">
                        {formatCurrency(alexCents)}
                      </div>
                      <div className="text-[9px] text-zinc-400">
                        {((alexCents / totalCents) * 100).toFixed(1)}% share
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Taylor</div>
                      <div className="text-[10px] text-zinc-400">
                        30 days occupied (Full cycle)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-emerald-400">
                        {formatCurrency(taylorCents)}
                      </div>
                      <div className="text-[9px] text-zinc-400">
                        {((taylorCents / totalCents) * 100).toFixed(1)}% share
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Sam (New arrival)</div>
                      <div className="text-[10px] text-amber-300">
                        {samDays} days occupied (Prorated)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-amber-400">
                        {formatCurrency(samCents)}
                      </div>
                      <div className="text-[9px] text-zinc-400">
                        {((samCents / totalCents) * 100).toFixed(1)}% share
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Proof Strip */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1">
                  <div className="flex justify-between font-mono font-bold text-emerald-300">
                    <span>Sum of Allocations:</span>
                    <span>
                      {formatCurrency(alexCents + taylorCents + samCents)}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[10px] flex items-center gap-1.5">
                    <span>✓ Exact penny conservation: 0.00¢ drift</span>
                  </div>
                </div>

                <Link href="/explore" className="block">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full bg-white text-zinc-950 hover:bg-zinc-100"
                  >
                    Discover Fair-Split Shared Homes →
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
