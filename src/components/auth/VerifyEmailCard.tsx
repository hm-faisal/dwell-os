"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi, getStoredUser, setStoredUser } from "@/lib/api";
import { showToast } from "@/lib/toast";

export function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "success" | "error"
  >(token ? "verifying" : "idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<
    string | null
  >(null);
  const [resendErrorMessage, setResendErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const user = getStoredUser();
    if (user?.email) {
      setResendEmail(user.email);
    }

    if (!token) return;

    let isMounted = true;

    authApi
      .verifyEmail(token)
      .then((res) => {
        if (!isMounted) return;
        setVerificationState("success");
        const msg =
          res.message || "Your email address has been successfully verified.";
        setStatusMessage(msg);
        showToast.success("Email verified successfully!", {
          description: msg,
        });

        if (user) {
          setStoredUser({
            ...user,
            isEmailVerified: true,
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setVerificationState("error");
        const msg =
          err?.message ||
          "Verification link has expired or is invalid. Please request a new one below.";
        setStatusMessage(msg);
        showToast.error(msg, {
          title: "Verification Failed",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendSuccessMessage(null);
    setResendErrorMessage(null);

    if (!resendEmail.trim()) {
      setResendErrorMessage("Please enter your email address.");
      return;
    }

    setIsResending(true);
    try {
      const res = await authApi.resendVerification(resendEmail.trim());
      const msg =
        res.message || "A new verification link has been sent to your inbox.";
      setResendSuccessMessage(msg);
      showToast.success("Verification link sent", {
        description: msg,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to resend verification email. Please try again.";
      setResendErrorMessage(message);
      showToast.error(message, {
        title: "Resend Failed",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {verificationState === "verifying" && (
        <div className="text-center py-6 space-y-4">
          <div className="w-10 h-10 border-3 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Verifying your email...
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Please wait while we validate your security token.
          </p>
        </div>
      )}

      {verificationState === "success" && (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Email Verified!
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
            {statusMessage} You now have full access to rental applications,
            lease signing, and property listings.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              className="w-full"
              onClick={() => router.push("/properties")}
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      )}

      {(verificationState === "error" || verificationState === "idle") && (
        <div className="space-y-6">
          <div className="text-center">
            {verificationState === "error" ? (
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl font-bold mb-3">
                !
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto text-xl font-bold mb-3">
                ✉
              </div>
            )}

            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {verificationState === "error"
                ? "Verification Expired"
                : "Verify your email"}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {verificationState === "error"
                ? statusMessage
                : "Check your inbox for a verification link, or request a new one below."}
            </p>
          </div>

          {resendSuccessMessage && (
            <div className="p-3.5 text-sm rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300">
              {resendSuccessMessage}
            </div>
          )}

          {resendErrorMessage && (
            <div className="p-3.5 text-sm rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300">
              {resendErrorMessage}
            </div>
          )}

          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label
                htmlFor="resendEmail"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Email address
              </label>
              <Input
                id="resendEmail"
                type="email"
                required
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isResending}>
              Resend Verification Email
            </Button>
          </form>

          <div className="text-center text-sm pt-2 text-zinc-600 dark:text-zinc-400">
            <Link
              href="/properties"
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs"
            >
              ← Skip for now and return to dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
