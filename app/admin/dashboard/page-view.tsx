"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  Banknote,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { BookingRecord } from "@/types/booking";

interface DashboardStats {
  todayArrivals: number;
  activeOccupancies: number;
  totalAdvanceCollected: number;
  pendingBalanceDue: number;
  occupancyRate: number;
  totalBookings: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats>({
    todayArrivals: 0,
    activeOccupancies: 0,
    totalAdvanceCollected: 0,
    pendingBalanceDue: 0,
    occupancyRate: 0,
    totalBookings: 0,
  });
  const [recentBookings, setRecentBookings] = React.useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/bookings?limit=5"),
      ]);

      const statsData = await statsRes.json();
      const bookingsData = await bookingsRes.json();

      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
      if (bookingsData.success && bookingsData.bookings) {
        setRecentBookings(bookingsData.bookings);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      void fetchDashboardData();
    });
  }, [fetchDashboardData]);

  const handleCollectBalance = async (bookingId: string, bookingCode: string, balanceDue: number) => {
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
        setActionSuccess(`Marked 80% balance collected for ${bookingCode}!`);
        setTimeout(() => setActionSuccess(null), 4000);
        fetchDashboardData();
      } else {
        alert(data.error || "Failed to update balance collection status.");
      }
    } catch {
      alert("Network error updating balance.");
    }
  };

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto font-sans">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-gold mb-1">
            Executive Operations
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-fg">
            Hospitality Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-fg-muted mt-1">
            Real-time occupancy, arrivals, and 20% advance / 80% on-arrival collection metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-raised border border-line text-xs text-fg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gold" : "text-gold"}`} />
            <span>Refresh</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-gold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Operations · Hyderabad</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 PRD KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Today's Arrivals */}
        <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-fg-muted">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">Today&apos;s Arrivals</span>
            <div className="h-8 w-8 rounded-xl bg-surface border border-line-soft flex items-center justify-center text-gold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif oldstyle-nums text-3xl font-normal text-fg">
              {stats.todayArrivals}
            </span>
            <span className="text-xs text-fg-muted block mt-0.5">
              Check-in window: <span className="font-serif oldstyle-nums">11:00 AM – 1:00 PM</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Active Occupancies */}
        <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-fg-muted">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">Active Occupancies</span>
            <div className="h-8 w-8 rounded-xl bg-surface border border-line-soft flex items-center justify-center text-gold">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif oldstyle-nums text-3xl font-normal text-gold">
              {stats.activeOccupancies} <span className="text-base text-fg-muted font-normal">/ 5 Units</span>
            </span>
            <span className="text-xs text-emerald-400 block mt-0.5 font-serif oldstyle-nums">
              {stats.occupancyRate}% Current Capacity
            </span>
          </div>
        </div>

        {/* Metric 3: 20% Advance Online Collected */}
        <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-fg-muted">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">20% Online Deposit</span>
            <div className="h-8 w-8 rounded-xl bg-surface border border-line-soft flex items-center justify-center text-gold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif oldstyle-nums text-3xl font-normal text-fg">
              {formatPrice(stats.totalAdvanceCollected)}
            </span>
            <span className="text-xs text-fg-muted block mt-0.5">
              Secured via Razorpay Gateway
            </span>
          </div>
        </div>

        {/* Metric 4: Pending 80% On-Arrival Collections */}
        <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-fg-muted">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">80% Due on Arrival</span>
            <div className="h-8 w-8 rounded-xl bg-surface border border-line-soft flex items-center justify-center text-gold">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif oldstyle-nums text-3xl font-normal text-gold">
              {formatPrice(stats.pendingBalanceDue)}
            </span>
            <span className="text-xs text-fg-muted block mt-0.5">
              Payable via Cash / UPI at property
            </span>
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md overflow-hidden shadow-xl">
        <div className="p-5 border-b border-line-soft flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-normal text-fg">
              Recent Bookings & Collection Actions
            </h3>
            <p className="text-xs text-fg-muted mt-0.5">
              Review guest arrivals, verify original ID proofs, and collect the 80% arrival balance.
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All ({stats.totalBookings})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentBookings.length === 0 ? (
            <div className="p-10 text-center text-fg-muted text-xs">
              No reservations recorded yet. New guest bookings will appear here automatically in real time.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/90 text-xs font-medium text-fg-muted uppercase tracking-[0.18em] border-b border-line-soft">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Flat Residence</th>
                  <th className="py-3 px-4">Stay Dates</th>
                  <th className="py-3 px-4">20% Paid</th>
                  <th className="py-3 px-4">80% Balance</th>
                  <th className="py-3 px-4">Collection Status</th>
                  <th className="py-3 px-4">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft text-fg">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-raised/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gold">{b.bookingCode}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold block text-fg">{b.guest.fullName}</span>
                      <span className="text-xs text-fg-muted">{b.guest.phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium uppercase text-fg">{b.unitId}</span>
                      <span className="text-xs text-fg-muted block capitalize">{b.stayPurpose} stay</span>
                    </td>
                    <td className="py-3 px-4 text-fg-muted">
                      {b.checkInDate} → {b.checkOutDate} <span className="font-serif oldstyle-nums">({b.totalNights}N)</span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold font-serif oldstyle-nums">
                      {formatPrice(b.pricing.advancePayable)}
                    </td>
                    <td className="py-3 px-4 font-bold text-gold font-serif oldstyle-nums">
                      {formatPrice(b.pricing.balanceDueOnArrival)}
                    </td>
                    <td className="py-3 px-4">
                      {b.balanceCollected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
                          <CheckCircle2 className="w-3 h-3" /> Collected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                          <Clock className="w-3 h-3" /> Pending on Arrival
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {!b.balanceCollected && (
                        <button
                          type="button"
                          onClick={() => handleCollectBalance(b.id, b.bookingCode, b.pricing.balanceDueOnArrival)}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-gold to-gold-deep hover:brightness-110 text-ink font-bold text-xs transition-all whitespace-nowrap shadow-sm shadow-gold/20 cursor-pointer"
                        >
                          Mark Collected
                        </button>
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
