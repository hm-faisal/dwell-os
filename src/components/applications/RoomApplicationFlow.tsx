"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { useRoomApplication } from "@/hooks/useRoomApplication";
import {
  centsToDollars,
  dollarsToCents,
  formatCurrency,
  formatDate,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { ApplicationEmployment } from "@/lib/validations/roomApplication";

export interface RoomApplicationFlowProps {
  roomId: string;
  roomName: string;
  propertyName?: string;
  rentCents: number;
  depositCents?: number;
  initialHoldExpiresAt?: string | null;
  onSuccess?: (applicationId: string) => void;
  onCancel?: () => void;
}

export function RoomApplicationFlow({
  roomId,
  roomName,
  propertyName = "Residential Residence",
  rentCents,
  depositCents = rentCents,
  initialHoldExpiresAt,
  onSuccess,
  onCancel,
}: RoomApplicationFlowProps) {
  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    personalInfo,
    setPersonalInfo,
    requestedMoveInDate,
    setRequestedMoveInDate,
    intendedStayMonths,
    setIntendedStayMonths,
    employment,
    setEmployment,
    references,
    addReference,
    removeReference,
    updateReference,
    emergencyContact,
    setEmergencyContact,
    documents,
    addDocument,
    removeDocument,
    notes,
    setNotes,
    agreedToHoldPolicy,
    setAgreedToHoldPolicy,
    isSubmitting,
    submitApplication,
    holdExpiresAt,
    remainingSeconds,
    isHoldExpired,
    formatTimer,
    submittedApplicationId,
  } = useRoomApplication({
    roomId,
    roomName,
    rentCents,
    initialHoldExpiresAt,
    onSuccess,
  });

  const [docUploadType, setDocUploadType] = useState<
    | "GOVERNMENT_ID"
    | "PAYSTUB"
    | "BANK_STATEMENT"
    | "TAX_RETURN"
    | "OFFER_LETTER"
  >("GOVERNMENT_ID");

  const steps = [
    { number: 1, title: "Personal Details", subtitle: "Identity & Move-in" },
    { number: 2, title: "Employment & Income", subtitle: "Financial Profile" },
    { number: 3, title: "Documents", subtitle: "Verification Uploads" },
    { number: 4, title: "Review & Hold", subtitle: "Lock Priority Room" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Summary & Room Context */}
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {propertyName}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <Badge variant="purple" size="sm">
              Priority Reservation Available
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mt-1">
            Application for {roomName}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Rent:{" "}
            <strong className="text-zinc-900 dark:text-zinc-100">
              {formatCurrency(rentCents)}/mo
            </strong>{" "}
            · Deposit:{" "}
            <strong className="text-zinc-900 dark:text-zinc-100">
              {formatCurrency(depositCents)}
            </strong>
          </p>
        </div>

        {/* Live Reservation Hold Status */}
        {holdExpiresAt && (
          <div
            className={cn(
              "p-3.5 rounded-2xl border flex items-center gap-3 shrink-0 transition-colors",
              isHoldExpired
                ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200",
            )}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 shadow-xs text-base">
              {isHoldExpired ? "⚠️" : "⏱️"}
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider">
                {isHoldExpired
                  ? "Hold Lock Expired"
                  : "Active Reservation Hold"}
              </div>
              <div className="font-mono text-base font-bold">
                {isHoldExpired ? "00:00:00" : formatTimer(remainingSeconds)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hold Expiration Alert (Edge Case) */}
      {isHoldExpired && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="space-y-0.5">
            <span className="font-bold">
              Reservation Hold Window Has Elapsed
            </span>
            <p className="text-rose-700 dark:text-rose-300 text-[11px]">
              The exclusive 48-hour room lock has expired. The room may now
              accept competing tenant applications. You can still complete your
              submission to request an extended review.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="shrink-0 text-xs"
          >
            Refresh Room Status
          </Button>
        </div>
      )}

      {/* Step Progress Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((s) => {
          const isActive = currentStep === s.number;
          const isComplete =
            currentStep > s.number || Boolean(submittedApplicationId);
          return (
            <div
              key={s.number}
              className={cn(
                "p-3 rounded-2xl border transition-all text-left",
                isActive
                  ? "bg-white dark:bg-zinc-900 border-zinc-950 dark:border-white shadow-xs"
                  : isComplete
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-300"
                    : "bg-zinc-100/60 dark:bg-zinc-800/40 border-transparent text-zinc-400",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center",
                    isActive
                      ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950"
                      : isComplete
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500",
                  )}
                >
                  {isComplete ? "✓" : s.number}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                  Step {s.number}
                </span>
              </div>
              <div className="font-semibold text-xs mt-2 text-zinc-900 dark:text-zinc-100">
                {s.title}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {s.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-step Form Content */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/10 shadow-sm space-y-6">
        {/* STEP 1: Personal Background & Move-In Date */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                Personal Background & Move-in Timing
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Ensure your full legal name and contact details match your
                government identification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="app-full-name"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Full Legal Name *
                </label>
                <input
                  id="app-full-name"
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="e.g. Sarah J. Connor"
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="app-email-address"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Email Address *
                </label>
                <input
                  id="app-email-address"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                  }
                  placeholder="name@example.com"
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="app-phone-number"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Phone Number (E.164) *
                </label>
                <input
                  id="app-phone-number"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, phone: e.target.value })
                  }
                  placeholder="+14155552671"
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="app-date-of-birth"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Date of Birth *
                </label>
                <input
                  id="app-date-of-birth"
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      dateOfBirth: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label
                  htmlFor="app-current-address"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Current Residential Address *
                </label>
                <input
                  id="app-current-address"
                  type="text"
                  value={personalInfo.currentAddress}
                  onChange={(e) =>
                    setPersonalInfo({
                      ...personalInfo,
                      currentAddress: e.target.value,
                    })
                  }
                  placeholder="Street Address, Apt / Suite, City, State, ZIP"
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="app-move-in-date"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Requested Move-in Date *
                </label>
                <input
                  id="app-move-in-date"
                  type="date"
                  value={requestedMoveInDate}
                  onChange={(e) => setRequestedMoveInDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="app-lease-duration"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Intended Lease Duration (Months)
                </label>
                <select
                  id="app-lease-duration"
                  value={intendedStayMonths}
                  onChange={(e) =>
                    setIntendedStayMonths(Number(e.target.value))
                  }
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                >
                  <option value={3}>3 Months (Short Term)</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (Standard Lease)</option>
                  <option value={24}>24 Months</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Employment, Income & References */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                Employment, Income & Reference Verification
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Property managers verify income-to-rent ratio (typically
                requiring 2.5x to 3x monthly rent).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="app-employer-name"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Employer or University Name *
                </label>
                <input
                  id="app-employer-name"
                  type="text"
                  value={employment.employerName}
                  onChange={(e) =>
                    setEmployment({
                      ...employment,
                      employerName: e.target.value,
                    })
                  }
                  placeholder="e.g. Stripe, MIT, Self-employed"
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="app-job-title"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Current Role / Title *
                </label>
                <input
                  id="app-job-title"
                  type="text"
                  value={employment.jobTitle}
                  onChange={(e) =>
                    setEmployment({ ...employment, jobTitle: e.target.value })
                  }
                  placeholder="e.g. Software Engineer, Postgrad Student"
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="app-employment-status"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Employment Status
                </label>
                <select
                  id="app-employment-status"
                  value={employment.employmentStatus}
                  onChange={(e) =>
                    setEmployment({
                      ...employment,
                      employmentStatus: e.target
                        .value as ApplicationEmployment["employmentStatus"],
                    })
                  }
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="SELF_EMPLOYED">
                    Self Employed / Freelancer
                  </option>
                  <option value="STUDENT">Student</option>
                  <option value="RETIRED">Retired</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="app-monthly-income"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Gross Monthly Income ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-zinc-400 text-sm">
                    $
                  </span>
                  <input
                    id="app-monthly-income"
                    type="number"
                    value={centsToDollars(employment.monthlyIncomeCents)}
                    onChange={(e) =>
                      setEmployment({
                        ...employment,
                        monthlyIncomeCents: dollarsToCents(e.target.value),
                      })
                    }
                    placeholder="5000"
                    min={0}
                    step={100}
                    className="w-full pl-8 pr-3 p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* References Section */}
            <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Rental or Professional References
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Previous landlords, supervisors, or university advisors.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReference}
                  className="text-xs"
                >
                  + Add Reference
                </Button>
              </div>

              {references.map((ref, idx) => (
                <div
                  key={`ref-${ref.name || "item"}-${idx}`}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
                >
                  <div>
                    <label
                      htmlFor={`app-ref-name-${idx}`}
                      className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id={`app-ref-name-${idx}`}
                      type="text"
                      value={ref.name}
                      onChange={(e) =>
                        updateReference(idx, { name: e.target.value })
                      }
                      placeholder="Jane Miller"
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`app-ref-rel-${idx}`}
                      className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1"
                    >
                      Relationship
                    </label>
                    <input
                      id={`app-ref-rel-${idx}`}
                      type="text"
                      value={ref.relationship}
                      onChange={(e) =>
                        updateReference(idx, { relationship: e.target.value })
                      }
                      placeholder="Previous Landlord"
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`app-ref-phone-${idx}`}
                      className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      id={`app-ref-phone-${idx}`}
                      type="tel"
                      value={ref.phone}
                      onChange={(e) =>
                        updateReference(idx, { phone: e.target.value })
                      }
                      placeholder="+14155550192"
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id={`app-ref-email-${idx}`}
                      type="email"
                      aria-label="Reference Email"
                      value={ref.email}
                      onChange={(e) =>
                        updateReference(idx, { email: e.target.value })
                      }
                      placeholder="jane@example.com"
                      className="flex-1 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                    />
                    {references.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReference(idx)}
                        className="text-rose-500 hover:text-rose-700 p-2 text-xs cursor-pointer"
                        title="Remove reference"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Contact */}
            <div className="pt-3 border-t border-black/5 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Emergency Contact
                </h4>
              </div>
              <div>
                <label
                  htmlFor="app-emg-name"
                  className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1"
                >
                  Name
                </label>
                <input
                  id="app-emg-name"
                  type="text"
                  value={emergencyContact.name}
                  onChange={(e) =>
                    setEmergencyContact({
                      ...emergencyContact,
                      name: e.target.value,
                    })
                  }
                  placeholder="Contact Name"
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="app-emg-rel"
                  className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1"
                >
                  Relationship
                </label>
                <input
                  id="app-emg-rel"
                  type="text"
                  value={emergencyContact.relationship}
                  onChange={(e) =>
                    setEmergencyContact({
                      ...emergencyContact,
                      relationship: e.target.value,
                    })
                  }
                  placeholder="e.g. Sister, Parent"
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="app-emg-phone"
                  className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1"
                >
                  Phone
                </label>
                <input
                  id="app-emg-phone"
                  type="tel"
                  value={emergencyContact.phone}
                  onChange={(e) =>
                    setEmergencyContact({
                      ...emergencyContact,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+14155550199"
                  className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Required Verification Document Uploads */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                Required Verification Documents
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Attach proof of identity and income. All files are securely
                encrypted and access-controlled.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 space-y-1.5">
                <label
                  htmlFor="app-doc-classification"
                  className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
                >
                  Document Classification
                </label>
                <select
                  id="app-doc-classification"
                  value={docUploadType}
                  onChange={(e) =>
                    setDocUploadType(
                      e.target.value as
                        | "GOVERNMENT_ID"
                        | "PAYSTUB"
                        | "BANK_STATEMENT"
                        | "TAX_RETURN"
                        | "OFFER_LETTER",
                    )
                  }
                  className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="GOVERNMENT_ID">
                    Government Photo ID (Passport / Drivers License)
                  </option>
                  <option value="PAYSTUB">
                    Recent Paystub (Last 30-60 Days)
                  </option>
                  <option value="BANK_STATEMENT">
                    Bank Statement Proof of Funds
                  </option>
                  <option value="TAX_RETURN">W-2 / Tax Return</option>
                  <option value="OFFER_LETTER">Employment Offer Letter</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <PhotoUploadField
                  maxPhotos={5}
                  value={[]}
                  onChange={(urls) => {
                    const latest = urls[urls.length - 1];
                    if (latest) {
                      addDocument({
                        name: `${docUploadType.replace(/_/g, " ")} (${documents.length + 1})`,
                        type: docUploadType,
                        fileUrl: latest,
                      });
                    }
                  }}
                  label={`Upload ${docUploadType.replace(/_/g, " ")} Attachment`}
                  helperText="JPEG, PNG, or PDF proof file. Maximum 10MB per attachment."
                />
              </div>
            </div>

            {/* Uploaded Documents Ledger */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Attached Documents ({documents.length})
              </h3>
              {documents.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-400">
                  No documents attached yet. Please upload at least one
                  identification or proof file.
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div
                      key={`doc-${doc.name}-${idx}`}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base">📄</span>
                        <div className="truncate">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Type: {doc.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Preview
                        </a>
                        <button
                          type="button"
                          onClick={() => removeDocument(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs px-2 py-1 rounded-md cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Review, Priority Reservation Hold Agreement & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                Application Review & Priority Reservation Hold
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Review your application details. Submitting locks this room with
                an exclusive 48-hour priority hold.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-black/5 dark:border-white/5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Applicant
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {personalInfo.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Move-in Date
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatDate(requestedMoveInDate)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Lease Term
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {intendedStayMonths} Months
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Income
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(employment.monthlyIncomeCents)}/mo
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Employer
                  </span>
                  <span>
                    {employment.employerName} — {employment.jobTitle}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Attached Proof
                  </span>
                  <span>{documents.length} verified documents</span>
                </div>
              </div>
            </div>

            {/* Optional Notes for Landlord */}
            <div className="space-y-1.5">
              <label
                htmlFor="app-landlord-notes"
                className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
              >
                Additional Notes or Roommate Inquiries (Optional)
              </label>
              <textarea
                id="app-landlord-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any questions about lease terms, parking, move-in logistics, or house rules..."
                className="w-full p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-50/70 dark:bg-zinc-800/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900 leading-relaxed"
              />
            </div>

            {/* Exclusive Priority Hold Terms Agreement */}
            <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToHoldPolicy}
                  onChange={(e) => setAgreedToHoldPolicy(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  required
                />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-zinc-950 dark:text-zinc-50 block">
                    I acknowledge the 48-Hour Priority Reservation Hold policy
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                    Upon submission, room status idempotently transitions to{" "}
                    <strong>Reserved</strong>. You retain exclusive evaluation
                    priority. If the property owner does not approve or extend
                    within 48 hours, the room lock automatically releases back
                    to Available inventory.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              ← Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={nextStep}
            >
              Continue to Step {currentStep + 1} →
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={submitApplication}
              isLoading={isSubmitting}
              disabled={!agreedToHoldPolicy || isSubmitting}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              <span>Submit Application & Lock Hold</span>
              <span>🔒</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
