"use client";

import * as React from "react";
import {
  CalendarX,
  Plus,
  Trash2,
  Check,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { RoomDetail } from "@/lib/mock-rooms";
import { BlockedDateRecord } from "@/lib/calendar-service";

function getLocalDateInputValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default function AdminCalendarPage() {
  const [blocks, setBlocks] = React.useState<BlockedDateRecord[]>([]);
  const [units, setUnits] = React.useState<RoomDetail[]>([]);
  const [selectedUnit, setSelectedUnit] = React.useState("");
  const [dateStart, setDateStart] = React.useState("");
  const [dateEnd, setDateEnd] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [calRes, invRes] = await Promise.all([
        fetch("/api/admin/calendar"),
        fetch("/api/admin/inventory"),
      ]);

      const calData = await calRes.json();
      const invData = await invRes.json();

      if (calData.success) {
        setBlocks(calData.blockedDates || []);
      }
      if (invData.success && invData.units) {
        setUnits(invData.units);
        if (invData.units.length > 0 && !selectedUnit) {
          setSelectedUnit(invData.units[0].slug);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load calendar data.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedUnit]);

  React.useEffect(() => {
    queueMicrotask(() => {
      void fetchData();
    });
  }, [fetchData]);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateEnd < dateStart) {
      setError("End date must be on or after the start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnit,
          startDate: dateStart,
          endDate: dateEnd,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotification(`Successfully blocked dates for ${selectedUnit.toUpperCase()}!`);
        setTimeout(() => setNotification(null), 3500);
        fetchData();
      } else {
        alert(data.error || "Failed to block dates.");
      }
    } catch {
      alert("Network error blocking dates.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    const block = blocks.find((item) => item.id === id);
    const details = block ? `${block.unit_id} on ${block.blocked_date}` : "this date block";
    if (!window.confirm(`Remove the blackout for ${details}? The unit may become bookable on that date.`)) return;

    try {
      const res = await fetch(`/api/admin/calendar?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNotification("Blackout date removed in Supabase. Unit is now bookable.");
        setTimeout(() => setNotification(null), 3500);
        fetchData();
      } else {
        alert(data.error || "Failed to remove blackout.");
      }
    } catch {
      alert("Network error removing block.");
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-gold mb-1">
            Availability Engine
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-fg">
            Calendar Blackout & Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-fg-muted mt-1">
            Manually lock dates for routine maintenance, deep cleaning, or offline private owner bookings.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-raised border border-line text-xs text-fg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gold" : "text-gold"}`} />
          <span>Refresh</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Blackout Form */}
        <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md p-5 shadow-xl h-fit">
          <h3 className="font-serif text-lg font-normal text-fg flex items-center gap-2 mb-4">
            <CalendarX className="w-4 h-4 text-gold" />
            <span>Block Specific Dates</span>
          </h3>

          <form onSubmit={handleAddBlock} className="space-y-3.5 text-xs">
            <div>
              <label htmlFor="calendar-unit" className="text-xs font-medium tracking-[0.18em] uppercase text-fg-muted block mb-1.5">
                Select Flat Unit
              </label>
              <select
                id="calendar-unit"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full bg-surface/90 border border-control rounded-xl px-3 py-2 text-fg focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.slug} className="bg-surface text-fg">
                    {u.title} ({u.category} • {u.branchSlug === "barkas-salala" ? "Barkas" : "Moghal Pura"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
              <label htmlFor="calendar-start-date" className="text-xs font-medium tracking-[0.18em] uppercase text-fg-muted block mb-1.5">
                  Start Date
                </label>
                <input
                  id="calendar-start-date"
                  type="date"
                  required
                  min={getLocalDateInputValue()}
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full bg-surface/90 border border-control rounded-xl px-3 py-2 text-fg focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="calendar-end-date" className="text-xs font-medium tracking-[0.18em] uppercase text-fg-muted block mb-1.5">
                  End Date
                </label>
                <input
                  id="calendar-end-date"
                  type="date"
                  required
                  min={dateStart || getLocalDateInputValue()}
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full bg-surface/90 border border-control rounded-xl px-3 py-2 text-fg focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="calendar-reason" className="text-xs font-medium tracking-[0.18em] uppercase text-fg-muted block mb-1.5">
                Reason / Maintenance Note
              </label>
              <input
                id="calendar-reason"
                type="text"
                required
                maxLength={160}
                placeholder="Enter the reason for blocking these dates"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-surface/90 border border-control rounded-xl px-3 py-2 text-fg focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-110 text-ink font-bold text-xs transition-all shadow-md shadow-gold/15 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? "Locking Dates..." : "Block Dates in Database"}</span>
            </button>
          </form>
        </div>

        {/* Existing Blackout List */}
        <div className="lg:col-span-2 rounded-2xl bg-raised/75 border border-line backdrop-blur-md p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-normal text-fg flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              <span>Active Date Blocks <span className="font-serif oldstyle-nums">({blocks.length})</span></span>
            </h3>
            <span className="text-xs text-fg-muted">
              These dates are rejected by the booking availability engine.
            </span>
          </div>

          <div className="space-y-3">
            {blocks.length === 0 ? (
              <div className="p-8 text-center text-fg-muted text-xs">
                No active calendar blackouts. All flats are open for booking.
              </div>
            ) : (
              blocks.map((block) => (
                <div
                  key={block.id}
                  className="p-4 rounded-xl bg-surface border border-line-soft flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gold text-xs uppercase font-mono px-2 py-0.5 rounded-md bg-raised border border-line">
                        {block.unit_id}
                      </span>
                      <span className="text-xs text-fg font-serif oldstyle-nums font-semibold">
                        {block.blocked_date}
                      </span>
                    </div>
                    <p className="text-xs text-fg-muted">{block.reason || "Maintenance"}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-2 rounded-lg bg-raised hover:bg-rose-500/20 text-fg-muted hover:text-rose-400 border border-line-soft transition-colors cursor-pointer"
                    title="Remove Blackout"
                    aria-label={`Remove blackout for ${block.unit_id} on ${block.blocked_date}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
