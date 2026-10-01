"use client";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function evaluatePasswordStrength(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const passedCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSpecial,
  ].filter(Boolean).length;

  let strength: "weak" | "fair" | "good" | "strong" = "weak";
  let score = 0;

  if (passedCount <= 2) {
    strength = "weak";
    score = 1;
  } else if (passedCount === 3) {
    strength = "fair";
    score = 2;
  } else if (passedCount === 4) {
    strength = "good";
    score = 3;
  } else if (passedCount === 5) {
    strength = "strong";
    score = 4;
  }

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSpecial,
    passedCount,
    score,
    strength,
    isValid: passedCount === 5,
  };
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSpecial,
    score,
    strength,
  } = evaluatePasswordStrength(password);

  const colors: Record<string, string> = {
    weak: "bg-rose-500",
    fair: "bg-amber-500",
    good: "bg-blue-500",
    strong: "bg-emerald-500",
  };

  const labels: Record<string, string> = {
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong & Compliant",
  };

  return (
    <div className="mt-2 space-y-2 text-xs">
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
        <span>Password strength:</span>
        <span className="font-semibold capitalize text-zinc-700 dark:text-zinc-200">
          {labels[strength]}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 1 ? colors[strength] : "bg-transparent"
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 2 ? colors[strength] : "bg-transparent"
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 3 ? colors[strength] : "bg-transparent"
          }`}
        />
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            score >= 4 ? colors[strength] : "bg-transparent"
          }`}
        />
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
        <li
          className={`flex items-center gap-1.5 ${
            hasMinLength
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-zinc-400"
          }`}
        >
          <span>{hasMinLength ? "✓" : "○"}</span>
          At least 8 characters
        </li>
        <li
          className={`flex items-center gap-1.5 ${
            hasUppercase
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-zinc-400"
          }`}
        >
          <span>{hasUppercase ? "✓" : "○"}</span>
          One uppercase letter
        </li>
        <li
          className={`flex items-center gap-1.5 ${
            hasLowercase
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-zinc-400"
          }`}
        >
          <span>{hasLowercase ? "✓" : "○"}</span>
          One lowercase letter
        </li>
        <li
          className={`flex items-center gap-1.5 ${
            hasDigit
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-zinc-400"
          }`}
        >
          <span>{hasDigit ? "✓" : "○"}</span>
          One numeric digit
        </li>
        <li
          className={`flex items-center gap-1.5 col-span-full ${
            hasSpecial
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-zinc-400"
          }`}
        >
          <span>{hasSpecial ? "✓" : "○"}</span>
          One special character (!@#$%^&*)
        </li>
      </ul>
    </div>
  );
}
