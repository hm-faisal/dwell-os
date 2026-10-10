"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { verificationsApi } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import type {
  Verification,
  VerificationStatus,
  VerificationType,
} from "@/types/verification";

export function IdentityVerificationPortal() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedType, setSelectedType] =
    useState<VerificationType>("IDENTITY");
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const loadVerifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await verificationsApi.list();
      setVerifications(data);
    } catch {
      // Ignore if unauthenticated or new user
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (documentUrls.length === 0) {
      showToast.error("Please upload a document to proceed");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await verificationsApi.submit({
        type: selectedType,
        documentUrl: documentUrls[0],
        notes: notes.trim() || undefined,
      });

      showToast.success("Verification document submitted!", {
        description:
          "Our review team typically verifies documents within 24 hours.",
      });

      setVerifications((prev) => [result, ...prev]);
      setDocumentUrls([]);
      setNotes("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit verification";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="success">✓ Verified</Badge>;
      case "IN_REVIEW":
        return <Badge variant="warning">⏳ In Review</Badge>;
      case "REJECTED":
        return <Badge variant="danger">✕ Rejected</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="purple" size="md">
            Trust & Safety
          </Badge>
          <span className="text-xs text-zinc-500">
            ID & Income Verification
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Identity & Document Verification
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl mt-1 leading-relaxed">
          Verify your identity and income credentials to obtain verified
          applicant badges, unlock instant room applications, and build
          confidence with shared-unit roommates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Form Card */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Submit New Verification Document
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Verification Category
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    type: "IDENTITY" as const,
                    label: "Government ID",
                    desc: "Passport, Driver License",
                  },
                  {
                    type: "INCOME" as const,
                    label: "Proof of Income",
                    desc: "Paystubs, Bank Statement",
                  },
                  {
                    type: "EMPLOYMENT" as const,
                    label: "Employment Proof",
                    desc: "Offer Letter, Work Contract",
                  },
                  {
                    type: "REFERENCE_CHECK" as const,
                    label: "Landlord Reference",
                    desc: "Rental history letter",
                  },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSelectedType(item.type)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedType === item.type
                        ? "border-zinc-900 dark:border-white bg-zinc-100/80 dark:bg-zinc-800/80"
                        : "border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15"
                    }`}
                  >
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Upload Document Photo / Scan
              </span>
              <PhotoUploadField
                value={documentUrls}
                onChange={setDocumentUrls}
                maxPhotos={1}
                label="Government ID or Official Document"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="verification-notes"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
              >
                Additional Notes (Optional)
              </label>
              <input
                id="verification-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Current employer: Tech Corp, Senior Analyst"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full"
            >
              Submit for Verification
            </Button>
          </form>
        </div>

        {/* Verification Status & History */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Verification Badges
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Approved verifications are cryptographically anchored and
              badge-stamped onto your public profile and lease applications.
            </p>

            <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
              {isLoading ? (
                <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ) : verifications.length === 0 ? (
                <div className="text-xs text-zinc-400 italic text-center py-4">
                  No verification submissions yet.
                </div>
              ) : (
                verifications.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {v.type.replace(/_/g, " ")}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {formatDate(v.createdAt)}
                      </div>
                    </div>
                    {getStatusBadge(v.status)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
