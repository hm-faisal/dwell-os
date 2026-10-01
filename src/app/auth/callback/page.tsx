import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallbackHandler } from "@/components/auth/AuthCallbackHandler";

export const metadata: Metadata = {
  title: "Authenticating | DwellOS",
  description: "Completing secure authentication with identity provider.",
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Loading authentication...
            </p>
          </div>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
