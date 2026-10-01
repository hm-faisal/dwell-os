"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import { showToast } from "@/lib/toast";
import type { User } from "@/types/auth";

interface EmailVerificationBannerProps {
  user: User | null;
}

export function EmailVerificationBanner({
  user,
}: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // If user is verified or no user logged in, do not render banner
  if (!user || user.isEmailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (!user.email) return;
    setIsResending(true);
    setFeedback(null);
    setIsError(false);

    try {
      const res = await authApi.resendVerification(user.email);
      const msg =
        res.message || "Verification email sent! Please check your inbox.";
      setFeedback(msg);
      showToast.success("Verification email sent", {
        description: `Check your inbox at ${user.email}`,
      });
    } catch (err: unknown) {
      setIsError(true);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to resend email. Please try again later.";
      setFeedback(message);
      showToast.error(message, {
        title: "Failed to resend email",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <aside
      aria-label="Email verification alert"
      className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2.5 sm:px-6 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
            !
          </span>
          <p className="font-medium tracking-tight">
            <strong className="font-semibold text-amber-950 dark:text-amber-100">
              Verify your email address:
            </strong>{" "}
            Full platform capabilities are restricted until your account is
            verified.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {feedback && (
            <span
              className={`text-xs ${
                isError
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {feedback}
            </span>
          )}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-600 dark:bg-amber-500 text-white hover:bg-amber-700 dark:hover:bg-amber-600 transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            {isResending ? "Sending..." : "Resend Link"}
          </button>
        </div>
      </div>
    </aside>
  );
}
