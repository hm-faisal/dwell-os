"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import { showToast } from "@/lib/toast";
import type { AdminUser, AuditLog, Dispute } from "@/types/admin";

export function SuperadminConsole() {
  const [tab, setTab] = useState<"users" | "disputes" | "audit">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dispute resolution state
  const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(
    null,
  );
  const [resolutionText, setResolutionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [uData, dData, aData] = await Promise.all([
        adminApi.listUsers().catch(() => []),
        adminApi.listDisputes().catch(() => []),
        adminApi.listAuditLogs({ limit: 50 }).catch(() => []),
      ]);
      setUsers(uData);
      setDisputes(dData);
      setAuditLogs(aData);
    } catch {
      // Handle error gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      showToast.success(`User role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole as AdminUser["role"] } : u,
        ),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      showToast.error(msg);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await adminApi.updateUser(userId, { status: newStatus });
      showToast.success(`User status updated to ${newStatus}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, status: newStatus as AdminUser["status"] }
            : u,
        ),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update status";
      showToast.error(msg);
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingDispute || !resolutionText.trim()) return;

    try {
      setIsSubmitting(true);
      await adminApi.resolveDispute(resolvingDispute.id, {
        resolution: resolutionText.trim(),
        status: "RESOLVED",
      });

      showToast.success("Dispute marked resolved!");
      setResolvingDispute(null);
      setResolutionText("");
      loadData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to resolve dispute";
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="danger" size="sm">
              Superadmin RBAC
            </Badge>
            {isLoading ? (
              <span className="text-xs text-amber-500 font-medium animate-pulse">
                Synchronizing live audit trail...
              </span>
            ) : (
              <span className="text-xs text-zinc-500">
                Platform Governance & Auditing
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Platform Administration Console
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              tab === "users"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("disputes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              tab === "disputes"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Disputes ({disputes.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("audit")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              tab === "audit"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Users Management Tab */}
      {tab === "users" && (
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            User Accounts & Role Management
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-zinc-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-950 dark:text-zinc-50">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/10"
                      >
                        <option value="TENANT">TENANT</option>
                        <option value="OWNER">OWNER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          u.status === "ACTIVE"
                            ? "success"
                            : u.status === "SUSPENDED"
                              ? "warning"
                              : "danger"
                        }
                        size="sm"
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      {u.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(u.id, "SUSPENDED")}
                          className="px-2.5 py-1 text-[10px] font-semibold text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(u.id, "ACTIVE")}
                          className="px-2.5 py-1 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disputes Tab */}
      {tab === "disputes" && (
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Dispute Resolution Cases
          </h2>

          <div className="space-y-3">
            {disputes.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No active dispute tickets filed.
              </div>
            ) : (
              disputes.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-950 dark:text-zinc-50">
                        {d.category} Dispute
                      </span>
                      <Badge
                        variant={d.status === "RESOLVED" ? "success" : "danger"}
                        size="sm"
                      >
                        {d.status}
                      </Badge>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      {d.description}
                    </p>
                    <div className="text-[10px] text-zinc-400">
                      Filed by: {d.raisedBy?.name || d.raisedById} ·{" "}
                      {formatDate(d.createdAt)}
                    </div>
                  </div>

                  {d.status !== "RESOLVED" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setResolvingDispute(d)}
                      className="self-end sm:self-auto"
                    >
                      Resolve Case
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {tab === "audit" && (
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Immutable State Audit Trail
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-zinc-400 font-semibold uppercase text-[10px]">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Entity</th>
                  <th className="py-2 px-3">Entity ID</th>
                  <th className="py-2 px-3">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="py-2 px-3 text-zinc-400">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-2 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {log.action}
                    </td>
                    <td className="py-2 px-3 text-zinc-500">
                      {log.entityType}
                    </td>
                    <td className="py-2 px-3 text-zinc-400 truncate max-w-[120px]">
                      {log.entityId}
                    </td>
                    <td className="py-2 px-3 text-zinc-400">
                      {log.actorId ? log.actorId.slice(0, 8) : "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {resolvingDispute && (
        <Modal
          isOpen={true}
          onClose={() => setResolvingDispute(null)}
          title={`Resolve ${resolvingDispute.category} Dispute (#${resolvingDispute.id.slice(0, 8)})`}
          description={`Issue regarding "${resolvingDispute.category}". Record an official resolution decision.`}
        >
          <form onSubmit={handleResolveDispute} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label
                htmlFor="resolution-text"
                className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
              >
                Official Resolution Decision / Findings
              </label>
              <textarea
                id="resolution-text"
                rows={4}
                required
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Enter finding, compensation adjustments, or binding determination..."
                className="w-full p-3 rounded-xl text-xs bg-zinc-100/70 dark:bg-zinc-800/60 border border-black/8 dark:border-white/10 text-zinc-950 dark:text-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5 dark:border-white/5">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setResolvingDispute(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                Confirm Resolution
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
