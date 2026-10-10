"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { roommateMatchingApi } from "@/lib/api";
import { centsToDollars, dollarsToCents } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type {
  CleanlinessLevel,
  RoommateProfile,
  SleepSchedule,
  UpsertRoommateProfileDTO,
  WorkSchedule,
} from "@/types/roommate";

const SUGGESTED_LIFESTYLE_TAGS = [
  "Vegetarian",
  "Vegan",
  "Early Riser",
  "Student",
  "Quiet / Introvert",
  "Social / Extrovert",
  "Fitness Enthusiast",
  "Cooking Friendly",
  "Non-Drinker",
  "LGBTQ+ Friendly",
  "Gaming",
  "Remote Tech Worker",
  "No Overnight Guests",
  "Musician Friendly",
];

const SLEEP_OPTIONS: {
  value: SleepSchedule;
  label: string;
  desc: string;
}[] = [
  {
    value: "EARLY_BIRD",
    label: "Early Bird",
    desc: "Up before 7 AM, quiet mornings",
  },
  {
    value: "NIGHT_OWL",
    label: "Night Owl",
    desc: "Active late, quiet daytime sleeping",
  },
  {
    value: "FLEXIBLE",
    label: "Flexible",
    desc: "Adapts smoothly to household flow",
  },
];

const WORK_OPTIONS: {
  value: WorkSchedule;
  label: string;
  desc: string;
}[] = [
  { value: "REMOTE", label: "Remote", desc: "Works from home full-time" },
  {
    value: "OFFICE",
    label: "In-Office",
    desc: "Gone during standard business hours",
  },
  {
    value: "HYBRID",
    label: "Hybrid",
    desc: "Splits time between home & office",
  },
  {
    value: "SHIFT",
    label: "Shift Work",
    desc: "Variable or rotating schedule",
  },
];

const CLEANLINESS_OPTIONS: {
  value: CleanlinessLevel;
  label: string;
  desc: string;
}[] = [
  {
    value: "VERY_CLEAN",
    label: "Very Clean",
    desc: "Clean-as-you-go, prompt dishwashing & chore schedules",
  },
  {
    value: "MODERATE",
    label: "Moderate",
    desc: "Tidy shared areas, comfortable lived-in spaces",
  },
  {
    value: "RELAXED",
    label: "Relaxed",
    desc: "Casual approach, flexible cleanup timelines",
  },
];

export interface RoommateProfileFormProps {
  initialProfile?: RoommateProfile | null;
  onSaved?: (profile: RoommateProfile) => void;
  className?: string;
}

export function RoommateProfileForm({
  initialProfile,
  onSaved,
  className,
}: RoommateProfileFormProps) {
  const [budgetMinDollars, setBudgetMinDollars] = useState<string>(
    initialProfile?.budgetMin
      ? String(centsToDollars(initialProfile.budgetMin))
      : "",
  );
  const [budgetMaxDollars, setBudgetMaxDollars] = useState<string>(
    initialProfile?.budgetMax
      ? String(centsToDollars(initialProfile.budgetMax))
      : "",
  );
  const [moveInDate, setMoveInDate] = useState<string>(
    initialProfile?.moveInDate ? initialProfile.moveInDate.split("T")[0] : "",
  );
  const [sleepSchedule, setSleepSchedule] = useState<SleepSchedule | undefined>(
    initialProfile?.sleepSchedule || undefined,
  );
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule | undefined>(
    initialProfile?.workSchedule || undefined,
  );
  const [cleanliness, setCleanliness] = useState<CleanlinessLevel | undefined>(
    initialProfile?.cleanliness || undefined,
  );
  const [smoking, setSmoking] = useState<boolean>(
    initialProfile?.smoking || false,
  );
  const [pets, setPets] = useState<boolean>(initialProfile?.pets || false);
  const [bio, setBio] = useState<string>(initialProfile?.bio || "");
  const [lifestyleTags, setLifestyleTags] = useState<string[]>(
    initialProfile?.lifestyleTags || [],
  );
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLifestyleTag = (tag: string) => {
    setLifestyleTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !lifestyleTags.includes(trimmed)) {
      setLifestyleTags((prev) => [...prev, trimmed]);
      setCustomTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setLifestyleTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const minCents = budgetMinDollars
        ? dollarsToCents(budgetMinDollars)
        : undefined;
      const maxCents = budgetMaxDollars
        ? dollarsToCents(budgetMaxDollars)
        : undefined;

      if (
        minCents !== undefined &&
        maxCents !== undefined &&
        minCents > maxCents
      ) {
        showToast.error("Minimum budget cannot exceed maximum budget");
        setIsSubmitting(false);
        return;
      }

      const payload: UpsertRoommateProfileDTO = {
        budgetMin: minCents,
        budgetMax: maxCents,
        moveInDate: moveInDate ? new Date(moveInDate).toISOString() : undefined,
        sleepSchedule,
        workSchedule,
        cleanliness,
        smoking,
        pets,
        lifestyleTags,
        bio: bio.trim() || undefined,
      };

      const saved = await roommateMatchingApi.upsertProfile(payload);
      showToast.success(
        "Profile preferences saved! Your matches have been recalculated.",
      );
      onSaved?.(saved);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save roommate profile";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-6 max-w-4xl mx-auto", className)}
    >
      {/* 1. Budget Range & Preferred Move-in Date */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-4">
        <div className="border-b border-black/5 dark:border-white/5 pb-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <span>💰</span>
            <span>1. Budget & Move-in Timing</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Matching evaluates monthly rent budget overlap to suggest housemates
            within your price expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-budget-min"
              className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
            >
              Min Monthly Budget ($)
            </label>
            <input
              id="profile-budget-min"
              type="number"
              min={0}
              step={50}
              placeholder="e.g. 800"
              value={budgetMinDollars}
              onChange={(e) => setBudgetMinDollars(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-budget-max"
              className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
            >
              Max Monthly Budget ($)
            </label>
            <input
              id="profile-budget-max"
              type="number"
              min={0}
              step={50}
              placeholder="e.g. 1500"
              value={budgetMaxDollars}
              onChange={(e) => setBudgetMaxDollars(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-move-in-date"
              className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
            >
              Preferred Move-in Date
            </label>
            <input
              id="profile-move-in-date"
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Sleep Schedule & Work Routine */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-5">
        <div className="border-b border-black/5 dark:border-white/5 pb-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <span>⏰</span>
            <span>2. Daily Schedules & Routines</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Minimizes sleep disruption and aligns daytime noise expectations
            between housemates.
          </p>
        </div>

        {/* Sleep Schedule */}
        <div className="space-y-2">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
            Sleep Schedule
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SLEEP_OPTIONS.map((opt) => {
              const isSelected = sleepSchedule === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSleepSchedule(opt.value)}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer select-none",
                    isSelected
                      ? "border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm scale-[1.01]"
                      : "border-black/6 dark:border-white/8 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:border-black/20 dark:hover:border-white/20",
                  )}
                >
                  <div className="font-semibold text-xs sm:text-sm">
                    {opt.label}
                  </div>
                  <div
                    className={cn(
                      "text-[11px] mt-1 line-clamp-1",
                      isSelected
                        ? "text-zinc-300 dark:text-zinc-600"
                        : "text-zinc-400 dark:text-zinc-500",
                    )}
                  >
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Work Schedule */}
        <div className="space-y-2 pt-2">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
            Work Routine
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {WORK_OPTIONS.map((opt) => {
              const isSelected = workSchedule === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWorkSchedule(opt.value)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer select-none",
                    isSelected
                      ? "border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm scale-[1.01]"
                      : "border-black/6 dark:border-white/8 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:border-black/20 dark:hover:border-white/20",
                  )}
                >
                  <div className="font-semibold text-xs sm:text-sm">
                    {opt.label}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] mt-1 line-clamp-2",
                      isSelected
                        ? "text-zinc-300 dark:text-zinc-600"
                        : "text-zinc-400 dark:text-zinc-500",
                    )}
                  >
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Cleanliness Standards & Living Habits */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-5">
        <div className="border-b border-black/5 dark:border-white/5 pb-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <span>🧼</span>
            <span>3. Cleanliness & Shared Habits</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Cleanliness is weighted heavily (up to 25 points) to ensure
            expectations match before move-in.
          </p>
        </div>

        {/* Cleanliness selection */}
        <div className="space-y-2">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
            Cleanliness Standard
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CLEANLINESS_OPTIONS.map((opt) => {
              const isSelected = cleanliness === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCleanliness(opt.value)}
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer select-none",
                    isSelected
                      ? "border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm scale-[1.01]"
                      : "border-black/6 dark:border-white/8 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:border-black/20 dark:hover:border-white/20",
                  )}
                >
                  <div className="font-semibold text-xs sm:text-sm">
                    {opt.label}
                  </div>
                  <div
                    className={cn(
                      "text-[11px] mt-1 line-clamp-2",
                      isSelected
                        ? "text-zinc-300 dark:text-zinc-600"
                        : "text-zinc-400 dark:text-zinc-500",
                    )}
                  >
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Smoking & Pets Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Smoking Policy
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {smoking ? "Smoker or 420 friendly" : "Non-smoker household"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSmoking(!smoking)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                smoking ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700",
              )}
              aria-label="Toggle smoking preference"
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                  smoking ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Pet Living
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {pets ? "Have pets or pet-friendly" : "No pets in unit"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPets(!pets)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                pets ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700",
              )}
              aria-label="Toggle pet living preference"
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                  pets ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Lifestyle Tags & Personal Bio */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-4">
        <div className="border-b border-black/5 dark:border-white/5 pb-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <span>✨</span>
            <span>4. Lifestyle Tags & Bio</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Add tags that describe your personality, hobbies, and house culture.
          </p>
        </div>

        {/* Selected Tags */}
        <div className="space-y-2">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
            Selected Tags ({lifestyleTags.length})
          </span>
          <div className="flex flex-wrap gap-2 min-h-[38px] p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
            {lifestyleTags.length === 0 ? (
              <span className="text-xs text-zinc-400 italic px-1 self-center">
                Click any suggested tag below or type your own...
              </span>
            ) : (
              lifestyleTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-2xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:opacity-75 cursor-pointer ml-0.5 text-xs"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Custom Tag Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom tag (e.g. Graphic Designer, Weekend Hiker)..."
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomTag(e);
              }
            }}
            className="flex-1 h-10 px-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleAddCustomTag}
            className="rounded-xl px-4"
          >
            + Add
          </Button>
        </div>

        {/* Suggested Tags */}
        <div className="space-y-1.5 pt-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400">
            Suggested Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_LIFESTYLE_TAGS.map((tag) => {
              const isSelected = lifestyleTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleLifestyleTag(tag)}
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer select-none",
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold"
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  )}
                >
                  {isSelected ? "✓ " : "+ "}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bio Textarea */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="profile-bio"
              className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-zinc-600 dark:text-zinc-400"
            >
              Personal Bio & Introduction
            </label>
            <span className="text-[10px] text-zinc-400">
              {bio.length} / 1000 chars
            </span>
          </div>
          <textarea
            id="profile-bio"
            rows={4}
            maxLength={1000}
            placeholder="Tell prospective roommates about yourself, your profession, your hobbies, and what you value in a shared living space..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-700/70 bg-zinc-100/70 dark:bg-zinc-800/60 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 leading-relaxed placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Form Submission */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="rounded-2xl px-8 font-semibold tracking-wide shadow-md"
        >
          Save Roommate Profile
        </Button>
      </div>
    </form>
  );
}
