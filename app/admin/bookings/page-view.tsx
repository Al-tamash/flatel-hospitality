"use client";

import * as React from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Banknote,
  Check,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { BookingRecord } from "@/types/booking";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = React.useState<BookingRecord[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [successNote, setSuccessNote] = React.useState<string | null>(null);

  const fetchBookings = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL("/api/admin/bookings", window.location.origin);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (searchTerm.trim()) url.searchParams.set("query", searchTerm.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.error || "Failed to load bookings.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm]);

  React.useEffect(() => {
    queueMicrotask(() => {
      void fetchBookings();
    });
  }, [fetchBookings]);

  const handleMarkBalanceCollected = async (bookingId: string, bookingCode: string, balanceDue: number) => {
    if (!window.confirm(`Confirm the arrival balance of ${formatPrice(balanceDue)} was collected for booking ${bookingCode}?`)) return;

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          balanceCollected: true,
          bookingStatus: "checked_in",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessNote(`Successfully recorded 80% balance collected for ${bookingCode} via Arrival Desk Cash/UPI!`);
        setTimeout(() => setSuccessNote(null), 4000);
        fetchBookings();
      } else {
        alert(data.error || "Failed to update balance collection status.");
      }
    } catch {
      alert("Network error updating booking.");
    }
  };

  const handleUpdateStatus = async (bookingId: string, bookingCode: string, newStatus: string) => {
    if (newStatus === "cancelled" && !window.confirm(`Cancel booking ${bookingCode}? This changes its reservation status.`)) {
      fetchBookings();
      return;
    }

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          bookingStatus: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-gold mb-1">
            Audit & Collections
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-fg">
            Reservations & Collections Ledger
          </h1>
          <p className="text-xs sm:text-sm text-fg-muted mt-1">
            Track guest bookings, verify domestic/international ID proofs, and collect the 80% balance on arrival.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBookings}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-raised border border-line text-xs text-fg transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gold" : "text-gold"}`} />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {successNote && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successNote}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-raised/75 p-4 rounded-2xl border border-line backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-fg-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search reservations"
            placeholder="Search by Booking ID (FLT-xxxxx), guest name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface/90 border border-control rounded-xl pl-10 pr-4 py-2 text-xs text-fg placeholder-fg-faint focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Bookings" },
            { id: "confirmed", label: "Confirmed" },
            { id: "checked_in", label: "Checked In" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-gradient-to-r from-gold to-gold-deep text-ink font-bold shadow-sm shadow-gold/20"
                  : "bg-surface text-fg-muted hover:text-fg hover:bg-raised border border-line-soft"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-fg-muted text-xs">
              No reservations matched your criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/90 text-xs font-medium text-fg-muted uppercase tracking-[0.18em] border-b border-line-soft">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Guest Information</th>
                  <th className="py-3.5 px-4">Residence & Stay Purpose</th>
                  <th className="py-3.5 px-4">Dates & Occupancy</th>
                  <th className="py-3.5 px-4">Payment Breakdown</th>
                  <th className="py-3.5 px-4">Arrival Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft text-fg">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-raised/70 transition-colors">
                    {/* Booking Code & Status */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-mono font-bold text-sm text-gold block">
                        {b.bookingCode}
                      </span>
                      <span className="text-xs text-fg-muted block mt-0.5">
                        {new Date(b.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      <div className="mt-2">
                        <select
                          value={b.bookingStatus}
                          aria-label={`Change status for booking ${b.bookingCode}`}
                          onChange={(e) => handleUpdateStatus(b.id, b.bookingCode, e.target.value)}
                          className="bg-surface border border-control text-xs text-fg rounded-lg px-2 py-1 focus:border-gold focus:outline-none"
                        >
                          <option value="pending" className="bg-surface text-fg">Pending</option>
                          <option value="confirmed" className="bg-surface text-fg">Confirmed</option>
                          <option value="checked_in" className="bg-surface text-fg">Checked In</option>
                          <option value="completed" className="bg-surface text-fg">Completed</option>
                          <option value="cancelled" className="bg-surface text-fg">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Guest Information */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-semibold text-fg text-sm block">{b.guest.fullName}</span>
                      <div className="flex items-center gap-1.5 text-xs text-fg-muted mt-1">
                        <Phone className="w-3 h-3 text-gold" />
                        <span>{b.guest.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-fg-muted mt-0.5">
                        <Mail className="w-3 h-3 text-fg-faint" />
                        <span className="truncate max-w-[180px]">{b.guest.email}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/25">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          {b.guest.isInternational ? "Passport Required" : "Govt ID Required"}
                        </span>
                      </div>
                    </td>

                    {/* Residence & Purpose */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-semibold text-fg block uppercase">{b.unitId}</span>
                      <span className="text-xs text-gold font-medium block mt-0.5 capitalize">
                        {b.stayPurpose} Stay
                      </span>
                      {b.guest.specialRequests && (
                        <p className="text-xs text-fg-muted italic mt-1 max-w-[200px] leading-relaxed">
                          &ldquo;{b.guest.specialRequests}&rdquo;
                        </p>
                      )}
                    </td>

                    {/* Dates & Occupancy */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-medium text-fg block">
                        {b.checkInDate} → {b.checkOutDate}
                      </span>
                      <span className="text-xs text-fg-muted block mt-0.5">
                        <span className="font-serif oldstyle-nums">{b.totalNights}</span> Nights • {b.adultsCount} Adults{b.kidsCount > 0 ? `, ${b.kidsCount} Kids` : ""}
                      </span>
                    </td>

                    {/* Financial Breakdown */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-fg-muted">Gross:</span>
                          <span className="font-serif oldstyle-nums font-bold text-fg">
                            {formatPrice(b.pricing.grossTotal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-emerald-400">20% Paid:</span>
                          <span className="font-serif oldstyle-nums font-semibold text-emerald-400">
                            {formatPrice(b.pricing.advancePayable)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-line-soft">
                          <span className="text-xs text-gold font-bold">80% Balance:</span>
                          <span className="font-serif oldstyle-nums font-bold text-gold">
                            {formatPrice(b.pricing.balanceDueOnArrival)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Arrival Desk Action */}
                    <td className="py-4 px-4 align-top">
                      {b.balanceCollected ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>80% Balance Collected</span>
                          </span>
                          <span className="text-xs text-fg-muted block">
                            Settled on Arrival (Cash/UPI)
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                            <Clock className="w-3 h-3" /> Pending on Arrival
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMarkBalanceCollected(b.id, b.bookingCode, b.pricing.balanceDueOnArrival)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-110 text-ink font-bold text-xs transition-all shadow-md shadow-gold/15 cursor-pointer"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Mark 80% Collected</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
