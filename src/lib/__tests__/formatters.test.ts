import { describe, expect, it } from "bun:test";
import {
  centsToDollars,
  dollarsToCents,
  formatCurrency,
  formatDate,
  parseCurrencyInput,
  toInputDateFormat,
} from "../formatters";

describe("formatters", () => {
  it("converts cents to dollars accurately", () => {
    expect(centsToDollars(140000)).toBe(1400);
    expect(centsToDollars(140050)).toBe(1400.5);
    expect(centsToDollars(0)).toBe(0);
  });

  it("converts dollars to cents avoiding floating point errors", () => {
    expect(dollarsToCents(1400)).toBe(140000);
    expect(dollarsToCents(1400.5)).toBe(140050);
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(dollarsToCents("1,400.00")).toBe(140000);
    expect(dollarsToCents("$1,400.50")).toBe(140050);
  });

  it("formats currency correctly", () => {
    expect(formatCurrency(140000)).toBe("$1,400.00");
    expect(formatCurrency(5000)).toBe("$50.00");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("parses currency input", () => {
    expect(parseCurrencyInput("$1,400.00")).toBe(140000);
    expect(parseCurrencyInput("1400")).toBe(140000);
    expect(parseCurrencyInput("1400.50")).toBe(140050);
  });

  it("formats dates cleanly", () => {
    const iso = "2026-10-01T00:00:00.000Z";
    expect(formatDate(iso)).toContain("2026");
    expect(toInputDateFormat(iso)).toBe("2026-10-01");
  });
});
