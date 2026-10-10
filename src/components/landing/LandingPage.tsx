"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AudienceToggleSection } from "./AudienceToggleSection";
import { BenefitGrid } from "./BenefitGrid";
import { InteractivePlayground } from "./InteractivePlayground";
import { LandingNavbar } from "./LandingNavbar";
import { TrustSecuritySection } from "./TrustSecuritySection";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The mid-cycle bill splitting alone saved our flat. Sam moved in halfway through August and our old spreadsheet caused endless passive aggression. DwellOS prorated it to the exact penny in 5 seconds.",
    name: "Elena Morris",
    role: "Roommate in Williamsburg, Brooklyn",
    initials: "EM",
    avatarBg: "bg-indigo-500/20 text-indigo-500",
  },
  {
    quote:
      "Applying with a 24-hour priority hold changed the entire experience. I wasn't stressed about somebody swooping in while the landlord reviewed my paystub. Signed my lease on my iPad at 11 PM.",
    name: "David Kim",
    role: "Tenant in San Francisco, CA",
    initials: "DK",
    avatarBg: "bg-teal-500/20 text-teal-600",
  },
  {
    quote:
      "I manage 18 bedrooms across 4 properties. The atomic application approval prevents any double-booking mistakes. And having the current flatmates co-approve applicants cut our turnover in half.",
    name: "Marcus Vance",
    role: "Property Owner & Host, Chicago",
    initials: "MR",
    avatarBg: "bg-amber-500/20 text-amber-600",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
      {/* Sticky Apple-Glass Header */}
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-teal-400/10 to-amber-300/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
            {/* Top Eyebrow */}
            <div className="inline-flex items-center gap-2 p-1.5 pr-4 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-xs animate-in fade-in duration-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1.5" />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                The Housing OS with Zero Ambiguity
              </span>
              <Badge variant="purple" size="sm">
                Next-Gen
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.08]">
              Shared Living,
              <br />
              <span className="bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                Engineered for Harmony.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
              No more messy group chats, spreadsheet splits, or sketchy
              listings. DwellOS unifies verified rooms with atomic reservation
              holds, explainable roommate chemistry, and penny-perfect bill
              splitting.
            </p>

            {/* Split CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <Link href="/explore" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto px-8 h-12 shadow-lg hover:shadow-xl text-sm font-semibold"
                >
                  Find Your Next Room →
                </Button>
              </Link>
              <Link href="/properties/new" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-7 h-12 text-sm font-semibold"
                >
                  List Your Property
                </Button>
              </Link>
            </div>

            {/* Secondary Link */}
            <div className="pt-1 text-xs text-zinc-500">
              Looking for a compatible roommate first?{" "}
              <Link
                href="/roommates"
                className="font-semibold text-zinc-900 dark:text-white underline underline-offset-4 hover:opacity-80"
              >
                Browse Roommate Profiles
              </Link>
            </div>

            {/* Micro Trust Proof Strip */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-xs text-zinc-600 dark:text-zinc-400">
              <div className="p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 flex items-center justify-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Zero Double-Bookings (Atomic Locks)</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 flex items-center justify-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>100% ID Verified Community</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 flex items-center justify-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Penny-Perfect Bill Splitting (0.00¢ Drift)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 1. INTERACTIVE "SHOW, DON'T TELL" PLAYGROUND WIDGET */}
        <InteractivePlayground />

        {/* 2. DYNAMIC AUDIENCE TOGGLE SECTION (RENTERS VS OWNERS) */}
        <AudienceToggleSection />

        {/* 3. TECHNICAL BENEFIT TRANSLATION GRID */}
        <BenefitGrid />

        {/* 4. INSTITUTIONAL TRUST & SECURITY ANCHORS */}
        <TrustSecuritySection />

        {/* 5. SOCIAL PROOF & TESTIMONIALS */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge variant="purple" size="sm">
              Voices from Modern Co-Living
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Built for Those Who Value Peace of Mind
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/10 shadow-xs space-y-4"
              >
                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                  <div
                    className={`w-9 h-9 rounded-full ${t.avatarBg} flex items-center justify-center font-bold text-xs`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM HIGH-CONVERTING CTA BANNER */}
        <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-zinc-950 text-white p-8 sm:p-14 border border-white/10 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/20 to-indigo-500/0 blur-2xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 p-1 px-3 rounded-full bg-white/10 text-xs text-zinc-300">
              <span>🚀</span> Ready in 60 Seconds
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-xl mx-auto">
              Ready to Upgrade How You Live and Lease?
            </h2>

            <p className="text-xs sm:text-base text-zinc-400 max-w-md mx-auto">
              Join thousands of verified renters, respectful roommates, and
              proactive property owners on DwellOS today.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/explore">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-zinc-950 hover:bg-zinc-100 font-bold px-8"
                >
                  Start Exploring Listings →
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8"
                >
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black/8 dark:border-white/10 bg-white/60 dark:bg-zinc-950/60 py-12 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div className="space-y-2">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Discover
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/explore"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Search Rooms & Units
                  </Link>
                </li>
                <li>
                  <Link
                    href="/roommates"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Roommate Matching
                  </Link>
                </li>
                <li>
                  <Link
                    href="/explore"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Verified Vacancies
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Owners & Hosts
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/properties"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Portfolio Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties/new"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Add New Property
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Inventory Status Board
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Engineering & Trust
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="#interactive-lab"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Bill Splitting Engine
                  </Link>
                </li>
                <li>
                  <Link
                    href="#trust-security"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Identity Verification
                  </Link>
                </li>
                <li>
                  <Link
                    href="#trust-security"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Audit Trail & Logs
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Account
              </div>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-zinc-900 dark:hover:text-white"
                  >
                    Password Reset
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-[10px]">
                D
              </div>
              <span>© 2026 DwellOS Technologies Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
