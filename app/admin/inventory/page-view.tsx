"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  MapPin,
  Users,
  Save,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ImageIcon,
  ListChecks,
  FileText,
  Compass,
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { RoomDetail, Amenity } from "@/lib/mock-rooms";
import { cn } from "@/lib/utils";

const MASTER_AMENITIES_OPTIONS = [
  "Split Air Conditioning",
  "High-Speed Fiber Wi-Fi",
  "Private Modular Kitchen",
  "Smart Android TV",
  "Double-Door Refrigerator",
  "Laundry Washing Machine",
  "Free Covered Parking",
  "100% Inverter Backup",
  "Passenger Elevator Lift",
  "Water Softening Geyser",
  "Alternate-Day Housekeeping",
  "24/7 Security CCTV",
];

interface FlatEditState {
  slug: string;
  title: string;
  category: "1BHK" | "2BHK" | "3BHK" | "4BHK" | "5BHK";
  branchSlug: string;
  basePricePerNight: number;
  extraPersonFeePerNight: number;
  baseAdults: number;
  maxAdults: number;
  maxKids: number;
  totalUnits: number;
  shortDescription: string;
  fullDescription: string;
  specs: {
    bedrooms: string;
    bathroom: string;
    kitchen: string;
    areaSqFt: string;
  };
  imageUrls: string;
  amenityNames: string[];
  landmarks: Array<{ name: string; dist: string; time: string }>;
}

export default function AdminInventoryPage() {
  const [rooms, setRooms] = React.useState<RoomDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null);

  // Comprehensive Edit Modal State
  const [editModalRoom, setEditModalRoom] = React.useState<FlatEditState | null>(null);
  const [activeTab, setActiveTab] = React.useState<
    "pricing" | "content" | "specs" | "photos" | "amenities" | "landmarks"
  >("pricing");

  // Modal for adding new unit
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addFormError, setAddFormError] = React.useState<string | null>(null);
  const [newUnitAmenities, setNewUnitAmenities] = React.useState<string[]>([]);
  const [newUnitForm, setNewUnitForm] = React.useState({
    title: "",
    category: "" as RoomDetail["category"] | "",
    slug: "",
    branchSlug: "",
    basePricePerNight: null as number | null,
    baseAdults: null as number | null,
    maxAdults: null as number | null,
    maxKids: null as number | null,
    extraPersonFeePerNight: null as number | null,
    totalUnits: null as number | null,
    shortDescription: "",
    fullDescription: "",
    guestCapacity: "",
    bedrooms: "",
    bathroom: "",
    kitchen: "",
    areaSqFt: "",
    imageUrls: "",
  });

  const fetchInventory = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.success) {
        setRooms(data.units || []);
      } else {
        setError(data.error || "Failed to load inventory.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      void fetchInventory();
    });
  }, [fetchInventory]);

  const openFullEditModal = (room: RoomDetail) => {
    const rawImages = room.gallery
      .map((g) => g.url || "")
      .filter((url) => Boolean(url) && !url.startsWith("meta:"));

    const defaultLandmarks = room.landmarks ?? [];

    setEditModalRoom({
      slug: room.slug,
      title: room.title,
      category: room.category,
      branchSlug: room.branchSlug || "moghal-pura",
      basePricePerNight: room.basePricePerNight,
      extraPersonFeePerNight: room.extraPersonFeePerNight || 500,
      baseAdults: room.baseAdults,
      maxAdults: room.maxAdults,
      maxKids: room.maxChildren ?? 2,
      totalUnits: room.totalUnits || 1,
      shortDescription: room.shortDescription || "",
      fullDescription: room.fullDescription || room.shortDescription || "",
      specs: {
        bedrooms: room.specs?.bedrooms || `${room.category.replace("BHK", "")} Master Bedrooms`,
        bathroom: room.specs?.bathroom || "Modern Bathrooms with Softening Geysers",
        kitchen: room.specs?.kitchen || "Fully Equipped Modular Kitchen",
        areaSqFt: (room.specs as { areaSqFt?: string })?.areaSqFt || `${Number(room.category.replace("BHK", "")) * 450} sq.ft.`,
      },
      imageUrls: rawImages.join("\n"),
      amenityNames: room.amenities?.map((a) => a.name) || MASTER_AMENITIES_OPTIONS.slice(0, 8),
      landmarks: defaultLandmarks,
    });
    setActiveTab("pricing");
  };

  const handleSaveModal = async () => {
    if (!editModalRoom) return;
    setIsSaving(true);
    try {
      const cleanImages = editModalRoom.imageUrls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const amenitiesList: Amenity[] = editModalRoom.amenityNames.map((name) => {
        let iconName: Amenity["iconName"] = "Wifi";
        const lower = name.toLowerCase();
        if (lower.includes("ac") || lower.includes("air")) iconName = "Flame";
        else if (lower.includes("tv")) iconName = "Tv";
        else if (lower.includes("kitchen")) iconName = "UtensilsCrossed";
        else if (lower.includes("fridge")) iconName = "Refrigerator";
        else if (lower.includes("lift") || lower.includes("elevator")) iconName = "ArrowUpDown";
        else if (lower.includes("water") || lower.includes("geyser")) iconName = "Droplets";
        else if (lower.includes("power") || lower.includes("inverter")) iconName = "Zap";

        return {
          name,
          description: "Verified apartment inclusion",
          iconName,
        };
      });

      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: editModalRoom.slug,
          title: editModalRoom.title,
          category: editModalRoom.category,
          branchSlug: editModalRoom.branchSlug,
          basePricePerNight: editModalRoom.basePricePerNight,
          extraPersonFeePerNight: editModalRoom.extraPersonFeePerNight,
          baseAdults: editModalRoom.baseAdults,
          maxAdults: editModalRoom.maxAdults,
          maxKids: editModalRoom.maxKids,
          totalUnits: editModalRoom.totalUnits,
          images: cleanImages,
          shortDescription: editModalRoom.shortDescription,
          fullDescription: editModalRoom.fullDescription,
          specs: {
            guests: `Up to ${editModalRoom.maxAdults} Guests`,
            bedrooms: editModalRoom.specs.bedrooms,
            bathroom: editModalRoom.specs.bathroom,
            kitchen: editModalRoom.specs.kitchen,
            areaSqFt: editModalRoom.specs.areaSqFt,
          },
          amenities: amenitiesList,
          landmarks: editModalRoom.landmarks.filter((l) => l.name.trim()),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditModalRoom(null);
        setSaveSuccess(`Updated ${editModalRoom.title} (${editModalRoom.slug.toUpperCase()}) successfully!`);
        setTimeout(() => setSaveSuccess(null), 3500);
        fetchInventory();
      } else {
        alert(data.error || "Failed to save unit updates.");
      }
    } catch {
      alert("Network error saving unit.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);
    const cleanImages = newUnitForm.imageUrls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (
      !newUnitForm.title.trim() ||
      !newUnitForm.category ||
      !newUnitForm.slug.trim() ||
      !newUnitForm.branchSlug ||
      !newUnitForm.shortDescription.trim() ||
      !newUnitForm.fullDescription.trim() ||
      !newUnitForm.guestCapacity.trim() ||
      !newUnitForm.bedrooms.trim() ||
      !newUnitForm.bathroom.trim() ||
      !newUnitForm.kitchen.trim() ||
      cleanImages.length === 0 ||
      newUnitForm.basePricePerNight === null ||
      newUnitForm.basePricePerNight <= 0 ||
      newUnitForm.baseAdults === null ||
      newUnitForm.baseAdults < 1 ||
      newUnitForm.maxAdults === null ||
      newUnitForm.maxAdults < newUnitForm.baseAdults ||
      newUnitForm.maxKids === null ||
      newUnitForm.maxKids < 0 ||
      newUnitForm.extraPersonFeePerNight === null ||
      newUnitForm.extraPersonFeePerNight < 0 ||
      newUnitForm.totalUnits === null ||
      newUnitForm.totalUnits < 1
    ) {
      setAddFormError("Enter verified residence details, pricing, capacity, branch, and at least one photo before creating the listing.");
      return;
    }

    setIsSaving(true);
    try {
      const amenitiesList: Amenity[] = newUnitAmenities.map((name) => {
        const lower = name.toLowerCase();
        let iconName: Amenity["iconName"] = "Wifi";
        if (lower.includes("air") || lower.includes("ac")) iconName = "Flame";
        else if (lower.includes("tv")) iconName = "Tv";
        else if (lower.includes("kitchen")) iconName = "UtensilsCrossed";
        else if (lower.includes("refrigerator")) iconName = "Refrigerator";
        else if (lower.includes("elevator")) iconName = "ArrowUpDown";
        else if (lower.includes("water") || lower.includes("geyser") || lower.includes("laundry")) iconName = "Droplets";
        else if (lower.includes("power") || lower.includes("inverter")) iconName = "Zap";
        return { name, description: "Included in base rent", iconName };
      });

      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUnitForm,
          images: cleanImages,
          specs: {
            guests: newUnitForm.guestCapacity.trim(),
            bedrooms: newUnitForm.bedrooms,
            bathroom: newUnitForm.bathroom,
            kitchen: newUnitForm.kitchen,
            areaSqFt: newUnitForm.areaSqFt,
          },
          amenities: amenitiesList,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setSaveSuccess(`Created ${newUnitForm.category} (${newUnitForm.title}) successfully!`);
        setTimeout(() => setSaveSuccess(null), 4000);
        fetchInventory();
      } else {
        setAddFormError(data.error || "Failed to create new residence.");
      }
    } catch {
      alert("Network error creating unit.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete ${title} (${slug})?`)) return;

    try {
      const res = await fetch(`/api/admin/inventory?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(`Deleted ${slug} from inventory.`);
        setTimeout(() => setSaveSuccess(null), 3500);
        fetchInventory();
      } else {
        alert(data.error || "Failed to delete unit.");
      }
    } catch {
      alert("Network error deleting unit.");
    }
  };

  const toggleAmenity = (amenityName: string) => {
    if (!editModalRoom) return;
    setEditModalRoom({
      ...editModalRoom,
      amenityNames: editModalRoom.amenityNames.includes(amenityName)
        ? editModalRoom.amenityNames.filter((a) => a !== amenityName)
        : [...editModalRoom.amenityNames, amenityName],
    });
  };

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#E5C178] mb-1">
            Dynamic Residence Inventory
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl font-normal text-[#FAF4EB] tracking-tight">
            Inventory &amp; Content Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#B8A692] mt-1">
            Control live nightly rates, photos, descriptions, specs, amenities &amp; landmarks for every flat.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchInventory}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16100B] hover:bg-[#221810] border border-[rgba(212,163,89,0.25)] text-xs text-[#FAF4EB] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#E5C178]" : "text-[#E5C178]"}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-110 text-[#140E08] font-bold text-xs transition-all shadow-md shadow-[#E5C178]/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Residence Category</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Flats List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const photoUrl = room.gallery[0]?.url || `/images/flats/flat-${room.slug}-luxury.jpg`;

          return (
            <div
              key={room.id}
              className="rounded-2xl bg-[rgba(34,24,16,0.75)] border border-[rgba(212,163,89,0.25)] backdrop-blur-md overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-[16/9] w-full bg-[#16100B]">
                  <Image
                    src={photoUrl}
                    alt={room.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FAF4EB] px-2.5 py-1 rounded-xl bg-[#16100B]/85 backdrop-blur-md border border-[rgba(212,163,89,0.3)]">
                      <MapPin className="w-3 h-3 text-[#E5C178]" />
                      <span>{room.branchSlug === "barkas-salala" ? "Barkas Salala" : "Moghal Pura"}</span>
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-xs font-bold text-[#140E08] px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] shadow-sm shadow-[#E5C178]/20">
                      {room.type}
                    </span>
                  </div>
                </div>

                {/* Flat Details Card Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg font-normal text-[#FAF4EB]">
                        {room.title}
                      </h3>
                      <p className="text-[11px] text-[#B8A692] mt-0.5 line-clamp-2">
                        {room.shortDescription}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-heading oldstyle-nums text-[#E5C178] font-bold">
                        {formatPrice(room.basePricePerNight)}
                      </span>
                      <span className="text-xs text-[#B8A692] block">/ night</span>
                    </div>
                  </div>

                  {/* Quick Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#B8A692] pt-2 border-t border-[rgba(212,163,89,0.18)]">
                    <div className="p-2 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.15)]">
                      <span className="block text-[10px] uppercase text-[#E5C178]">Base Guests</span>
                      <span className="text-[#FAF4EB] font-medium">{room.baseAdults} Adults</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.15)]">
                      <span className="block text-[10px] uppercase text-[#E5C178]">Max Guests</span>
                      <span className="text-[#FAF4EB] font-medium">{room.maxAdults} Adults</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.15)]">
                      <span className="block text-[10px] uppercase text-[#E5C178]">Extra Fee</span>
                      <span className="text-[#FAF4EB] font-medium">₹{room.extraPersonFeePerNight}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#16100B] border border-[rgba(212,163,89,0.15)]">
                      <span className="block text-[10px] uppercase text-[#E5C178]">Photos</span>
                      <span className="text-[#FAF4EB] font-medium">{room.gallery.length} Images</span>
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {room.amenities.slice(0, 4).map((am) => (
                      <span
                        key={am.name}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#16100B] border border-[rgba(212,163,89,0.2)] text-[#FAF4EB]"
                      >
                        ✓ {am.name}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md text-[#E5C178]">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-[rgba(212,163,89,0.18)] flex items-center justify-between">
                    <Link
                      href={`/properties/${room.slug}`}
                      target="_blank"
                      className="text-xs text-[#B8A692] hover:text-[#FAF4EB] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>View Live Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openFullEditModal(room)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08] font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Flat Content</span>
                      </button>

                      {room.category === "5BHK" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUnit(room.slug, room.title)}
                          className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 cursor-pointer transition-colors"
                          title="Delete unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* COMPREHENSIVE FULL EDIT MODAL                            */}
      {/* ======================================================== */}
      {editModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0A07]/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#16100B] border border-[rgba(212,163,89,0.3)] rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[rgba(212,163,89,0.2)] flex items-center justify-between shrink-0 bg-[#16100B]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C178]">
                  Edit Flat Inventory &amp; Content
                </span>
                <h2 className="font-heading text-lg sm:text-xl font-normal text-[#FAF4EB]">
                  {editModalRoom.title} ({editModalRoom.category})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditModalRoom(null)}
                className="h-8 w-8 rounded-full bg-[#221810] hover:bg-[#2a1e14] text-[#FAF4EB] flex items-center justify-center border border-[rgba(212,163,89,0.25)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-[rgba(212,163,89,0.2)] px-4 sm:px-6 bg-[#16100B]/80 text-xs overflow-x-auto shrink-0 gap-2">
              {[
                { id: "pricing", label: "Pricing & Capacity", icon: Users },
                { id: "content", label: "Descriptions", icon: FileText },
                { id: "specs", label: "Specs & Layout", icon: Compass },
                { id: "photos", label: "Gallery Photos", icon: ImageIcon },
                { id: "amenities", label: "Amenities", icon: ListChecks },
                { id: "landmarks", label: "Nearby Places", icon: MapPin },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className={cn(
                      "py-3 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer",
                      isActive
                        ? "border-[#E5C178] text-[#E5C178]"
                        : "border-transparent text-[#B8A692] hover:text-[#FAF4EB]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Tab Contents */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs text-[#FAF4EB]">
              {/* TAB 1: PRICING & CAPACITY */}
              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                      Residence Title
                    </label>
                    <input
                      type="text"
                      value={editModalRoom.title}
                      onChange={(e) => setEditModalRoom({ ...editModalRoom, title: e.target.value })}
                      className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Base Nightly Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={editModalRoom.basePricePerNight}
                        onChange={(e) =>
                          setEditModalRoom({
                            ...editModalRoom,
                            basePricePerNight: Number(e.target.value),
                          })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Extra Person Fee / Night (₹)
                      </label>
                      <input
                        type="number"
                        value={editModalRoom.extraPersonFeePerNight}
                        onChange={(e) =>
                          setEditModalRoom({
                            ...editModalRoom,
                            extraPersonFeePerNight: Number(e.target.value),
                          })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Base Adults Included
                      </label>
                      <input
                        type="number"
                        value={editModalRoom.baseAdults}
                        onChange={(e) =>
                          setEditModalRoom({ ...editModalRoom, baseAdults: Number(e.target.value) })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Maximum Adult Limit
                      </label>
                      <input
                        type="number"
                        value={editModalRoom.maxAdults}
                        onChange={(e) =>
                          setEditModalRoom({ ...editModalRoom, maxAdults: Number(e.target.value) })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Physical Units In Property
                      </label>
                      <input
                        type="number"
                        value={editModalRoom.totalUnits}
                        onChange={(e) =>
                          setEditModalRoom({ ...editModalRoom, totalUnits: Number(e.target.value) })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                      Assigned Branch Location
                    </label>
                    <select
                      value={editModalRoom.branchSlug}
                      onChange={(e) =>
                        setEditModalRoom({ ...editModalRoom, branchSlug: e.target.value })
                      }
                      className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                    >
                      <option value="moghal-pura">Moghal Pura (Near Charminar &amp; Deccan Medical)</option>
                      <option value="barkas-salala">Barkas Salala (Near Airport &amp; Owaisi Hospital)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTENT & DESCRIPTIONS */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                      Short Overview (Shown on cards and top of details page)
                    </label>
                    <textarea
                      rows={3}
                      value={editModalRoom.shortDescription}
                      onChange={(e) =>
                        setEditModalRoom({ ...editModalRoom, shortDescription: e.target.value })
                      }
                      className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                      Full In-Depth Description
                    </label>
                    <textarea
                      rows={5}
                      value={editModalRoom.fullDescription}
                      onChange={(e) =>
                        setEditModalRoom({ ...editModalRoom, fullDescription: e.target.value })
                      }
                      className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SPECS & LAYOUT */}
              {activeTab === "specs" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Bedrooms Spec Label
                      </label>
                      <input
                        type="text"
                        value={editModalRoom.specs.bedrooms}
                        onChange={(e) =>
                          setEditModalRoom({
                            ...editModalRoom,
                            specs: { ...editModalRoom.specs, bedrooms: e.target.value },
                          })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Bathrooms Spec Label
                      </label>
                      <input
                        type="text"
                        value={editModalRoom.specs.bathroom}
                        onChange={(e) =>
                          setEditModalRoom({
                            ...editModalRoom,
                            specs: { ...editModalRoom.specs, bathroom: e.target.value },
                          })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Kitchen Spec Label
                      </label>
                      <input
                        type="text"
                        value={editModalRoom.specs.kitchen}
                        onChange={(e) =>
                          setEditModalRoom({
                            ...editModalRoom,
                            specs: { ...editModalRoom.specs, kitchen: e.target.value },
                          })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                        Residence Area (Sq.Ft.)
                      </label>
                      <input
                        type="text"
                        value={editModalRoom.specs.areaSqFt}
                        onChange={(e) =>
                          setEditModalRoom({
                            ...editModalRoom,
                            specs: { ...editModalRoom.specs, areaSqFt: e.target.value },
                          })
                        }
                        className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GALLERY PHOTOS */}
              {activeTab === "photos" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                      Gallery Photo URLs (One URL per line &bull; Local path or HTTPS link)
                    </label>
                    <textarea
                      rows={5}
                      value={editModalRoom.imageUrls}
                      onChange={(e) =>
                        setEditModalRoom({ ...editModalRoom, imageUrls: e.target.value })
                      }
                      className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] font-mono text-xs focus:border-[#E5C178] focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-2">
                      Live Preview of Photo Gallery:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {editModalRoom.imageUrls
                        .split("\n")
                        .map((u) => u.trim())
                        .filter(Boolean)
                        .map((url, i) => (
                          <div
                            key={url + i}
                            className="relative aspect-video rounded-xl overflow-hidden bg-[#140E08] border border-[rgba(212,163,89,0.2)]"
                          >
                            <Image
                              src={url}
                              alt={`Preview ${i + 1}`}
                              fill
                              sizes="160px"
                              className="object-cover"
                            />
                            <span className="absolute bottom-1 right-1 bg-[#0E0A07]/80 text-[#FAF4EB] px-1.5 py-0.5 rounded text-[9px] font-mono">
                              #{i + 1}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AMENITIES CHECKLIST */}
              {activeTab === "amenities" && (
                <div className="space-y-4">
                  <p className="text-xs text-[#B8A692]">
                    Select which verified inclusions apply to this residence. Checked items are automatically rendered with authentic 3D miniature illustrations on the details page.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {MASTER_AMENITIES_OPTIONS.map((amenity) => {
                      const isSelected = editModalRoom.amenityNames.includes(amenity);
                      return (
                        <div
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") toggleAmenity(amenity);
                          }}
                          className={cn(
                            "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                            isSelected
                              ? "bg-[rgba(229,193,120,0.12)] border-[#E5C178] text-[#FAF4EB]"
                              : "bg-[#140E08] border-[rgba(212,163,89,0.2)] text-[#B8A692] hover:border-[#E5C178]/50"
                          )}
                        >
                          <span className="font-medium text-xs">{amenity}</span>
                          <span
                            className={cn(
                              "w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold",
                              isSelected
                                ? "bg-gradient-to-r from-[#E5C178] to-[#C69344] text-[#140E08]"
                                : "border border-[rgba(212,163,89,0.3)] text-transparent"
                            )}
                          >
                            ✓
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: NEARBY LANDMARKS */}
              {activeTab === "landmarks" && (
                <div className="space-y-4">
                  <p className="text-xs text-[#B8A692]">
                    Set the top 4 nearby hospitals, monuments, or transport links shown in the Location section.
                  </p>

                  <div className="space-y-3">
                    {editModalRoom.landmarks.map((lm, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#140E08] border border-[rgba(212,163,89,0.2)] grid grid-cols-1 sm:grid-cols-3 gap-2"
                      >
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-[#B8A692] block mb-0.5">
                            Landmark #{idx + 1} Name
                          </label>
                          <input
                            type="text"
                            value={lm.name}
                            onChange={(e) => {
                              const updated = [...editModalRoom.landmarks];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setEditModalRoom({ ...editModalRoom, landmarks: updated });
                            }}
                            className="w-full bg-[#16100B] border border-[rgba(212,163,89,0.25)] rounded-lg px-2.5 py-1.5 text-[#FAF4EB] text-xs focus:border-[#E5C178] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#B8A692] block mb-0.5">
                            Distance &amp; Time
                          </label>
                          <input
                            type="text"
                            value={`${lm.dist} (${lm.time})`}
                            onChange={(e) => {
                              const updated = [...editModalRoom.landmarks];
                              const val = e.target.value;
                              const parts = val.split("(");
                              const dist = parts[0]?.trim() || "1 km";
                              const time = parts[1]?.replace(")", "").trim() || "5 mins";
                              updated[idx] = { ...updated[idx], dist, time };
                              setEditModalRoom({ ...editModalRoom, landmarks: updated });
                            }}
                            className="w-full bg-[#16100B] border border-[rgba(212,163,89,0.25)] rounded-lg px-2.5 py-1.5 text-[#FAF4EB] text-xs focus:border-[#E5C178] focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[rgba(212,163,89,0.2)] shrink-0 bg-[#16100B] flex items-center justify-between">
              <span className="text-[11px] text-[#B8A692]">
                Changes sync immediately to Supabase database.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalRoom(null)}
                  className="px-4 py-2 rounded-xl bg-[#221810] text-[#B8A692] hover:text-[#FAF4EB] border border-[rgba(212,163,89,0.2)] text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveModal}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-110 text-[#140E08] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#E5C178]/20 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CUSTOM UNIT CATEGORY (e.g. 5 BHK)             */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E0A07]/85 backdrop-blur-md p-4 overflow-y-auto">
          <div role="dialog" aria-modal="true" aria-labelledby="add-residence-title" className="bg-[#16100B] border border-[rgba(212,163,89,0.3)] rounded-3xl p-6 max-h-[90vh] overflow-y-auto max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(212,163,89,0.2)] pb-3">
              <h3 id="add-residence-title" className="font-heading text-lg font-normal text-[#FAF4EB] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#E5C178]" />
                <span>Add Residence to Inventory</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add residence form"
                className="text-[#B8A692] hover:text-[#FAF4EB] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addFormError && (
              <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                {addFormError}
              </p>
            )}

            <form onSubmit={handleCreateUnit} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="new-residence-title" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                  Residence Title
                </label>
                <input
                  id="new-residence-title"
                  type="text"
                  required
                  maxLength={100}
                  value={newUnitForm.title}
                  onChange={(e) => setNewUnitForm({ ...newUnitForm, title: e.target.value })}
                  className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-residence-category" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                    Category
                  </label>
                  <select
                    id="new-residence-category"
                    value={newUnitForm.category}
                    onChange={(e) =>
                      setNewUnitForm({
                        ...newUnitForm,
                        category: e.target.value as RoomDetail["category"] | "",
                      })
                    }
                    className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="5BHK">5 BHK</option>
                    <option value="4BHK">4 BHK</option>
                    <option value="3BHK">3 BHK</option>
                    <option value="2BHK">2 BHK</option>
                    <option value="1BHK">1 BHK</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="new-residence-slug" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                    URL Identifier (Slug)
                  </label>
                  <input
                    id="new-residence-slug"
                    type="text"
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    maxLength={60}
                    placeholder="e.g. 5bhk-moghal-pura"
                    value={newUnitForm.slug}
                    onChange={(e) => setNewUnitForm({ ...newUnitForm, slug: e.target.value })}
                    className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] font-mono focus:border-[#E5C178] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-residence-price" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                    Base Price / Night (₹)
                  </label>
                  <input
                    id="new-residence-price"
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={newUnitForm.basePricePerNight ?? ""}
                    onChange={(e) =>
                      setNewUnitForm({ ...newUnitForm, basePricePerNight: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-residence-extra-fee" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                    Extra Person Fee (₹)
                  </label>
                  <input
                    id="new-residence-extra-fee"
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={newUnitForm.extraPersonFeePerNight ?? ""}
                    onChange={(e) =>
                      setNewUnitForm({
                        ...newUnitForm,
                        extraPersonFeePerNight: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="new-residence-base-adults" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                    Base Adults
                  </label>
                  <input
                    id="new-residence-base-adults"
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={newUnitForm.baseAdults ?? ""}
                    onChange={(e) =>
                      setNewUnitForm({ ...newUnitForm, baseAdults: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-residence-max-adults" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                    Max Adults
                  </label>
                  <input
                    id="new-residence-max-adults"
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={newUnitForm.maxAdults ?? ""}
                    onChange={(e) =>
                      setNewUnitForm({ ...newUnitForm, maxAdults: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-residence-max-kids" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                    Max Children
                  </label>
                  <input
                    id="new-residence-max-kids"
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={newUnitForm.maxKids ?? ""}
                    onChange={(e) => setNewUnitForm({ ...newUnitForm, maxKids: e.target.value === "" ? null : Number(e.target.value) })}
                    className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-residence-units" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                    Physical Units
                  </label>
                  <input
                    id="new-residence-units"
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={newUnitForm.totalUnits ?? ""}
                    onChange={(e) =>
                      setNewUnitForm({ ...newUnitForm, totalUnits: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-residence-branch" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                  Branch
                </label>
                <select
                  id="new-residence-branch"
                  required
                  value={newUnitForm.branchSlug}
                  onChange={(e) => setNewUnitForm({ ...newUnitForm, branchSlug: e.target.value })}
                  className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none"
                >
                  <option value="" disabled>Select a branch</option>
                  <option value="barkas-salala">Barkas Salala</option>
                  <option value="moghal-pura">Moghal Pura</option>
                </select>
              </div>

              <div>
                <label htmlFor="new-residence-images" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">
                  Photo URLs <span className="normal-case tracking-normal">(one per line)</span>
                </label>
                <textarea
                  id="new-residence-images"
                  required
                  rows={3}
                  placeholder="Add verified residence image URLs, one per line"
                  value={newUnitForm.imageUrls}
                  onChange={(e) => setNewUnitForm({ ...newUnitForm, imageUrls: e.target.value })}
                  className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] font-mono text-xs focus:border-[#E5C178] focus:outline-none"
                />
              </div>

              <div className="space-y-3 border-t border-[rgba(212,163,89,0.18)] pt-3">
                <div>
                  <label htmlFor="new-residence-short-description" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">Short Description</label>
                  <textarea id="new-residence-short-description" required maxLength={240} rows={2} value={newUnitForm.shortDescription} onChange={(e) => setNewUnitForm({ ...newUnitForm, shortDescription: e.target.value })} className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="new-residence-full-description" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">Full Description</label>
                  <textarea id="new-residence-full-description" required maxLength={2000} rows={4} value={newUnitForm.fullDescription} onChange={(e) => setNewUnitForm({ ...newUnitForm, fullDescription: e.target.value })} className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="new-residence-capacity" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">Guest Capacity Description</label>
                  <input id="new-residence-capacity" type="text" required maxLength={80} placeholder="Enter the verified guest capacity" value={newUnitForm.guestCapacity} onChange={(e) => setNewUnitForm({ ...newUnitForm, guestCapacity: e.target.value })} className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-residence-bedrooms" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">Bedroom Details</label>
                    <input id="new-residence-bedrooms" required maxLength={120} value={newUnitForm.bedrooms} onChange={(e) => setNewUnitForm({ ...newUnitForm, bedrooms: e.target.value })} className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="new-residence-bathrooms" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">Bathroom Details</label>
                    <input id="new-residence-bathrooms" required maxLength={120} value={newUnitForm.bathroom} onChange={(e) => setNewUnitForm({ ...newUnitForm, bathroom: e.target.value })} className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="new-residence-kitchen" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">Kitchen Details</label>
                    <input id="new-residence-kitchen" required maxLength={120} value={newUnitForm.kitchen} onChange={(e) => setNewUnitForm({ ...newUnitForm, kitchen: e.target.value })} className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="new-residence-area" className="text-[11px] uppercase tracking-wider text-[#B8A692] block mb-1">Area (optional)</label>
                    <input id="new-residence-area" type="text" maxLength={40} value={newUnitForm.areaSqFt} onChange={(e) => setNewUnitForm({ ...newUnitForm, areaSqFt: e.target.value })} className="w-full bg-[#140E08] border border-[rgba(212,163,89,0.25)] rounded-xl px-3 py-2 text-[#FAF4EB] focus:border-[#E5C178] focus:outline-none" />
                  </div>
                </div>
                <fieldset>
                  <legend className="text-[11px] uppercase tracking-wider text-[#B8A692] mb-2">Verified Amenities (optional)</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MASTER_AMENITIES_OPTIONS.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-sm text-[#FAF4EB]">
                        <input type="checkbox" checked={newUnitAmenities.includes(amenity)} onChange={(e) => setNewUnitAmenities((current) => e.target.checked ? [...current, amenity] : current.filter((item) => item !== amenity))} className="accent-[#E5C178]" />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(212,163,89,0.2)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#221810] text-[#B8A692] hover:text-[#FAF4EB] border border-[rgba(212,163,89,0.2)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E5C178] to-[#C69344] hover:brightness-110 text-[#140E08] font-bold transition-all shadow-md shadow-[#E5C178]/15 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Creating..." : "Create Residence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
