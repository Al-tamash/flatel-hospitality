"use client";

import * as React from "react";
import { AlertCircle, Mail, RefreshCw, Search, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MembershipRecord } from "@/lib/membership/membership-service";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Awaiting payment" },
  { id: "expired", label: "Expired" },
  { id: "cancelled", label: "Cancelled" },
  { id: "failed", label: "Failed" },
] as const;

const STATUS_STYLE: Record<MembershipRecord["status"], string> = {
  active: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  pending: "bg-amber-400/10 text-amber-200 border-amber-400/30",
  expired: "bg-zinc-400/10 text-zinc-300 border-zinc-400/30",
  cancelled: "bg-rose-400/10 text-rose-300 border-rose-400/30",
  failed: "bg-rose-400/10 text-rose-300 border-rose-400/30",
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminMembersPage() {
  const [members, setMembers] = React.useState<MembershipRecord[]>([]);
  const [status, setStatus] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);
  const [emailConfigured, setEmailConfigured] = React.useState(true);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL("/api/admin/members", window.location.origin);
      if (status !== "all") url.searchParams.set("status", status);
      if (query.trim()) url.searchParams.set("query", query.trim());
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
        setEmailConfigured(Boolean(data.emailConfigured));
      } else {
        setError(data.error || "Failed to load members.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load members.");
    } finally {
      setIsLoading(false);
    }
  }, [status, query]);

  React.useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const act = async (member: MembershipRecord, action: "cancel" | "resend") => {
    const prompt =
      action === "cancel"
        ? `Cancel the membership of ${member.fullName}? The Member ID will stop working. This does not refund the fee.`
        : `Email ${member.fullName} their Member ID again?`;
    if (!window.confirm(prompt)) return;
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, action }),
      });
      const data = await res.json();
      if (!data.success) {
        window.alert(data.error || "Action failed.");
        return;
      }
      setNote(action === "cancel" ? `Cancelled ${member.fullName}.` : `Member ID emailed to ${member.email}.`);
      window.setTimeout(() => setNote(null), 3500);
      void load();
    } catch {
      window.alert("Network error. Please try again.");
    }
  };

  const activeCount = members.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl text-fg">Flatel Members</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {activeCount} active · {members.length} shown
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-lg border border-line text-sm text-gold hover:border-gold cursor-pointer"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, phone or Member ID"
            aria-label="Search members"
            className="w-full min-h-[42px] rounded-xl border border-control bg-ink pl-9 pr-3 text-sm text-fg focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatus(filter.id)}
              aria-pressed={status === filter.id}
              className={cn(
                "min-h-[36px] px-3 rounded-full border text-xs font-semibold cursor-pointer",
                status === filter.id
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-line text-fg-soft hover:border-gold/60"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {!emailConfigured && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Email is not configured, so new members are not emailed their Member ID. Set RESEND_API_KEY and EMAIL_FROM.
        </p>
      )}
      {note && <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{note}</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-raised/80 text-xs uppercase tracking-wider text-fg-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Card</th>
              <th className="px-4 py-3 font-medium">Member ID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Valid</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {members.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6}className="px-4 py-10 text-center text-fg-muted">
                  {error ? "—" : "No members match."}
                </td>
              </tr>
            )}
            {members.map((member) => (
              <tr key={member.id} className="text-fg">
                <td className="px-4 py-3">
                  <p className="font-medium">{member.fullName}</p>
                  <p className="text-xs text-fg-muted">{member.email} · {member.phone}</p>
                </td>
                <td className="px-4 py-3 capitalize">{member.tier}</td>
                <td className="px-4 py-3 font-mono tracking-wider text-gold">{member.memberCode ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_STYLE[member.status])}>
                    {member.status === "pending" ? "awaiting payment" : member.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-fg-soft">
                  {formatDate(member.validFrom)} → {formatDate(member.validUntil)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {member.status === "active" && (
                      <>
                        <button
                          type="button"
                          onClick={() => void act(member, "resend")}
                          className="inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-lg border border-line text-xs text-gold hover:border-gold cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5" /> Resend ID
                        </button>
                        <button
                          type="button"
                          onClick={() => void act(member, "cancel")}
                          className="inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-lg border border-rose-400/30 text-xs text-rose-300 hover:border-rose-300 cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
