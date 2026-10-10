export interface OwnerDashboardOverview {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number; // 0 - 100 percentage
  totalMonthlyRevenue: number; // in cents
  pendingApplicationsCount: number;
  openMaintenanceTicketsCount: number;
  overdueInvoicesCount: number;
  recentActivities: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: "APPLICATION" | "PAYMENT" | "MAINTENANCE" | "LEASE";
  }>;
}

export interface RentInvoice {
  id: string;
  leaseId: string;
  amount: number; // in cents
  amountPaid: number; // in cents
  lateFee: number; // in cents
  status: "DUE" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELLED";
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  gracePeriodDays: number;
  createdAt: string;
  updatedAt: string;
  lease?: {
    id: string;
    property?: {
      name: string;
    };
    room?: {
      name: string;
    };
  };
}
