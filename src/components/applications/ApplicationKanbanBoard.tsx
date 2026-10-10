"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/formatters";
import type { Application, ApplicationStatus } from "@/types/application";
import { ApplicationDecisionModal } from "./ApplicationDecisionModal";

export interface ApplicationKanbanBoardProps {
  applications: Application[];
  onRefresh?: () => void;
}

const COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: "SUBMITTED", label: "New Submissions", color: "border-blue-500/30" },
  { id: "UNDER_REVIEW", label: "Under Review", color: "border-amber-500/30" },
  {
    id: "APPROVED",
    label: "Approved / Leased",
    color: "border-emerald-500/30",
  },
  { id: "REJECTED", label: "Declined", color: "border-rose-500/30" },
];

export function ApplicationKanbanBoard({
  applications,
  onRefresh,
}: ApplicationKanbanBoardProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const getAppsForColumn = (status: ApplicationStatus) => {
    return applications.filter((app) => app.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const columnApps = getAppsForColumn(col.id);
          return (
            <div
              key={col.id}
              className={`p-4 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 backdrop-blur-xl border ${col.color} space-y-3 flex flex-col`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                  {col.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-zinc-800 border border-black/5 dark:border-white/5">
                  {columnApps.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1">
                {columnApps.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400 italic">
                    No applications
                  </div>
                ) : (
                  columnApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-black/5 dark:border-white/5 shadow-2xs hover:shadow-sm transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-zinc-950 dark:text-zinc-50">
                            {app.tenant?.name || "Applicant"}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {app.room?.name || "Room"}
                          </div>
                        </div>
                        {app.holdExpiresAt && (
                          <Badge variant="warning" size="sm">
                            Hold Active
                          </Badge>
                        )}
                      </div>

                      <div className="text-[10px] text-zinc-500 space-y-0.5 pt-1 border-t border-black/5 dark:border-white/5">
                        <div>Move-in: {formatDate(app.moveInDate)}</div>
                        {app.employment && <div>Emp: {app.employment}</div>}
                      </div>

                      {/* Action buttons */}
                      {app.status !== "APPROVED" &&
                        app.status !== "REJECTED" && (
                          <div className="pt-2 flex items-center justify-end">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedApp(app)}
                              className="text-[11px] py-1 px-3"
                            >
                              Triage & Decide
                            </Button>
                          </div>
                        )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ApplicationDecisionModal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        application={selectedApp}
        onSuccess={() => {
          setSelectedApp(null);
          onRefresh?.();
        }}
      />
    </div>
  );
}
