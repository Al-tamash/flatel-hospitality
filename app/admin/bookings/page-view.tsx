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
          <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#E5C178] mb-1">
            Audit & Collections
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#FAF4EB] tracking-tight">
            Reservations & Collections Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#B8A692] mt-1">
            Track guest bookings, verify domestic/international ID proofs, and collect the 80% balance on arrival.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBookings}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16100B] hover:bg-[#221810] border border-[rgba(212,163,89,0.25)] text-xs text-[#FAF4EB] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#E5C178]" : "text-[#E5C178]"}`} />
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-[rgba(34,24,16,0.75)] p-4 rounded-2xl border border-[rgba(212,163,89,0.25)] backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#B8A692] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search reservations"
            placeholder="Search by Booking ID (FLT-xxxxx), guest name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#16100B]/90 border border-[rgba(212,163,89,0.25)] rounded-xl pl-10 pr-4 py-2 text-xs text-[#FAF4EB] placeholder-[#8C7E72] focus:outline-none focus:border-[#E5C178] focus:ring-1 focus:ring-[#E5C178] transition-colors"
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
                  ? "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold shadow-sm shadow-[#E5C178]/20"
                  : "bg-[#16100B] text-[#B8A692] hover:text-[#FAF4EB] hover:bg-[#221810] border border-[rgba(212,163,89,0.2)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-[rgba(34,24,16,0.75)] border border-[rgba(212,163,89,0.25)] backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-[#B8A692] text-xs">
              No reservations matched your criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#16100B]/90 text-[10px] font-medium text-[#B8A692] uppercase tracking-[0.18em] border-b border-[rgba(212,163,89,0.18)]">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Guest Information</th>
                  <th className="py-3.5 px-4">Residence & Stay Purpose</th>
                  <th className="py-3.5 px-4">Dates & Occupancy</th>
                  <th className="py-3.5 px-4">Payment Breakdown</th>
                  <th className="py-3.5 px-4">Arrival Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(212,163,89,0.12)] text-[#FAF4EB]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#221810]/70 transition-colors">
                    {/* Booking Code & Status */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-mono font-bold text-sm text-[#E5C178] block">
                        {b.bookingCode}
                      </span>
                      <span className="text-[10px] text-[#B8A692] block mt-0.5">
                        {new Date(b.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      <div className="mt-2">
                        <select
                          value={b.bookingStatus}
                          aria-label={`Change status for booking ${b.bookingCode}`}
                          onChange={(e) => handleUpdateStatus(b.id, b.bookingCode, e.target.value)}
                          className="bg-[#16100B] border border-[rgba(212,163,89,0.25)] text-[11px] text-[#FAF4EB] rounded-lg px-2 py-1 focus:border-[#E5C178] focus:outline-none"
                        >
                          <option value="pending" className="bg-[#16100B] text-[#FAF4EB]">Pending</option>
                          <option value="confirmed" className="bg-[#16100B] text-[#FAF4EB]">Confirmed</option>
                          <option value="checked_in" className="bg-[#16100B] text-[#FAF4EB]">Checked In</option>
                          <option value="completed" className="bg-[#16100B] text-[#FAF4EB]">Completed</option>
                          <option value="cancelled" className="bg-[#16100B] text-[#FAF4EB]">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Guest Information */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-semibold text-[#FAF4EB] text-sm block">{b.guest.fullName}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#B8A692] mt-1">
                        <Phone className="w-3 h-3 text-[#E5C178]" />
                        <span>{b.guest.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#B8A692] mt-0.5">
                        <Mail className="w-3 h-3 text-[#8C7E72]" />
                        <span className="truncate max-w-[180px]">{b.guest.email}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/25">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          {b.guest.isInternational ? "Passport Required" : "Govt ID Required"}
                        </span>
                      </div>
                    </td>

                    {/* Residence & Purpose */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-semibold text-[#FAF4EB] block uppercase">{b.unitId}</span>
                      <span className="text-[11px] text-[#E5C178] font-medium block mt-0.5 capitalize">
                        {b.stayPurpose} Stay
                      </span>
                      {b.guest.specialRequests && (
                        <p className="text-[10px] text-[#B8A692] italic mt-1 max-w-[200px] leading-relaxed">
                          &ldquo;{b.guest.specialRequests}&rdquo;
                        </p>
                      )}
                    </td>

                    {/* Dates & Occupancy */}
                    <td className="py-4 px-4 align-top">
                      <span className="font-medium text-[#FAF4EB] block">
                        {b.checkInDate} → {b.checkOutDate}
                      </span>
                      <span className="text-[11px] text-[#B8A692] block mt-0.5">
                        <span className="font-serif oldstyle-nums">{b.totalNights}</span> Nights • {b.adultsCount} Adults{b.kidsCount > 0 ? `, ${b.kidsCount} Kids` : ""}
                      </span>
                    </td>

                    {/* Financial Breakdown */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[11px] text-[#B8A692]">Gross:</span>
                          <span className="font-serif oldstyle-nums font-bold text-[#FAF4EB]">
                            {formatPrice(b.pricing.grossTotal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[11px] text-emerald-400">20% Paid:</span>
                          <span className="font-serif oldstyle-nums font-semibold text-emerald-400">
                            {formatPrice(b.pricing.advancePayable)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-[rgba(212,163,89,0.18)]">
                          <span className="text-[11px] text-[#E5C178] font-bold">80% Balance:</span>
                          <span className="font-serif oldstyle-nums font-bold text-[#E5C178]">
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
                          <span className="text-[10px] text-[#B8A692] block">
                            Settled on Arrival (Cash/UPI)
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                            <Clock className="w-3 h-3" /> Pending on Arrival
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMarkBalanceCollected(b.id, b.bookingCode, b.pricing.balanceDueOnArrival)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-110 text-[#140E08] font-bold text-xs transition-all shadow-md shadow-[#E5C178]/15 cursor-pointer"
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
