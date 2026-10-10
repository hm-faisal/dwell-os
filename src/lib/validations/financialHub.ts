import { z } from "zod";

/**
 * Strict Zod validation schemas for Financial Ledger & Payment Hub
 * All monetary amounts are strictly validated as non-negative integer minor units (cents).
 */

export const invoiceStatusSchema = z.enum([
  "DUE",
  "PAID",
  "PARTIALLY_PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const billShareStatusSchema = z.enum(["PENDING", "PAID"]);

export const rentInvoiceSchema = z.object({
  id: z.string().uuid("Invoice ID must be a UUID"),
  leaseId: z.string().uuid("Lease ID must be a UUID"),
  amount: z
    .number()
    .int("Base rent amount must be an integer in cents")
    .positive("Rent amount must be greater than zero"),
  amountPaid: z
    .number()
    .int("Amount paid must be an integer in cents")
    .nonnegative("Amount paid cannot be negative")
    .default(0),
  lateFee: z
    .number()
    .int("Late fee must be an integer in cents")
    .nonnegative("Late fee cannot be negative")
    .default(0),
  status: invoiceStatusSchema,
  periodStart: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Valid period start date is required",
  }),
  periodEnd: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Valid period end date is required",
  }),
  dueDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Valid due date is required",
  }),
  gracePeriodDays: z.number().int().nonnegative().default(5),
});

export const billShareSchema = z.object({
  id: z.string().uuid("Bill share ID must be a UUID"),
  billId: z.string().uuid("Bill ID must be a UUID"),
  tenantId: z.string().uuid("Tenant ID must be a UUID"),
  amount: z
    .number()
    .int("Share amount must be an integer in cents")
    .positive("Share amount must be greater than zero"),
  daysOccupied: z
    .number()
    .int("Days occupied must be an integer")
    .positive("Days occupied must be at least 1"),
  totalBillingDays: z
    .number()
    .int("Total billing days must be an integer")
    .positive("Total billing days must be at least 1")
    .default(30),
  status: billShareStatusSchema,
  paymentId: z.string().uuid().optional().nullable(),
});

export const paymentCheckoutSchema = z.object({
  targetType: z.enum(["RENT_INVOICE", "UTILITY_SHARE"]),
  targetId: z.string().uuid("Valid target obligation UUID is required"),
  amountCents: z
    .number()
    .int("Checkout amount must be an integer in cents")
    .positive("Checkout amount must be greater than zero"),
  paymentMethod: z
    .enum(["CREDIT_CARD", "ACH", "MOCK_STRIPE"])
    .default("MOCK_STRIPE"),
  cardLastFour: z
    .string()
    .regex(/^\d{4}$/, "Last 4 digits must be 4 numbers")
    .optional(),
  idempotencyKey: z.string().uuid("Unique idempotency key is required"),
});

export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type BillShareStatus = z.infer<typeof billShareStatusSchema>;
export type RentInvoiceModel = z.infer<typeof rentInvoiceSchema>;
export type BillShareModel = z.infer<typeof billShareSchema>;
export type PaymentCheckoutPayload = z.infer<typeof paymentCheckoutSchema>;
