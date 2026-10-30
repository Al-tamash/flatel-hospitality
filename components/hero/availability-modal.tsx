"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { X, Phone, MessageSquare, ExternalLink, Sparkles } from "lucide-react";
import { WHATSAPP_CONFIG, CONTACT_PHONE, formatPrice, getBranchBySlug } from "@/lib/constants";
import type { RoomDetail } from "@/lib/mock-rooms";
import type { BranchFilter } from "./branch-selector";
import type { FlatTypeFilter } from "./flat-type-selector";

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: Date | null;
  checkOut: Date | null;
  adults?: number | null;
  childrenCount?: number;
  branch?: BranchFilter | null;
  flatType?: FlatTypeFilter | null;
  purpose?: string | null;
}

interface FlatListing {
  id: string;
  slug: string;
  name: string;
  type: string;
  branchSlug: "barkas-salala" | "moghal-pura";
  branchName: string;
  pricePerNight: number;
  baseAdults: number;
  maxAdults: number;
  maxChildren: number | null;
  description: string;
  features: string[];
  imageUrl: string;
}

function mapRoomToFlatListing(room: RoomDetail): FlatListing {
  const branchObj = room.branchSlug ? getBranchBySlug(room.branchSlug) : undefined;
  return {
    id: `${room.slug}-flat`,
    slug: room.slug,
    name: room.title,
    type: `${room.type} Flat`,
    branchSlug: (room.branchSlug || "moghal-pura") as "barkas-salala" | "moghal-pura",
    branchName: branchObj ? branchObj.name : "Hyderabad",
    pricePerNight: room.basePricePerNight,
    baseAdults: room.baseAdults,
    maxAdults: room.maxAdults,
    maxChildren: room.maxChildren,
    description: room.shortDescription,
    features: room.amenities?.slice(0, 4).map((a) => a.name) || [],
    imageUrl: room.gallery?.[0]?.url || `/images/flats/flat-${room.slug}.jpg`,
  };
}

export function AvailabilityModal({
  isOpen,
  onClose,
  checkIn,
  checkOut,
  adults = null,
  childrenCount = 0,
  branch = null,
  flatType = null,
  purpose = null,
}: AvailabilityModalProps) {
  // Prevent background scrolling
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const [flats, setFlats] = React.useState<FlatListing[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inventoryError, setInventoryError] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) return;
      setIsLoading(true);
      setInventoryError(false);
      fetch("/api/inventory")
        .then((res) => {
          if (!res.ok) throw new Error("Could not load inventory");
          return res.json();
        })
        .then((data) => {
          if (!data.success || !Array.isArray(data.units)) throw new Error("Invalid inventory response");
          if (isMounted) setFlats(data.units.map(mapRoomToFlatListing));
        })
        .catch(() => { if (isMounted) setInventoryError(true); })
        .finally(() => { if (isMounted) setIsLoading(false); });
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const nights = checkIn && checkOut ? Math.max(1, differenceInDays(checkOut, checkIn)) : 1;

  const branchLabels: Record<string, string> = {
    all: "All Branches",
    "barkas-salala": "Barkas Salala",
    "moghal-pura": "Moghal Pura",
  };

  const purposeLabels: Record<string, string> = {
    medical: "Hospital & Medical Stay (Medistay)",
    tourism: "Tourism & Heritage (Wanderer)",
    corporate: "Corporate & Executive Stay",
    family: "Family Vacation & Long Stay",
  };

  // Inventory filtering
  const matchingFlats = flats.filter((flat) => {
    const matchesAdults = adults === null || flat.maxAdults >= adults;
    const matchesKids = childrenCount === 0 || flat.maxChildren === null || flat.maxChildren >= childrenCount;
    const matchesBranch = !branch || branch === "all" || flat.branchSlug === branch;
    const matchesType = !flatType || flatType === "any" || flat.slug === flatType;
    return matchesAdults && matchesKids && matchesBranch && matchesType;
  });

  const branchDisplay = branch ? branchLabels[branch] || "All Branches" : "Any Branch";
  const datesDisplay =
    checkIn && checkOut
      ? `${format(checkIn, "d MMM")} – ${format(checkOut, "d MMM yyyy")} (${nights}N)`
      : "Dates not selected";
  const guestsDisplay =
    adults !== null
      ? `${adults} ${adults === 1 ? "Adult" : "Adults"}${childrenCount ? `, ${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}` : ""}`
      : "Guests not selected";
  const flatTypeDisplay =
    flatType && flatType !== "any" ? flatType.toUpperCase() : "Any Flat Type";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="availability-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-canvas/88 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative animate-in zoom-in-95 duration-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-raised/95 backdrop-blur-xl border border-line text-fg shadow-2xl p-4 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line-soft">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-xs uppercase tracking-[0.18em] font-sans font-semibold text-gold">
                Matching Flat Inventory
              </span>
            </div>
            <h2
              id="availability-modal-title"
              className="font-heading text-fg mt-1 heading-section"
            >
              Available Flat Categories
            </h2>
            <p className="text-xs font-sans text-fg-muted mt-1">
              Direct booking inquiry • 20% online advance deposit to reserve • 80% on arrival
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-line bg-surface/70 text-fg hover:text-gold hover:border-gold transition-colors focus:outline-none cursor-pointer"
            aria-label="Close search results"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Applied Filters Strip */}
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-line-soft text-xs font-sans">
          <span className="text-fg-muted">Criteria:</span>
          <span className="px-2.5 py-1 rounded-md bg-surface/70 border border-line-soft text-fg">
            {branchDisplay}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface/70 border border-line-soft text-fg">
            {datesDisplay}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface/70 border border-line-soft text-fg">
            {guestsDisplay}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface/70 border border-line-soft text-fg">
            {flatTypeDisplay}
          </span>
          {purpose && purpose !== "all" && purposeLabels[purpose] && (
            <span className="px-2.5 py-1 rounded-md bg-gold/15 border border-gold/40 text-gold font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{purposeLabels[purpose]}</span>
            </span>
          )}
        </div>

        {/* Results Count */}
        <div className="py-3 text-xs text-fg-muted">
          Found <strong className="text-fg font-medium">{matchingFlats.length}</strong> available flat {matchingFlats.length === 1 ? "option" : "options"}
        </div>

        {/* Flat Cards List */}
        <div className="space-y-4">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-fg-muted" role="status">Loading current residence options…</p>
          ) : inventoryError ? (
            <div className="p-8 text-center rounded-xl bg-surface/70 border border-line-soft">
              <p className="text-sm font-sans text-fg">Current availability could not be checked.</p>
              <p className="text-xs font-sans text-fg-muted mt-2">Please try again shortly or contact Flatel directly.</p>
            </div>
          ) : matchingFlats.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface/70 border border-line-soft">
              <p className="text-sm font-sans text-fg">
                No flats match your exact combination of branch, flat type, or guest count.
              </p>
              <p className="text-xs font-sans text-fg-muted mt-2">
                Try selecting &ldquo;All Branches&rdquo; or &ldquo;Any flat&rdquo; to explore all available residences.
              </p>
            </div>
          ) : (
            matchingFlats.map((flat) => {
              const estimatedTotal = checkIn && checkOut ? flat.pricePerNight * nights : null;
              const purposeText = purpose && purpose !== "all" && purposeLabels[purpose] ? ` for ${purposeLabels[purpose]}` : "";
              const whatsappMessage = `Hello FLATEL Hospitality, I would like to inquire about booking the ${flat.name} at ${flat.branchName}${purposeText}${checkIn && checkOut ? ` for ${format(checkIn, "d MMM yyyy")} to ${format(checkOut, "d MMM yyyy")} (${nights} nights)` : ""}${adults !== null ? ` for ${adults} adults${childrenCount ? ` and ${childrenCount} children` : ""}` : ""}. Is this available?`;
              const inquiryUrl = WHATSAPP_CONFIG.getUrl(whatsappMessage);

              const detailParams = new URLSearchParams();
              if (checkIn) detailParams.set("checkIn", format(checkIn, "yyyy-MM-dd"));
              if (checkOut) detailParams.set("checkOut", format(checkOut, "yyyy-MM-dd"));
              if (adults !== null && adults !== undefined) detailParams.set("adults", adults.toString());
              if (childrenCount > 0) detailParams.set("kids", childrenCount.toString());
              if (purpose && purpose !== "all") detailParams.set("purpose", purpose);
              const detailQueryStr = detailParams.toString();
              const flatDetailUrl = `/properties/${flat.slug}${detailQueryStr ? `?${detailQueryStr}` : ""}`;

              return (
                <div
                  key={flat.id}
                  className="p-4 sm:p-5 rounded-xl bg-surface/70 border border-line hover:border-gold/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left Thumbnail & Info */}
                    <div className="flex gap-3.5">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-line-soft">
                        <Image
                          src={flat.imageUrl}
                          alt={flat.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium text-gold px-2 py-0.5 rounded-full bg-gold/10 border border-gold/25">
                            {flat.branchName}
                          </span>
                          <span className="text-xs font-mono text-fg-muted">
                            Up to {flat.maxAdults} adults
                          </span>
                        </div>
                        <h3 className="font-heading text-lg sm:text-xl font-medium text-fg mt-1">
                          {flat.name}
                        </h3>
                        <p className="text-xs font-sans text-fg-muted mt-1 max-w-md line-clamp-2">
                          {flat.description}
                        </p>
                      </div>
                    </div>

                    {/* Right Rate */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs text-fg-muted">Standard Rate</div>
                      <div className="font-mono text-lg sm:text-xl font-bold text-gold">
                        {formatPrice(flat.pricePerNight)}
                        <span className="text-xs text-fg-muted font-normal"> / night</span>
                      </div>
                      {estimatedTotal !== null && (
                        <div className="text-xs font-mono text-fg-muted mt-0.5">
                          Est. Total: {formatPrice(estimatedTotal)} ({nights}N)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-line-soft">
                    {flat.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-xs font-sans px-2 py-0.5 rounded-sm bg-raised/60 text-fg-muted border border-line-soft"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-4">
                    <a
                      href={inquiryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 min-h-[40px] px-3 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-deep hover:brightness-105 text-ink font-sans font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Inquire via WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${CONTACT_PHONE.replace(/[^0-9+]/g, "")}`}
                      className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 rounded-lg bg-raised/60 hover:bg-raised-hover/80 border border-line-soft text-fg font-sans font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Call hotline"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold" />
                      <span>{CONTACT_PHONE}</span>
                    </a>

                    <Link
                      href={flatDetailUrl}
                      onClick={onClose}
                      className="w-full sm:w-auto min-h-[40px] px-3 py-2 rounded-lg bg-raised/60 hover:bg-raised-hover/80 border border-line-soft text-fg-muted hover:text-fg font-sans text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
