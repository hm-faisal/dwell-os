/**
 * Form utility helpers for TanStack Form integration with DwellOS UI components.
 */

export function getFieldError(errors: unknown[]): string | undefined {
  if (!errors || errors.length === 0) return undefined;
  const first = errors[0];
  if (typeof first === "string") return first;
  if (typeof first === "object" && first !== null && "message" in first) {
    return String((first as { message: unknown }).message);
  }
  return String(first);
}
