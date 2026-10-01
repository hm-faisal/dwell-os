"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi, setStoredRefreshToken, setStoredToken } from "@/lib/api";

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (!token) {
      setError("No authentication token received from identity provider.");
      return;
    }

    setStoredToken(token);
    if (refreshToken) {
      setStoredRefreshToken(refreshToken);
    }

    authApi
      .getMe()
      .then(() => {
        router.push("/properties");
      })
      .catch((err) => {
        setError(err?.message || "Failed to load user session.");
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full py-2 px-4 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Back to Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
