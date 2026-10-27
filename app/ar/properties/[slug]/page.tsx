import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RoomDetailView } from "@/components/rooms/room-detail-view";
import { InventoryService } from "@/lib/inventory-service";
import { getRoomById } from "@/lib/mock-rooms";
import { getBranchBySlug } from "@/lib/constants";
import { getLocalizedRoom } from "@/lib/i18n/room-localizer";

interface ArabicPropertyPageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: ArabicPropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomById(slug) || (await InventoryService.getUnitBySlug(slug));

  if (!room) {
    const branch = getBranchBySlug(slug);
    if (branch) {
      return {
        title: `فرع ${branch.name} | ضيافة فلاتيل`,
        description: `استكشف شقق فندقية مفروشة في فرع ضيافة فلاتيل ${branch.name}. ${branch.address}.`,
      };
    }
    return {
      title: "العقار غير موجود | ضيافة فلاتيل",
      description: "استكشف شققنا الفندقية المفروشة في حيدر أباد.",
    };
  }

  const localized = getLocalizedRoom(room, "ar");

  return {
    title: `${localized.title} | ضيافة فلاتيل حيدر أباد`,
    description: localized.shortDescription,
  };
}

export async function generateStaticParams() {
  return [
    { slug: "1bhk" },
    { slug: "2bhk" },
    { slug: "3bhk" },
    { slug: "4bhk" },
  ];
}

export default async function ArabicPropertyPage({ params }: ArabicPropertyPageProps) {
  const { slug } = await params;
  const rawRoom = (await InventoryService.getUnitBySlug(slug)) || getRoomById(slug);

  if (!rawRoom) {
    const branch = getBranchBySlug(slug);
    if (branch) {
      permanentRedirect(`/ar/branches/${slug}`);
    }
    notFound();
  }

  const room = getLocalizedRoom(rawRoom, "ar");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary font-arabic">
      <SiteHeader />
      <main className="flex-1 w-full">
        <RoomDetailView room={room} requestedId={slug} />
      </main>
      <SiteFooter />
    </div>
  );
}
