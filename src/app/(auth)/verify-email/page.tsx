import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard";

export const metadata: Metadata = {
  title: "Verify Email | DwellOS",
  description: "Verify your email address to unlock full access to DwellOS.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading verification details...
          </p>
        </div>
      }
    >
      <VerifyEmailCard />
    </Suspense>
  );
}
