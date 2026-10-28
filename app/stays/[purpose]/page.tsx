import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PurposePageView } from "@/components/purpose/purpose-page-view";
import { InventoryService } from "@/lib/inventory-service";
import { MOCK_ROOMS } from "@/lib/mock-rooms";
import { PURPOSE_IDS, isPurposeId } from "@/lib/purpose/purpose-services";
import { getPurposePage } from "@/lib/purpose/purpose-pages";

interface StayPurposePageProps {
  params: Promise<{ purpose: string }>;
}

export const instant = false;

export async function generateStaticParams() {
  return PURPOSE_IDS.map((purpose) => ({ purpose }));
}

export async function generateMetadata({ params }: StayPurposePageProps): Promise<Metadata> {
  const { purpose } = await params;
  if (!isPurposeId(purpose)) return { title: "Not Found | Flatel Hospitality" };
  const { seo } = getPurposePage(purpose, "en");
  return { title: seo.title, description: seo.description };
}

export default async function StayPurposePage({ params }: StayPurposePageProps) {
  const { purpose } = await params;
  if (!isPurposeId(purpose)) notFound();

  const liveRooms = await InventoryService.getAllUnits();
  const rooms = liveRooms.length > 0 ? liveRooms : MOCK_ROOMS;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-[#E5C178]/20 selection:text-[#E5C178]">
      <SiteHeader />
      <main className="flex-1 w-full">
        <PurposePageView purpose={purpose} locale="en" rooms={rooms} />
      </main>
      <SiteFooter />
    </div>
  );
}
