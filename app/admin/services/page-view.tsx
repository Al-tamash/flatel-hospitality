"use client";

import * as React from "react";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Check,
  Tag,
  HeartPulse,
  Compass,
  Briefcase,
  Users,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react";
import { AddonRecord } from "@/lib/addon-service";
import { PurposePackage } from "@/lib/mock-rooms";

export default function AdminServicesPage() {
  const [activeTab, setActiveTab] = React.useState<"medical" | "tourism" | "corporate" | "family">("medical");
  const [addons, setAddons] = React.useState<AddonRecord[]>([]);
  const [packages, setPackages] = React.useState<PurposePackage[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saveNote, setSaveNote] = React.useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editPrice, setEditPrice] = React.useState<number>(500);
  const [editType, setEditType] = React.useState<string>("per_booking");

  // Add Service State
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newService, setNewService] = React.useState({
    name: "",
    price: 0,
    pricingType: "per_booking" as "free" | "per_booking" | "per_night" | "quote",
    isFree: false,
    disclaimer: "",
  });

  const fetchServices = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (data.success) {
        setAddons(data.addons || []);
        if (data.packages) setPackages(data.packages);
      } else {
        setError(data.error || "Failed to load services.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load services.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      void fetchServices();
    });
  }, [fetchServices]);

  const currentPkg = packages.find((p) => p.id === activeTab) || packages[0];
  const currentAddons = addons.filter((a) => a.purpose_tag === activeTab);

  const handleToggleFree = async (addon: AddonRecord) => {
    try {
      const newIsFree = !addon.is_free;
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addon.id,
          is_free: newIsFree,
          price: newIsFree ? null : (addon.price || 500),
          pricing_type: newIsFree ? "free" : (addon.pricing_type === "free" ? "per_booking" : addon.pricing_type),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveNote(`Updated ${addon.service_name} to ${newIsFree ? "FREE" : "PAID"}!`);
        setTimeout(() => setSaveNote(null), 3500);
        fetchServices();
      } else {
        alert(data.error || "Failed to update service status.");
      }
    } catch {
      alert("Network error updating service.");
    }
  };

  const handleSaveEdit = async (addonId: string) => {
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: addonId,
          price: editPrice,
          pricing_type: editType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        setSaveNote("Updated service pricing in Supabase!");
        setTimeout(() => setSaveNote(null), 3500);
        fetchServices();
      } else {
        alert(data.error || "Failed to update pricing.");
      }
    } catch {
      alert("Network error updating pricing.");
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = `${activeTab}-${newService.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}`;
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          purpose_tag: activeTab,
          service_name: newService.name,
          is_free: newService.isFree,
          pricing_type: newService.isFree ? "free" : newService.pricingType,
          price: newService.isFree ? null : Number(newService.price),
          disclaimer: newService.disclaimer || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setSaveNote(`Added new service: ${newService.name}!`);
        setTimeout(() => setSaveNote(null), 3500);
        setNewService({
          name: "",
          price: 0,
          pricingType: "per_booking",
          isFree: false,
          disclaimer: "",
        });
        fetchServices();
      } else {
        alert(data.error || "Failed to add service.");
      }
    } catch {
      alert("Network error adding service.");
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Delete service "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/services?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSaveNote(`Deleted service ${name}.`);
        setTimeout(() => setSaveNote(null), 3000);
        fetchServices();
      } else {
        alert(data.error || "Failed to delete service.");
      }
    } catch {
      alert("Network error deleting service.");
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] uppercase text-gold mb-1">
            Guest Personalization
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-fg">
            Stay Add-On Services Manager
          </h1>
          <p className="text-xs sm:text-sm text-fg-muted mt-1">
            Dynamic database configuration of complimentary inclusions and paid services across PRD stay purposes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchServices}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-raised border border-line text-xs text-fg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gold" : "text-gold"}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-110 text-ink font-bold text-xs transition-all shadow-md shadow-gold/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Add-on Service</span>
          </button>
        </div>
      </div>

      {saveNote && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveNote}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Stay Purpose Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line-soft pb-3">
        {[
          { id: "medical", label: "Medistay Healthcare", icon: HeartPulse },
          { id: "tourism", label: "Tourism & Heritage", icon: Compass },
          { id: "corporate", label: "Corporate Executive", icon: Briefcase },
          { id: "family", label: "Family Vacation", icon: Users },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "medical" | "tourism" | "corporate" | "family")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-gold to-gold-deep text-ink font-bold shadow-sm shadow-gold/20"
                  : "bg-surface text-fg-muted hover:text-fg hover:bg-raised border border-line-soft"
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complimentary Free Services */}
        <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-normal text-fg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Complimentary Inclusions (100% Free)</span>
              </h3>
              <p className="text-xs text-fg-muted mt-0.5">
                Included with every confirmed reservation for this stay category.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
              FREE
            </span>
          </div>

          <div className="space-y-2.5">
            {currentPkg?.complimentaryServices?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 rounded-xl bg-surface border border-line-soft"
              >
                <div>
                  <span className="text-xs font-semibold text-fg block">{item.name}</span>
                  {item.disclaimer && (
                    <span className="text-xs text-fg-muted block mt-0.5">{item.disclaimer}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
                  Included
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Paid / Configurable Add-ons */}
        <div className="rounded-2xl bg-raised/75 border border-line backdrop-blur-md p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-normal text-fg flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold" />
                <span>Selectable Add-On Services</span>
              </h3>
              <p className="text-xs text-fg-muted mt-0.5">
                Toggle Free/Paid status or adjust nightly and flat rates.
              </p>
            </div>
            <span className="text-xs font-serif oldstyle-nums font-bold text-gold bg-gold/10 px-2.5 py-0.5 rounded border border-line">
              {currentAddons.length} Services
            </span>
          </div>

          <div className="space-y-3">
            {currentAddons.map((addon) => {
              const isEditing = editingId === addon.id;

              return (
                <div
                  key={addon.id}
                  className="p-3.5 rounded-xl bg-surface border border-line-soft space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-fg block">
                        {addon.service_name}
                      </span>
                      {addon.disclaimer && (
                        <span className="text-xs text-fg-muted block mt-0.5">
                          {addon.disclaimer}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap font-serif oldstyle-nums ${
                          addon.is_free
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-gold/15 text-gold border border-line"
                        }`}
                      >
                        {addon.is_free
                          ? "FREE"
                          : addon.price
                          ? `₹${addon.price} ${addon.pricing_type === "per_night" ? "/ night" : ""}`
                          : "Custom Quote"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(addon.id, addon.service_name)}
                        className="text-rose-400/60 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                        title="Delete service"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 pt-2 border-t border-line-soft">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-24 bg-ink border border-control rounded-lg px-2 py-1 text-xs text-fg focus:border-gold focus:outline-none"
                        placeholder="Price (₹)"
                      />
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="bg-ink border border-control rounded-lg px-2 py-1 text-xs text-fg focus:border-gold focus:outline-none"
                      >
                        <option value="per_booking" className="bg-surface text-fg">Per Booking</option>
                        <option value="per_night" className="bg-surface text-fg">Per Night</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(addon.id)}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-gold to-gold-deep hover:brightness-110 text-ink font-bold text-xs cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 rounded-lg bg-raised text-fg-muted hover:text-fg text-xs border border-line-soft cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-line-soft text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleFree(addon)}
                        className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                      >
                        {addon.is_free ? "Convert to Paid" : "Make Complimentary [FREE]"}
                      </button>
                      {!addon.is_free && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(addon.id);
                            setEditPrice(addon.price || 500);
                            setEditType(addon.pricing_type || "per_booking");
                          }}
                          className="text-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit Rate</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL: ADD CUSTOM SERVICE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/85 backdrop-blur-sm p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="add-service-title" className="bg-raised/95 border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 id="add-service-title" className="font-serif text-base font-normal text-fg flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold" />
                <span>Add Add-on Service to {activeTab.toUpperCase()}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add service form"
                className="text-fg-muted hover:text-fg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="new-service-name" className="text-xs font-medium tracking-[0.18em] uppercase text-fg-muted block mb-1">
                  Service Title
                </label>
                <input
                  id="new-service-name"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. In-Room Physiotherapist Visit"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full bg-surface/90 border border-control rounded-lg px-3 py-2 text-fg focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none placeholder-fg-faint"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freeCheck"
                  checked={newService.isFree}
                  onChange={(e) => setNewService({ ...newService, isFree: e.target.checked })}
                  className="rounded border-line accent-gold"
                />
                <label htmlFor="freeCheck" className="text-fg font-medium cursor-pointer">
                  Complimentary / Free Inclusion
                </label>
              </div>

              {!newService.isFree && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-service-price" className="text-xs font-medium tracking-[0.18em] uppercase text-fg-muted block mb-1">
                      Price (₹)
                    </label>
                    <input
                      id="new-service-price"
                      type="number"
                      required
                      min={1}
                      step={1}
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                      className="w-full bg-surface/90 border border-control rounded-lg px-3 py-2 text-fg focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-service-pricing-type" className="text-xs font-medium tracking-[0.18em] uppercase text-fg-muted block mb-1">
                      Pricing Type
                    </label>
                    <select
                      id="new-service-pricing-type"
                      value={newService.pricingType}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          pricingType: e.target.value as "per_booking" | "per_night",
                        })
                      }
                      className="w-full bg-surface/90 border border-line rounded-lg px-3 py-2 text-fg focus:border-gold focus:outline-none"
                    >
                      <option value="per_booking" className="bg-surface text-fg">Per Booking</option>
                      <option value="per_night" className="bg-surface text-fg">Per Night</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="new-service-disclaimer" className="text-xs font-medium tracking-[0.18em] uppercase text-fg-muted block mb-1">
                  Disclaimer / Details
                </label>
                <input
                  id="new-service-disclaimer"
                  type="text"
                  maxLength={240}
                  placeholder="Optional details or third-party coordination notes"
                  value={newService.disclaimer}
                  onChange={(e) => setNewService({ ...newService, disclaimer: e.target.value })}
                  className="w-full bg-surface/90 border border-control rounded-lg px-3 py-2 text-fg focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none placeholder-fg-faint"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-raised text-fg-muted hover:text-fg border border-line-soft transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold to-gold-deep hover:brightness-110 text-ink font-bold transition-all shadow-md shadow-gold/15 cursor-pointer"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
