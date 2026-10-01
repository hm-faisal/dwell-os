/**
 * Format and conversion utilities for currency and dates.
 * DwellOS uses integer minor units (cents) for all financial amounts.
 */

/**
 * Converts integer minor units (cents) to dollar number.
 * e.g. 140000 -> 1400
 */
export function centsToDollars(cents: number): number {
  if (typeof cents !== "number" || Number.isNaN(cents)) return 0;
  return cents / 100;
}

/**
 * Converts a dollar amount (number or string) to integer cents.
 * Handles floating-point roundoff safely.
 * e.g. 1400.50 -> 140050, "1400" -> 140000
 */
export function dollarsToCents(dollars: number | string): number {
  if (dollars === null || dollars === undefined || dollars === "") return 0;
  const num =
    typeof dollars === "string"
      ? Number.parseFloat(dollars.replace(/[^0-9.-]+/g, ""))
      : dollars;
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Formats integer cents into formatted currency string.
 * e.g. 140000 -> "$1,400.00"
 */
export function formatCurrency(
  cents: number,
  currency = "USD",
  locale = "en-US",
): string {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Parses user input currency string into integer cents.
 * e.g. "$1,400.00" -> 140000, "500" -> 50000
 */
export function parseCurrencyInput(input: string): number {
  return dollarsToCents(input);
}

/**
 * Formats an ISO date string into a human-readable date.
 * e.g. "2026-10-01T00:00:00.000Z" -> "Oct 1, 2026"
 */
export function formatDate(
  dateStr: string | Date | null | undefined,
  locale = "en-US",
): string {
  if (!dateStr) return "N/A";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Formats an ISO date string into date & time string.
 */
export function formatDateTime(
  dateStr: string | Date | null | undefined,
  locale = "en-US",
): string {
  if (!dateStr) return "N/A";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Formats an ISO date string to YYYY-MM-DD for HTML5 date inputs.
 */
export function toInputDateFormat(
  dateStr: string | Date | null | undefined,
): string {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}
