"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-black/8 dark:border-white/10 shadow-xs py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-base shadow-md group-hover:scale-105 transition-transform duration-200">
              D
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-zinc-950 dark:text-zinc-50">
                DwellOS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Link
              href="#interactive-lab"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Interactive Lab
            </Link>
            <Link
              href="#audience-solutions"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Renters & Owners
            </Link>
            <Link
              href="#features-architecture"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Platform Architecture
            </Link>
            <Link
              href="#trust-security"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Security & Trust
            </Link>
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="primary" size="sm" className="shadow-xs">
                Explore Rooms →
              </Button>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/explore">
              <Button variant="primary" size="sm">
                Explore
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              aria-label="Toggle Navigation Menu"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-black/8 dark:border-white/10 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Link
                href="#interactive-lab"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Interactive Lab
              </Link>
              <Link
                href="#audience-solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Renters & Owners
              </Link>
              <Link
                href="#features-architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Platform Architecture
              </Link>
              <Link
                href="#trust-security"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Security & Trust
              </Link>
            </div>
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex gap-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/roommates" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">
                  Roommates
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
