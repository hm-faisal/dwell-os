"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import {
  authApi,
  clearStoredTokens,
  getStoredToken,
  getStoredUser,
  setStoredToken,
} from "@/lib/api";
import type { User } from "@/types/auth";

export function DashboardNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [inputToken, setInputToken] = useState("");

  useEffect(() => {
    const currentToken = getStoredToken();
    setTokenState(currentToken);
    const localUser = getStoredUser();
    if (localUser) {
      setUser(localUser);
    }

    if (currentToken) {
      authApi
        .getMe()
        .then((profile) => setUser(profile))
        .catch(() => {});
    }
  }, []);

  const handleSaveToken = () => {
    if (inputToken.trim()) {
      setStoredToken(inputToken.trim());
      setTokenState(inputToken.trim());
      authApi
        .getMe()
        .then((profile) => setUser(profile))
        .catch(() => {});
    } else {
      clearStoredTokens();
      setTokenState(null);
      setUser(null);
    }
    setShowTokenModal(false);
  };

  const handleLogout = async () => {
    await authApi.logout();
    setTokenState(null);
    setUser(null);
    router.push("/login");
  };

  const navItems = [
    { label: "Properties", href: "/properties" },
    { label: "Add Property", href: "/properties/new" },
  ];

  return (
    <>
      {/* Top Floating Glass Navbar */}
      <header className="sticky top-0 z-40 w-full apple-glass-heavy border-b border-black/5 dark:border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/properties"
              className="flex items-center gap-2.5 group active:scale-95 transition-transform duration-100"
            >
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 dark:from-white dark:to-zinc-200 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-base shadow-xs border border-white/20 dark:border-white/40">
                D
              </div>
              <span className="font-semibold text-lg tracking-[-0.025em] text-zinc-900 dark:text-white">
                DwellOS
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-xs border border-black/5 dark:border-white/5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-[-0.01em] transition-all duration-150 ease-[var(--ease-spring-snappy)] select-none ${
                      isActive
                        ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-white/40 dark:hover:bg-zinc-700/40 active:scale-95"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline tracking-tight">
                  {user.name} ·{" "}
                  <span className="font-caption-tracked text-[10px] bg-zinc-200/60 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded-md text-zinc-700 dark:text-zinc-300">
                    {user.role}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-700/80 transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all active:scale-95"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all active:scale-95 shadow-xs"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setInputToken(token || "");
                setShowTokenModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-700/80 transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
                  token ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
              <span className="hidden sm:inline">
                {token ? "Authenticated" : "Set Auth Token"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Persistent Email Verification Warning Banner */}
      <EmailVerificationBanner user={user} />

      {/* Auth Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 dark:bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-7 w-full max-w-md apple-rim-highlight animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold tracking-[-0.015em] text-zinc-950 dark:text-zinc-50">
              Authentication Token
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
              Paste a Landlord/Owner JWT access token to authenticate API calls
              against the DwellOS backend.
            </p>
            <textarea
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              rows={4}
              className="mt-3.5 w-full p-3 text-xs font-mono bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200/90 dark:border-zinc-700/70 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-colors"
            />
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowTokenModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToken}
                className="px-4 py-1.5 text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                Save Token
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
