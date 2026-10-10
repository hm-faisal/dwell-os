export type UtilityCategory =
  | "ELECTRICITY"
  | "WATER"
  | "GAS"
  | "INTERNET"
  | "TRASH"
  | "OTHER";

export type SplitMethod = "EQUAL" | "PERCENTAGE" | "USAGE_BASED";

export interface BillShare {
  id: string;
  billId: string;
  tenantId: string;
  amount: number; // in cents
  daysOccupied: number;
  status: "PENDING" | "PAID";
  paymentId?: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UtilityBill {
  id: string;
  propertyId: string;
  category: UtilityCategory;
  amount: number; // in cents
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  splitMethod: SplitMethod;
  proofUrl?: string | null;
  status: "PENDING" | "PARTIALLY_PAID" | "SETTLED";
  createdAt: string;
  updatedAt: string;
  billShares?: BillShare[];
  property?: {
    id: string;
    name: string;
  };
}

export interface CreateUtilityBillDTO {
  category: UtilityCategory;
  amount: number; // in cents
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  splitMethod: SplitMethod;
  proofUrl?: string;
  customShares?: Array<{
    tenantId: string;
    amount: number;
    daysOccupied: number;
  }>;
}
